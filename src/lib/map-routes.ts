import type { MapPointState, MapRoute } from "@/components/map/route-map";
import { CITY_COORDS, ORIGIN_COORDS, VEHICLE_POSITIONS, driverById, type Load } from "./demo-data";

/** Cores das linhas por carga, na ordem da paleta (sem Ember, que é do veículo). */
const LINE_COLORS = ["#3D3BE6", "#0B5A3E", "#8BBE67", "#079A2E", "#1F2826"];

export function loadToMapRoute(load: Load, i = 0): MapRoute {
  const nextIdx = load.stops.findIndex((s) => s.status !== "delivered");
  const state = (s: Load["stops"][number], idx: number): MapPointState =>
    s.status === "delivered" ? "done" : s.status === "incident" ? "incident" : s.status === "at_risk" ? "late" : idx === nextIdx ? "next" : "pending";
  const pos = VEHICLE_POSITIONS[load.code];
  const driver = driverById(load.driverId);
  return {
    code: load.code,
    color: LINE_COLORS[i % LINE_COLORS.length],
    href: `/cargas/${load.code}`,
    points: [
      { at: ORIGIN_COORDS, label: `${load.origin} · doca ${load.dock}`, state: "origin" },
      ...load.stops.filter((s) => CITY_COORDS[s.city]).map((s, idx) => ({ at: CITY_COORDS[s.city], label: `${s.customer} · ${s.city}`, state: state(s, idx) })),
    ],
    vehicle: pos
      ? { at: pos.at, label: `${load.vehiclePlate} · ${driver?.name ?? ""} · ${pos.speed} km/h · ${pos.when}` }
      : undefined,
  };
}
