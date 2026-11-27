import type { CSSProperties } from "react";

/**
 * Símbolo PLEIONE: as sete colunas do ORION (mesmas larguras e cortes) deitadas como raios
 * em volta de um centro vazio (o CD), repetidas 3 vezes = 21 raios.
 * Geometria fixa: não redesenhe à mão, use <PleioneMark />.
 */
export const ORION_COLUMNS: readonly (readonly [number, readonly (readonly [number, number])[]])[] = [
  [0.15, [[-0.3, -0.06], [0.04, 0.34]]],
  [0.19, [[-0.58, -0.14], [-0.04, 0.58]]],
  [0.13, [[-0.8, -0.4], [-0.3, 0.22], [0.32, 0.8]]],
  [0.17, [[-0.86, 0.08], [0.18, 0.86]]],
  [0.1, [[-0.78, -0.16], [-0.06, 0.78]]],
  [0.07, [[-0.62, 0.14], [0.24, 0.62]]],
  [0.045, [[-0.44, 0.44]]],
];
export const RAYS = 21;
const R_IN = 0.38;
const R_OUT = 0.96;
const W_SCALE = 0.62;
const fx = (n: number) => Number(n.toFixed(4));

/** Trechos de cada raio: [ângulo, [{x, y, w, h}]] em unidades do raio (centro na origem). */
export function pleioneRays(n = RAYS) {
  return Array.from({ length: n }, (_, i) => {
    const [w0, spans] = ORION_COLUMNS[i % 7];
    const lo = spans[0][0];
    const hi = spans[spans.length - 1][1];
    const w = w0 * W_SCALE;
    const segs = spans.map(([a, b]) => {
      const r0 = R_IN + ((R_OUT - R_IN) * (hi - b)) / (hi - lo);
      const r1 = R_IN + ((R_OUT - R_IN) * (hi - a)) / (hi - lo);
      return { x: fx(r0), y: fx(-w / 2), w: fx(r1 - r0), h: fx(w) };
    });
    return { angle: fx((i / n) * 360 - 90), segs };
  });
}

export type MarkMotion = "reveal" | "loading" | "breathe";

export function PleioneMark({
  size = 32,
  rays = RAYS,
  motion,
  className,
  title,
  color = "currentColor",
}: {
  size?: number | string;
  rays?: number;
  motion?: MarkMotion;
  className?: string;
  title?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1 -1 2 2"
      fill={color}
      className={[motion ? `mark-${motion}` : "", className].filter(Boolean).join(" ")}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {pleioneRays(rays).map((r, k) => (
        <g key={k} transform={`rotate(${r.angle})`}>
          <g className="mark-ray" style={{ "--k": k } as CSSProperties}>
            {r.segs.map((s, j) => (
              <rect key={j} x={s.x} y={s.y} width={s.w} height={s.h} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Ícone do app: grafite com o símbolo em menta. */
export function PleioneIcon({ size = 32, motion }: { size?: number; motion?: MarkMotion }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[22%] bg-graphite text-mint" style={{ width: size, height: size }}>
      <PleioneMark size={Math.round(size * 0.78)} rays={size < 24 ? 14 : RAYS} motion={motion} />
    </span>
  );
}

export function PleioneLogo({ size = 30, descriptor = true }: { size?: number; descriptor?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <PleioneIcon size={size + 4} />
      <span className="leading-none">
        <span className="block font-display text-[22px] tracking-tight text-fg lowercase">pleione</span>
        {descriptor ? <span className="mt-0.5 block font-mono text-[10px] text-muted">gestão de transportes</span> : null}
      </span>
    </span>
  );
}
