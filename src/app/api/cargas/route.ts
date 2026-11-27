import { z } from "zod";
import { ORIGIN_COORDS } from "@/lib/demo-data";
import { db } from "@/server/db";
import { geocode, optimize, routeInOrder } from "@/server/routing";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);
const Body = z.object({
  departure: hhmm.default("06:00"),
  /** true: o servidor escolhe a ordem (respeitando janelas). false: usa a ordem enviada (a que o usuário validou). */
  optimize: z.boolean().default(false),
  vehiclePlate: z.string().nullable().optional(),
  stops: z
    .array(
      z.object({
        shipment: z.string().optional(),
        customer: z.string().min(1),
        address: z.string().min(5),
        window: z.tuple([hhmm, hhmm]).nullable().optional(),
        serviceMin: z.number().min(0).max(240).default(20),
        at: z.tuple([z.number(), z.number()]).optional(),
      }),
    )
    .min(1)
    .max(25),
});

/** "Av. X, 100, Sorocaba, SP" → "Sorocaba · SP" */
function cityOf(address: string) {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2 && /^[A-Z]{2}$/.test(parts[parts.length - 1])) return `${parts[parts.length - 2]} · ${parts[parts.length - 1]}`;
  return parts[parts.length - 1] ?? address;
}

/**
 * POST /api/cargas — cria a carga validada: traça a rota pela estrada no servidor (a fonte da
 * verdade), grava carga, paradas e traçado, e marca os pedidos do ORION como "em carga".
 */
export async function POST(req: Request) {
  const sql = db();
  if (!sql) return Response.json({ error: "Banco não configurado (DATABASE_URL)." }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dados da carga inválidos." }, { status: 400 });
  const { departure, stops, vehiclePlate } = parsed.data;

  try {
    // pedidos do ORION: precisam existir e estar livres
    const codes = stops.map((s) => s.shipment).filter((c): c is string => !!c);
    const ships = codes.length ? await sql`select * from tms.shipments where order_code = any(${codes})` : [];
    const busy = ships.filter((s) => s.status !== "ready");
    if (busy.length) {
      return Response.json(
        { error: `Pedido ${busy.map((s) => s.order_code).join(", ")} não está pronto para carregar (aguardando conferência ou já em outra carga).` },
        { status: 409 },
      );
    }
    if (ships.length !== codes.length) return Response.json({ error: "Algum pedido não foi encontrado." }, { status: 404 });

    const pts: [number, number][] = [];
    for (const s of stops) {
      const at = s.at ?? (await geocode(s.address))?.at;
      if (!at) return Response.json({ error: `Endereço não encontrado: ${s.address}` }, { status: 422 });
      pts.push(at);
    }
    const route = parsed.data.optimize
      ? await optimize(ORIGIN_COORDS, pts, stops.map((s) => ({ window: s.window ?? null, serviceMin: s.serviceMin })), departure)
      : await routeInOrder(ORIGIN_COORDS, pts);
    const ordered = route.order.map((i) => ({ stop: stops[i], at: pts[i], ship: ships.find((x) => x.order_code === stops[i].shipment) }));

    const vehicle = vehiclePlate ? (await sql`select * from tms.vehicles where plate = ${vehiclePlate}`)[0] : null;
    const totals = ordered.reduce(
      (t, o) => ({
        kg: t.kg + Number(o.ship?.weight_kg ?? 0),
        m3: t.m3 + Number(o.ship?.volume_m3 ?? 0),
        nf: t.nf + Number(o.ship?.invoice_value ?? 0),
      }),
      { kg: 0, m3: 0, nf: 0 },
    );
    const [{ n }] = await sql`select nextval('tms.load_code_seq')::int as n`;
    const code = `CG-${String(n).padStart(5, "0")}`;
    const last = ordered[ordered.length - 1];
    const geometry = { coords: route.coords, stopIdx: route.stopIdx, legs: route.legs, km: Math.round(route.km), min: route.min };

    await sql.transaction([
      sql`insert into tms.loads (code, origin, destination, km, departure, status, vehicle_plate, carrier_id, dock, wave, weight_kg, volume_m3, invoice_value, freight, route)
          values (${code}, 'CD Guarulhos · SP', ${cityOf(last.stop.address)}, ${route.km}, ${departure}, 'planned', ${vehicle?.plate ?? null},
                  ${vehicle?.carrier_id ?? "own"}, 'D-01', ${ordered.find((o) => o.ship)?.ship?.wave ?? ""}, ${totals.kg}, ${totals.m3}, ${totals.nf}, 0, ${JSON.stringify(geometry)})`,
      ...ordered.map(
        (o, k) =>
          sql`insert into tms.load_stops (load_code, seq, customer, city, address, "window", invoice, volumes, weight_kg, status, lat, lng)
              values (${code}, ${k + 1}, ${o.stop.customer}, ${o.ship?.city ?? cityOf(o.stop.address)}, ${o.stop.address},
                      ${o.stop.window ? `${o.stop.window[0].replace(":00", "h")}–${o.stop.window[1].replace(":00", "h")}` : "sem janela"},
                      '', ${o.ship?.volumes ?? 0}, ${o.ship?.weight_kg ?? 0}, 'pending', ${o.at[0]}, ${o.at[1]})`,
      ),
      sql`update tms.shipments set status = 'assigned', load_code = ${code} where order_code = any(${codes})`,
    ]);

    return Response.json({ code, km: route.km, stops: ordered.length }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Falha ao criar a carga." }, { status: 502 });
  }
}
