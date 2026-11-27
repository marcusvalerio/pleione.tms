import type { MapPointState, MapRoute } from "@/components/map/route-map";
import { CITY_COORDS, ORIGIN_COORDS, VEHICLE_POSITIONS, driverById, type Load } from "./demo-data";
import GEOMETRY from "./route-geometry.json";

export interface RouteGeometry {
  coords: [number, number][];
  stopIdx: number[];
  legs: { km: number; min: number }[];
  km: number;
  min: number;
}

/** Traçado pela estrada (OSRM/OpenStreetMap), gerado por scripts/routes.ts. */
export function routeGeometry(code: string): RouteGeometry | null {
  return ((GEOMETRY as unknown as Record<string, RouteGeometry>)[code]) ?? null;
}

/** Cores das linhas por carga, na ordem da paleta (sem Ember, que é do veículo). */
const LINE_COLORS = ["#3D3BE6", "#0B5A3E", "#079A2E", "#8BBE67", "#1F2826"];

export function loadToMapRoute(load: Load, i = 0): MapRoute {
  const nextIdx = load.stops.findIndex((s) => s.status !== "delivered");
  const state = (s: Load["stops"][number], idx: number): MapPointState =>
    s.status === "delivered" ? "done" : s.status === "incident" ? "incident" : s.status === "at_risk" ? "late" : idx === nextIdx ? "next" : "pending";
  const geo = routeGeometry(load.code);
  const pos = VEHICLE_POSITIONS[load.code];
  const driver = driverById(load.driverId);

  // parada = ponto do traçado (já encaixado na via); sem traçado, usa a coordenada da cidade
  const at = (k: number): [number, number] => (geo ? geo.coords[geo.stopIdx[k]] : k === 0 ? ORIGIN_COORDS : CITY_COORDS[load.stops[k - 1].city]);

  let vehicleIdx: number | undefined;
  if (geo && pos) {
    const a = geo.stopIdx[pos.leg];
    const b = geo.stopIdx[pos.leg + 1] ?? a;
    vehicleIdx = a + Math.round((b - a) * pos.progress);
  }

  return {
    code: load.code,
    color: LINE_COLORS[i % LINE_COLORS.length],
    href: `/cargas/${load.code}`,
    path: geo?.coords,
    traveledTo: vehicleIdx ?? (geo ? geo.stopIdx[Math.max(0, nextIdx === -1 ? load.stops.length : nextIdx)] : undefined),
    points: [
      { at: at(0), label: `${load.origin} · doca ${load.dock}`, state: "origin" },
      ...load.stops.map((s, idx) => ({ at: at(idx + 1), label: `${s.customer} · ${s.city}`, state: state(s, idx) })),
    ],
    vehicle:
      pos && geo && vehicleIdx !== undefined
        ? { at: geo.coords[vehicleIdx], label: `${load.vehiclePlate} · ${driver?.name ?? ""} · ${pos.speed} km/h · sinal ${pos.when}` }
        : undefined,
  };
}
