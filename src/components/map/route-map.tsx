"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPointState = "origin" | "done" | "next" | "late" | "incident" | "pending";

export interface MapRoute {
  code: string;
  /** Cor da linha (token CSS ou hex). */
  color: string;
  points: { at: [number, number]; label: string; state: MapPointState }[];
  /** Traçado pela estrada. Sem ele, as paradas são ligadas em linha reta. */
  path?: [number, number][];
  /** Índice do traçado até onde o veículo já passou (linha cheia até aqui, tracejada depois). */
  traveledTo?: number;
  vehicle?: { at: [number, number]; label: string };
  href?: string;
}

const PIN: Record<MapPointState, { bg: string; border: string; size: number }> = {
  origin: { bg: "var(--fg)", border: "var(--fg)", size: 14 },
  done: { bg: "var(--route)", border: "var(--route)", size: 12 },
  next: { bg: "var(--surface)", border: "var(--link)", size: 12 },
  late: { bg: "var(--surface)", border: "var(--warn)", size: 12 },
  incident: { bg: "var(--crit)", border: "var(--crit)", size: 12 },
  pending: { bg: "var(--surface)", border: "var(--muted)", size: 11 },
};

/** Base do OpenStreetMap; o tom da marca (e o modo escuro) vem de filtro CSS em .pleione-map. */
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Mapa no estilo PLEIONE: base cartográfica neutra (CARTO/OpenStreetMap), rotas como linha
 * contínua e paradas quadradas. O veículo aparece como um quadrado Ember com o código da carga.
 * As linhas ligam as paradas em sequência; o traçado por estrada chega com o motor de roteirização.
 */
export function RouteMap({ routes, height = 420, label }: { routes: MapRoute[]; height?: number; label: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: LeafletMap | null = null;
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, zoomSnap: 0.25 });
      L.tileLayer(TILE_URL, {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      for (const r of routes) {
        let traveled: [number, number][];
        let ahead: [number, number][];
        if (r.path?.length) {
          const cut = Math.min(r.path.length - 1, Math.max(0, r.traveledTo ?? 0));
          traveled = r.path.slice(0, cut + 1);
          ahead = r.path.slice(cut);
        } else {
          const latlngs = r.points.map((p) => p.at);
          const lastDone = r.points.reduce((idx, p, i) => (p.state === "done" || p.state === "origin" ? i : idx), 0);
          traveled = r.vehicle ? [...latlngs.slice(0, lastDone + 1), r.vehicle.at] : latlngs.slice(0, lastDone + 1);
          ahead = r.vehicle ? [r.vehicle.at, ...latlngs.slice(lastDone + 1)] : latlngs.slice(lastDone);
        }
        // contorno claro por baixo para a linha se destacar da base do mapa
        L.polyline(r.path ?? r.points.map((p) => p.at), { color: "#FFFAF3", weight: 7, opacity: 0.75, interactive: false }).addTo(map);
        if (ahead.length > 1) L.polyline(ahead, { color: r.color, weight: 3, opacity: 0.85, dashArray: "2 7", lineCap: "square" }).addTo(map);
        if (traveled.length > 1) L.polyline(traveled, { color: r.color, weight: 4.5, opacity: 1 }).addTo(map);
        r.path?.forEach((p) => bounds.extend(p));

        r.points.forEach((p, i) => {
          const s = PIN[p.state];
          const icon = L.divIcon({
            className: "",
            html: `<span style="display:block;width:${s.size}px;height:${s.size}px;background:${s.bg};border:3px solid ${s.border};box-sizing:border-box"></span>`,
            iconSize: [s.size, s.size],
            iconAnchor: [s.size / 2, s.size / 2],
          });
          L.marker(p.at, { icon, title: p.label, keyboard: true })
            .bindTooltip(`<b>${i === 0 ? "" : `${i}. `}${p.label}</b><br><span style="font-family:var(--font-mono);font-size:11px">${r.code}</span>`, { direction: "top", offset: [0, -6] })
            .addTo(map!);
          bounds.extend(p.at);
        });

        if (r.vehicle) {
          const icon = L.divIcon({
            className: "",
            html: `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;background:#FF5F1F;color:#1F2826;font:700 11px var(--font-mono),monospace;padding:3px 6px;border:2px solid #1F2826;transform:translate(-50%,-50%)">▶ ${r.code}</span>`,
            iconSize: [0, 0],
          });
          const m = L.marker(r.vehicle.at, { icon, zIndexOffset: 1000, title: r.vehicle.label }).bindTooltip(r.vehicle.label, { direction: "top", offset: [0, -14] }).addTo(map);
          if (r.href) m.on("click", () => (window.location.href = r.href!));
          bounds.extend(r.vehicle.at);
        }
      }
      const fit = () => {
        map?.invalidateSize();
        if (bounds.isValid()) map?.fitBounds(bounds, { padding: [28, 28], maxZoom: 11 });
      };
      fit();
      // o contêiner pode ainda não ter o tamanho final (fontes, layout): reajusta quando mudar
      observer = new ResizeObserver(fit);
      observer.observe(el.current);
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
    };
  }, [routes]);

  return (
    <div
      ref={el}
      role="region"
      aria-label={label}
      className="pleione-map relative z-0 w-full overflow-hidden rounded-md border border-line bg-subtle"
      style={{ height }}
    />
  );
}
