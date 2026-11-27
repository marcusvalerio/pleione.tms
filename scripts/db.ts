/**
 * Banco do PLEIONE (Neon/Postgres).
 *   npx tsx --env-file=.env.local scripts/db.ts migrate   aplica db/migrations/*.sql que faltam
 *   npx tsx --env-file=.env.local scripts/db.ts seed      carrega os dados de demonstração (só se o banco estiver vazio)
 */
import { readdirSync, readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";
import {
  CARRIERS,
  CITY_COORDS,
  DELIVERIES_14D,
  DRIVERS,
  FREIGHT_TABLES,
  INCIDENTS,
  LOADS,
  SHIPMENTS,
  TODAY,
  VEHICLES,
  VEHICLE_POSITIONS,
} from "../src/lib/demo-data";
import GEOMETRY from "../src/lib/route-geometry.json";
import { hashPassword } from "../src/server/auth/password";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Defina DATABASE_URL (ex.: no .env.local).");
const pool = new Pool({ connectionString: url });
const dir = new URL("../db/migrations/", import.meta.url);

async function migrate() {
  await pool.query("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  const done = new Set((await pool.query("select name from public.schema_migrations")).rows.map((r) => r.name));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(readFileSync(new URL(file, dir), "utf8"));
      await client.query("insert into public.schema_migrations(name) values ($1)", [file]);
      await client.query("commit");
      console.log(`aplicada: ${file}`);
    } catch (e) {
      await client.query("rollback");
      throw e;
    } finally {
      client.release();
    }
  }
}

/** Empresa e usuários de demonstração (um por perfil). Senha de todos: pleione-demo. */
async function seedAuth() {
  const { rows } = await pool.query("select count(*)::int as n from tms.companies");
  if (rows[0].n > 0) return console.log("usuários já existem; seed de acesso ignorado");
  const hash = await hashPassword("pleione-demo");
  const [{ id }] = (
    await pool.query("insert into tms.companies (name, legal_name, document, is_demo) values ($1, $2, $3, true) returning id", [
      "MetalSupply Componentes",
      "MetalSupply Componentes Industriais Ltda.",
      "12345678000190",
    ])
  ).rows;
  const users: [string, string, string][] = [
    ["Renata Alves", "admin@metalsupply.demo", "admin"],
    ["Carla Mendes", "coordenacao@metalsupply.demo", "coordinator"],
    ["Diego Ramos", "programacao@metalsupply.demo", "planner"],
    ["Sofia Lima", "auditoria@metalsupply.demo", "auditor"],
  ];
  for (const [name, email, role] of users)
    await pool.query("insert into tms.users (company_id, name, email, role, password_hash, is_demo) values ($1, $2, $3, $4, $5, true)", [id, name, email, role, hash]);
  console.log("usuários de demonstração criados (senha: pleione-demo)");
}

async function seed() {
  await seedAuth();
  const { rows } = await pool.query("select count(*)::int as n from tms.carriers");
  if (rows[0].n > 0) return console.log("banco já tem dados operacionais; seed ignorado");
  const client = await pool.connect();
  const q = (text: string, values: unknown[]) => client.query(text, values);
  try {
    await client.query("begin");
    for (const c of CARRIERS)
      await q("insert into tms.carriers values ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [c.id, c.name, c.cnpj, c.kind, c.regions, c.otif, c.costPerKg, c.loads30d, c.rntrc]);
    for (const v of VEHICLES)
      await q("insert into tms.vehicles values ($1,$2,$3,$4,$5,$6,$7,$8)", [v.plate, v.type, v.capacityKg, v.capacityM3, v.carrierId, v.status, v.year, v.nextMaintenance]);
    for (const d of DRIVERS)
      await q("insert into tms.drivers values ($1,$2,$3,$4,$5,$6,$7,$8)", [d.id, d.name, d.cnh, d.cnhValid, d.carrierId, d.status, d.phone, d.deliveries30d]);
    for (const t of FREIGHT_TABLES)
      await q("insert into tms.freight_tables values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [
        t.id, t.route, t.origin, t.destination, t.perKg, t.minimum, t.adValorem, t.gris, t.tollPer100kg, t.tdePct, t.tdeMin, t.icms, t.cubage, t.leadDays,
      ]);
    const geo = GEOMETRY as Record<string, { km: number }>;
    for (const l of LOADS) {
      await q(
        `insert into tms.loads (code, origin, destination, km, departure, status, vehicle_plate, driver_id, carrier_id, dock, wave,
           weight_kg, volume_m3, invoice_value, freight, docs, route, vehicle_position)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          l.code, l.origin, l.destination, geo[l.code]?.km ?? l.km, l.departure, l.status, l.vehiclePlate, l.driverId, l.carrierId, l.dock, l.wave,
          l.weightKg, l.volumeM3, l.invoiceValue, l.freight, JSON.stringify(l.docs), geo[l.code] ? JSON.stringify(geo[l.code]) : null,
          VEHICLE_POSITIONS[l.code] ? JSON.stringify(VEHICLE_POSITIONS[l.code]) : null,
        ],
      );
      for (const s of l.stops) {
        const at = CITY_COORDS[s.city];
        await q("insert into tms.load_stops values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [
          l.code, s.seq, s.customer, s.city, s.address, s.window, s.invoice, s.volumes, s.weightKg, s.status, s.time ?? null, s.note ?? null, at?.[0] ?? null, at?.[1] ?? null,
        ]);
      }
    }
    for (const s of SHIPMENTS)
      await q("insert into tms.shipments values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [
        s.order, s.customer, s.city, s.address, s.window[0], s.window[1], s.weightKg, s.volumeM3, s.volumes, s.invoiceValue, s.deadline, s.wave, s.status, s.load ?? null,
      ]);
    for (const i of INCIDENTS) await q("insert into tms.incidents values ($1,$2,$3,$4,$5,$6,$7)", [i.id, i.load, i.stop, i.type, i.opened, i.status, i.detail]);
    const year = TODAY.slice(0, 4);
    for (const d of DELIVERIES_14D) await q("insert into tms.delivery_stats values ($1,$2,$3)", [`${year}-${d.day}`, d.ok, d.late]);
    await client.query("commit");
    console.log("seed carregado");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

const cmd = process.argv[2];
(cmd === "migrate" ? migrate() : cmd === "seed" ? seed() : Promise.reject(new Error("use: migrate | seed")))
  .then(() => pool.end())
  .catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
  });
