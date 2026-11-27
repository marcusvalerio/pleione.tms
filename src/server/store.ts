import "server-only";
import * as demo from "@/lib/demo-data";
import type { Carrier, Driver, Incident, Load, Shipment, Stop, Vehicle } from "@/lib/demo-data";
import type { FreightTable } from "@/lib/freight";
import { db } from "./db";

export interface Store {
  source: "neon" | "demo";
  COMPANY: typeof demo.COMPANY;
  CARRIERS: Carrier[];
  VEHICLES: Vehicle[];
  DRIVERS: Driver[];
  LOADS: Load[];
  SHIPMENTS: Shipment[];
  INCIDENTS: Incident[];
  FREIGHT_TABLES: FreightTable[];
  DELIVERIES_14D: { day: string; ok: number; late: number }[];
  carrierName: (id: string) => string;
  driverById: (id: string | null) => Driver | null;
  vehicleByPlate: (plate: string | null) => Vehicle | null;
  loadByCode: (code: string) => Load | null;
}

const n = (v: unknown) => Number(v);
const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

function withHelpers(base: Omit<Store, "carrierName" | "driverById" | "vehicleByPlate" | "loadByCode">): Store {
  return {
    ...base,
    carrierName: (id) => base.CARRIERS.find((c) => c.id === id)?.name ?? "—",
    driverById: (id) => base.DRIVERS.find((d) => d.id === id) ?? null,
    vehicleByPlate: (p) => base.VEHICLES.find((v) => v.plate === p) ?? null,
    loadByCode: (code) => base.LOADS.find((l) => l.code === code) ?? null,
  };
}

/**
 * Dados da operação. Com DATABASE_URL, lê do Neon; sem ele, usa os dados de demonstração
 * em memória (desenvolvimento sem banco e testes).
 */
export async function getStore(): Promise<Store> {
  const sql = db();
  if (!sql) {
    return withHelpers({
      source: "demo",
      COMPANY: demo.COMPANY,
      CARRIERS: demo.CARRIERS,
      VEHICLES: demo.VEHICLES,
      DRIVERS: demo.DRIVERS,
      LOADS: demo.LOADS,
      SHIPMENTS: demo.SHIPMENTS,
      INCIDENTS: demo.INCIDENTS,
      FREIGHT_TABLES: demo.FREIGHT_TABLES,
      DELIVERIES_14D: demo.DELIVERIES_14D,
    });
  }

  const [carriers, vehicles, drivers, loads, stops, shipments, incidents, tables, stats] = await Promise.all([
    sql`select * from tms.carriers order by kind, name`,
    sql`select * from tms.vehicles order by plate`,
    sql`select * from tms.drivers order by name`,
    sql`select * from tms.loads order by code`,
    sql`select * from tms.load_stops order by load_code, seq`,
    sql`select * from tms.shipments order by deadline, order_code`,
    sql`select * from tms.incidents order by id desc`,
    sql`select * from tms.freight_tables order by id`,
    sql`select * from tms.delivery_stats order by day desc limit 14`,
  ]);

  const stopsBy = new Map<string, Stop[]>();
  for (const s of stops) {
    const list = stopsBy.get(s.load_code) ?? [];
    list.push({
      seq: s.seq,
      customer: s.customer,
      city: s.city,
      address: s.address,
      window: s.window,
      invoice: s.invoice,
      volumes: s.volumes,
      weightKg: n(s.weight_kg),
      status: s.status,
      time: s.time ?? undefined,
      note: s.note ?? undefined,
    });
    stopsBy.set(s.load_code, list);
  }

  return withHelpers({
    source: "neon",
    COMPANY: demo.COMPANY,
    CARRIERS: carriers.map((c) => ({
      id: c.id,
      name: c.name,
      cnpj: c.cnpj,
      kind: c.kind,
      regions: c.regions,
      otif: n(c.otif),
      costPerKg: n(c.cost_per_kg),
      loads30d: c.loads_30d,
      rntrc: c.rntrc,
    })),
    VEHICLES: vehicles.map((v) => ({
      plate: v.plate,
      type: v.type,
      capacityKg: v.capacity_kg,
      capacityM3: n(v.capacity_m3),
      carrierId: v.carrier_id,
      status: v.status,
      year: v.year,
      nextMaintenance: day(v.next_maintenance),
    })),
    DRIVERS: drivers.map((d) => ({
      id: d.id,
      name: d.name,
      cnh: d.cnh,
      cnhValid: day(d.cnh_valid),
      carrierId: d.carrier_id,
      status: d.status,
      phone: d.phone,
      deliveries30d: d.deliveries_30d,
    })),
    LOADS: loads.map((l) => ({
      code: l.code,
      origin: l.origin,
      destination: l.destination,
      km: n(l.km),
      departure: l.departure,
      status: l.status,
      vehiclePlate: l.vehicle_plate,
      driverId: l.driver_id,
      carrierId: l.carrier_id,
      dock: l.dock,
      wave: l.wave,
      weightKg: n(l.weight_kg),
      volumeM3: n(l.volume_m3),
      invoiceValue: n(l.invoice_value),
      freight: n(l.freight),
      docs: l.docs,
      stops: stopsBy.get(l.code) ?? [],
      route: l.route,
      position: l.vehicle_position,
    })),
    SHIPMENTS: shipments.map((s) => ({
      order: s.order_code,
      customer: s.customer,
      city: s.city,
      address: s.address,
      window: [s.window_start, s.window_end] as [string, string],
      weightKg: n(s.weight_kg),
      volumeM3: n(s.volume_m3),
      volumes: s.volumes,
      invoiceValue: n(s.invoice_value),
      deadline: day(s.deadline),
      wave: s.wave,
      status: s.status,
      load: s.load_code ?? undefined,
    })),
    INCIDENTS: incidents.map((i) => ({ id: i.id, load: i.load_code, stop: i.stop, type: i.type, opened: i.opened, status: i.status, detail: i.detail })),
    FREIGHT_TABLES: tables.map((t) => ({
      id: t.id,
      route: t.route,
      origin: t.origin,
      destination: t.destination,
      perKg: n(t.per_kg),
      minimum: n(t.minimum),
      adValorem: n(t.ad_valorem),
      gris: n(t.gris),
      tollPer100kg: n(t.toll_per_100kg),
      tdePct: n(t.tde_pct),
      tdeMin: n(t.tde_min),
      icms: n(t.icms),
      cubage: t.cubage,
      leadDays: t.lead_days,
    })),
    DELIVERIES_14D: stats
      .map((s) => ({ day: day(s.day).slice(5), ok: s.on_time, late: s.late }))
      .reverse(),
  });
}
