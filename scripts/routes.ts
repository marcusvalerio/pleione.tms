/**
 * Gera o traçado pela estrada de cada carga de demonstração (OSRM, dados do OpenStreetMap)
 * e grava em src/lib/route-geometry.json. Rodar de novo quando mudar parada ou coordenada:
 *   npx tsx scripts/routes.ts
 * Na fase com banco, o mesmo cálculo roda no servidor ao criar ou alterar a carga.
 */
import { writeFileSync } from "node:fs";
import { CITY_COORDS, LOADS, ORIGIN_COORDS } from "../src/lib/demo-data";

const OSRM = process.env.OSRM_URL ?? "https://router.project-osrm.org";

interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  legs: { distance: number; duration: number }[];
  distance: number;
  duration: number;
}

async function main() {
  const out: Record<string, unknown> = {};
  for (const load of LOADS) {
    const pts: [number, number][] = [ORIGIN_COORDS, ...load.stops.map((s) => CITY_COORDS[s.city])];
    const path = pts.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const res = await fetch(`${OSRM}/route/v1/driving/${path}?overview=full&geometries=geojson`);
    const json = (await res.json()) as { code: string; routes: OsrmRoute[]; waypoints: { location: [number, number] }[] };
    if (json.code !== "Ok") throw new Error(`${load.code}: ${json.code}`);
    const r = json.routes[0];
    const coords = r.geometry.coordinates.map(([lng, lat]) => [round(lat), round(lng)] as [number, number]);
    // índice de cada parada no traçado (busca em ordem, para rotas que passam duas vezes no mesmo lugar)
    const stopIdx: number[] = [];
    let from = 0;
    for (const [lng, lat] of json.waypoints.map((w) => w.location)) {
      let best = from;
      let bestD = Infinity;
      for (let i = from; i < coords.length; i++) {
        const d = (coords[i][0] - lat) ** 2 + (coords[i][1] - lng) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
        if (d === 0) break;
      }
      stopIdx.push(best);
      from = best;
    }
    // simplifica cada trecho entre paradas separadamente (as paradas ficam fixas no traçado)
    const simple: [number, number][] = [];
    const simpleIdx: number[] = [];
    for (let k = 0; k < stopIdx.length; k++) {
      if (k === 0) {
        simple.push(coords[stopIdx[0]]);
        simpleIdx.push(0);
        continue;
      }
      const seg = simplify(coords.slice(stopIdx[k - 1], stopIdx[k] + 1), TOLERANCE);
      simple.push(...seg.slice(1));
      simpleIdx.push(simple.length - 1);
    }
    out[load.code] = {
      coords: simple,
      stopIdx: simpleIdx,
      legs: r.legs.map((l) => ({ km: Math.round(l.distance / 100) / 10, min: Math.round(l.duration / 60) })),
      km: Math.round(r.distance / 1000),
      min: Math.round(r.duration / 60),
    };
    console.log(`${load.code}: ${coords.length} → ${simple.length} pontos, ${Math.round(r.distance / 1000)} km`);
    await new Promise((ok) => setTimeout(ok, 1200)); // gentileza com o servidor público
  }
  writeFileSync(new URL("../src/lib/route-geometry.json", import.meta.url), JSON.stringify(out));
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

/** Tolerância em graus (~10 m): a linha continua colada na estrada mesmo com zoom de rua. */
const TOLERANCE = 0.0001;

/** Douglas-Peucker iterativo. */
function simplify(pts: [number, number][], tol: number): [number, number][] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = segDist(pts[i], pts[a], pts[b]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function segDist(p: [number, number], a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
main();
