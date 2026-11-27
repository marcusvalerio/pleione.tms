import "server-only";
import { round5, simplify, type LatLng } from "@/lib/geo";
import type { ScheduleStop } from "@/lib/schedule";
import { solve } from "@/lib/solver";

/**
 * Roteirização: endereço → coordenada (Nominatim) e melhor sequência + traçado (OSRM).
 * Os servidores públicos servem para demonstração; em produção aponte GEOCODER_URL e OSRM_URL
 * para instâncias próprias ou um provedor contratado.
 */
const OSRM = process.env.OSRM_URL ?? "https://router.project-osrm.org";
const GEOCODER = process.env.GEOCODER_URL ?? "https://nominatim.openstreetmap.org";
const USER_AGENT = "pleione-tms/0.1 (roteirizacao)";

export interface Geocoded {
  at: LatLng;
  label: string;
  /** "exato" = número/rua; "rua" = só a via; "cidade" = só o município (conferir no mapa). */
  precision: "exato" | "rua" | "cidade";
}

const cache = new Map<string, Geocoded | null>();
let lastCall = 0;

/** Nominatim pede no máximo 1 requisição por segundo. */
async function throttle() {
  const wait = lastCall + 1100 - Date.now();
  if (wait > 0) await new Promise((ok) => setTimeout(ok, wait));
  lastCall = Date.now();
}

export async function geocode(address: string): Promise<Geocoded | null> {
  const key = address.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  await throttle();
  const url = `${GEOCODER}/search?format=jsonv2&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR" } });
  if (!res.ok) throw new Error(`Geocodificação indisponível (${res.status})`);
  const [hit] = (await res.json()) as { lat: string; lon: string; display_name: string; addresstype?: string; address?: { house_number?: string } }[];
  const out: Geocoded | null = hit
    ? {
        at: [round5(Number(hit.lat)), round5(Number(hit.lon))],
        label: hit.display_name,
        precision: hit.address?.house_number ? "exato" : ["city", "town", "municipality", "village", "county", "state"].includes(hit.addresstype ?? "") ? "cidade" : "rua",
      }
    : null;
  cache.set(key, out);
  return out;
}

export interface RoutedPath {
  /** Ordem das paradas (índices na lista enviada, sem a origem). */
  order: number[];
  coords: LatLng[];
  stopIdx: number[];
  legs: { km: number; min: number }[];
  km: number;
  min: number;
}

interface OsrmLeg {
  distance: number;
  duration: number;
}
interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  legs: OsrmLeg[];
  distance: number;
  duration: number;
}

const toPath = (pts: LatLng[]) => pts.map(([lat, lng]) => `${lng},${lat}`).join(";");

/** Traçado pela estrada passando pelos pontos na ordem dada (origem primeiro). */
export async function routeInOrder(origin: LatLng, stops: LatLng[], order = stops.map((_, i) => i)): Promise<RoutedPath> {
  const pts = [origin, ...order.map((i) => stops[i])];
  const res = await fetch(`${OSRM}/route/v1/driving/${toPath(pts)}?overview=full&geometries=geojson`);
  const json = (await res.json()) as { code: string; routes: OsrmRoute[]; waypoints: { location: [number, number] }[] };
  if (json.code !== "Ok") throw new Error(`Não foi possível traçar a rota (${json.code})`);
  return shape(json.routes[0], json.waypoints, order);
}

/**
 * Melhor sequência saindo da origem, respeitando as janelas dos clientes:
 * pega a matriz de tempos e distâncias pela estrada (OSRM table), resolve a ordem
 * (src/lib/solver.ts) e traça a rota final nessa ordem.
 */
export async function optimize(origin: LatLng, stops: LatLng[], sched: ScheduleStop[], departure: string): Promise<RoutedPath & { lateMin: number }> {
  const res = await fetch(`${OSRM}/table/v1/driving/${toPath([origin, ...stops])}?annotations=duration,distance`);
  const json = (await res.json()) as { code: string; durations: (number | null)[][]; distances: (number | null)[][] };
  if (json.code !== "Ok") throw new Error(`Não foi possível calcular as distâncias (${json.code})`);
  const big = 1e6; // par sem ligação pela estrada
  const best = solve({
    durations: json.durations.map((r) => r.map((v) => (v == null ? big : v / 60))),
    distances: json.distances.map((r) => r.map((v) => (v == null ? big : v / 1000))),
    stops: sched,
    departure,
  });
  return { ...(await routeInOrder(origin, stops, best.order)), lateMin: best.lateMin };
}

function shape(r: OsrmRoute, waypoints: { location: [number, number] }[], order: number[]): RoutedPath {
  const raw: LatLng[] = r.geometry.coordinates.map(([lng, lat]) => [round5(lat), round5(lng)]);
  // encontra cada parada no traçado, em ordem, e simplifica trecho a trecho (paradas ficam fixas)
  const idx: number[] = [];
  let from = 0;
  for (const [lng, lat] of waypoints.map((w) => w.location)) {
    let best = from;
    let bestD = Infinity;
    for (let i = from; i < raw.length; i++) {
      const d = (raw[i][0] - lat) ** 2 + (raw[i][1] - lng) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    idx.push(best);
    from = best;
  }
  const coords: LatLng[] = [raw[idx[0]]];
  const stopIdx = [0];
  for (let k = 1; k < idx.length; k++) {
    coords.push(...simplify(raw.slice(idx[k - 1], idx[k] + 1)).slice(1));
    stopIdx.push(coords.length - 1);
  }
  return {
    order,
    coords,
    stopIdx,
    legs: r.legs.map((l) => ({ km: Math.round(l.distance / 100) / 10, min: Math.round(l.duration / 60) })),
    km: Math.round(r.distance / 100) / 10,
    min: Math.round(r.duration / 60),
  };
}
