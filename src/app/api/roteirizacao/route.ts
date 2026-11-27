import { z } from "zod";
import { ORIGIN_COORDS } from "@/lib/demo-data";
import { geocode, optimize, routeInOrder } from "@/server/routing";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);
const Body = z.object({
  mode: z.enum(["optimize", "keep"]),
  departure: hhmm.default("06:00"),
  stops: z
    .array(
      z.object({
        id: z.string(),
        address: z.string().min(5),
        /** Coordenada já conhecida (ex.: pino ajustado à mão); pula a geocodificação. */
        at: z.tuple([z.number(), z.number()]).optional(),
        window: z.tuple([hhmm, hhmm]).nullable().optional(),
        serviceMin: z.number().min(0).max(240).default(20),
      }),
    )
    .min(1)
    .max(25),
});

/**
 * POST /api/roteirizacao
 * Geocodifica os endereços, calcula a melhor sequência respeitando as janelas (mode=optimize) ou mantém a ordem
 * enviada (mode=keep), e devolve o traçado pela estrada. Sempre calcula também a rota na
 * ordem em que as paradas foram informadas, para mostrar o ganho da otimização.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Informe de 1 a 25 paradas com endereço." }, { status: 400 });
  const { mode, stops, departure } = parsed.data;

  try {
    const geo = [];
    for (const s of stops) {
      if (s.at) geo.push({ id: s.id, at: s.at, label: s.address, precision: "exato" as const });
      else {
        const g = await geocode(s.address);
        geo.push(g ? { id: s.id, ...g } : { id: s.id, at: null, label: s.address, precision: null });
      }
    }
    const missing = geo.filter((g) => !g.at).map((g) => g.id);
    if (missing.length) {
      return Response.json({ error: "Não encontramos alguns endereços. Confira número, rua e cidade.", missing, geo }, { status: 422 });
    }
    const pts = geo.map((g) => g.at!) as [number, number][];
    const informed = await routeInOrder(ORIGIN_COORDS, pts);
    const result =
      mode === "optimize"
        ? await optimize(ORIGIN_COORDS, pts, stops.map((s) => ({ window: s.window ?? null, serviceMin: s.serviceMin })), departure)
        : informed;
    return Response.json({
      geo,
      route: result,
      informed: { km: informed.km, min: informed.min },
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Falha ao roteirizar." }, { status: 502 });
  }
}
