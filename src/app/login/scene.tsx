"use client";

import { useEffect, useRef } from "react";

export interface SceneRoute {
  code: string;
  coords: [number, number][];
  stopIdx: number[];
}

/**
 * Fundo do login: a operação "ao vivo". As rotas reais das cargas viram linhas de luz,
 * caminhões (quadrados menta) correm por elas deixando rastro e as paradas acendem quando
 * o caminhão passa. Reage de leve ao mouse. Com "reduzir movimento", desenha um quadro parado.
 */
export function LoginScene({ routes }: { routes: SceneRoute[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !routes.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // limites geográficos de todas as rotas
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const r of routes)
      for (const [la, ln] of r.coords) {
        minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
        minLng = Math.min(minLng, ln); maxLng = Math.max(maxLng, ln);
      }

    let W = 0, H = 0, dpr = 1;
    let proj: (p: [number, number]) => [number, number] = () => [0, 0];
    // comprimento acumulado de cada rota em pixels (para mover os caminhões em velocidade constante)
    let paths: { pts: [number, number][]; acc: number[]; len: number; stops: [number, number][]; stopAt: number[] }[] = [];

    function layout() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas!.clientWidth; H = canvas!.clientHeight;
      canvas!.width = W * dpr; canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
      const gw = (maxLng - minLng) * kx, gh = maxLat - minLat;
      // em tela larga, as rotas ocupam a área à esquerda do cartão de login
      const areaW = W >= 1024 ? W - 460 : W;
      const pad = Math.min(areaW, H) * 0.08;
      const s = Math.min((areaW - pad * 2) / gw, (H - pad * 2) / gh);
      const ox = areaW / 2 - (gw * s) / 2, oy = H / 2 - (gh * s) / 2;
      proj = ([la, ln]) => [ox + (ln - minLng) * kx * s, oy + (maxLat - la) * s];
      paths = routes.map((r) => {
        const pts = r.coords.map(proj);
        const acc = [0];
        for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        return { pts, acc, len: acc[acc.length - 1], stops: r.stopIdx.map((k) => pts[k]), stopAt: r.stopIdx.map((k) => acc[k]) };
      });
    }

    function pointAt(p: (typeof paths)[number], d: number): [number, number] {
      let lo = 0, hi = p.acc.length - 1;
      while (lo < hi) { const m = (lo + hi) >> 1; if (p.acc[m] < d) lo = m + 1; else hi = m; }
      const i = Math.max(1, lo);
      const t = (d - p.acc[i - 1]) / Math.max(1e-6, p.acc[i] - p.acc[i - 1]);
      return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * t, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * t];
    }

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMove = (e: PointerEvent) => { tx = (e.clientX / W - 0.5) * -18; ty = (e.clientY / H - 0.5) * -18; };

    const t0 = performance.now();
    let raf = 0;
    function frame(now: number) {
      const t = reduce ? 9000 : now - t0;
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      ctx!.clearRect(0, 0, W, H);
      ctx!.save();
      ctx!.translate(mx, my);

      // grade de pontos, como um mapa sem mapa
      ctx!.fillStyle = "rgba(215,248,217,0.06)";
      for (let x = (mx % 28) - 28; x < W + 28; x += 28) for (let y = (my % 28) - 28; y < H + 28; y += 28) ctx!.fillRect(x, y, 1.2, 1.2);

      paths.forEach((p, k) => {
        // estrada
        ctx!.beginPath();
        p.pts.forEach(([x, y], i) => (i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y)));
        ctx!.strokeStyle = "rgba(215,248,217,0.16)";
        ctx!.lineWidth = 1.6;
        ctx!.stroke();

        // dois caminhões por rota: percorrem em 16–26 s, com defasagens diferentes
        const period = 16000 + k * 2500;
        for (const off of [0, 0.5]) {
        const d = ((((t + k * 3700) / period + off) % 1) * p.len);
        const trail = Math.min(d, p.len * 0.22);

        // rastro com degradê
        const steps = 40;
        for (let i = 0; i < steps; i++) {
          const a = d - trail + (trail * i) / steps, b = d - trail + (trail * (i + 1)) / steps;
          const [x1, y1] = pointAt(p, Math.max(0, a)), [x2, y2] = pointAt(p, Math.max(0, b));
          ctx!.beginPath(); ctx!.moveTo(x1, y1); ctx!.lineTo(x2, y2);
          ctx!.strokeStyle = `rgba(215,248,217,${(0.65 * (i + 1)) / steps})`;
          ctx!.lineWidth = 2.4;
          ctx!.stroke();
        }

        // paradas: acendem quando o caminhão passa e apagam devagar
        p.stops.forEach(([x, y], j) => {
          if (j === 0) { ctx!.fillStyle = "rgba(215,248,217,.55)"; ctx!.fillRect(x - 4, y - 4, 8, 8); return; }
          const since = d - p.stopAt[j];
          const glow = since >= 0 ? Math.max(0, 1 - since / (p.len * 0.35)) : 0;
          const s = 5 + glow * 3;
          ctx!.fillStyle = glow > 0 ? `rgba(99,196,115,${0.35 + glow * 0.65})` : "rgba(215,248,217,.18)";
          ctx!.fillRect(x - s / 2, y - s / 2, s, s);
          if (glow > 0.6) { ctx!.strokeStyle = `rgba(215,248,217,${(glow - 0.6) * 1.5})`; ctx!.lineWidth = 1; ctx!.strokeRect(x - s, y - s, s * 2, s * 2); }
        });

        // cabeça do caminhão
        const [hx, hy] = pointAt(p, d);
        ctx!.shadowColor = "rgba(215,248,217,.9)";
        ctx!.shadowBlur = 14;
        ctx!.fillStyle = "#D7F8D9";
        ctx!.fillRect(hx - 3.5, hy - 3.5, 7, 7);
        ctx!.shadowBlur = 0;
        }
      });
      ctx!.restore();
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    layout();
    raf = requestAnimationFrame(frame);
    const onResize = () => { layout(); if (reduce) requestAnimationFrame(frame); };
    window.addEventListener("resize", onResize);
    if (!reduce) window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [routes]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
