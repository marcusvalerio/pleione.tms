/**
 * Dados de demonstração (empresa fictícia MetalSupply Componentes).
 * Na próxima fase isso vira banco (Postgres) alimentado pelos eventos do ORION e do ATLAS.
 */
import type { FreightTable } from "./freight";

export const COMPANY = { name: "MetalSupply Componentes", cnpj: "12.345.678/0001-90", demo: true };
export const TODAY = "2026-11-27";

export interface Carrier {
  id: string;
  name: string;
  cnpj: string;
  kind: "own" | "third";
  regions: string;
  otif: number;
  costPerKg: number;
  loads30d: number;
  rntrc: string;
}

export const CARRIERS: Carrier[] = [
  { id: "own", name: "Frota própria MetalSupply", cnpj: "12.345.678/0001-90", kind: "own", regions: "SP capital e interior", otif: 98.4, costPerKg: 0.41, loads30d: 64, rntrc: "—" },
  { id: "serra", name: "Transportes Serra Azul", cnpj: "23.456.789/0001-01", kind: "third", regions: "Sul", otif: 97.1, costPerKg: 0.52, loads30d: 22, rntrc: "045812337" },
  { id: "rodosul", name: "Rodo Sul Cargas", cnpj: "34.567.890/0001-12", kind: "third", regions: "Sul e Sudeste", otif: 93.4, costPerKg: 0.47, loads30d: 18, rntrc: "039921004" },
  { id: "litoral", name: "Expresso Litoral", cnpj: "45.678.901/0001-23", kind: "third", regions: "Sudeste", otif: 98.2, costPerKg: 0.56, loads30d: 15, rntrc: "051177290" },
  { id: "cerrado", name: "Cerrado Log", cnpj: "56.789.012/0001-34", kind: "third", regions: "Centro-Oeste e MG", otif: 91.8, costPerKg: 0.49, loads30d: 9, rntrc: "048830125" },
];

export interface Vehicle {
  plate: string;
  type: string;
  capacityKg: number;
  capacityM3: number;
  carrierId: string;
  status: "available" | "on_trip" | "maintenance";
  year: number;
  nextMaintenance: string;
}

export const VEHICLES: Vehicle[] = [
  { plate: "RIO2A18", type: "Truck", capacityKg: 14000, capacityM3: 48, carrierId: "serra", status: "on_trip", year: 2022, nextMaintenance: "2027-01-10" },
  { plate: "FTR7C33", type: "Carreta", capacityKg: 30000, capacityM3: 90, carrierId: "rodosul", status: "on_trip", year: 2021, nextMaintenance: "2026-12-18" },
  { plate: "QWE4B21", type: "VUC", capacityKg: 3000, capacityM3: 18, carrierId: "own", status: "available", year: 2024, nextMaintenance: "2027-03-02" },
  { plate: "BRA9D07", type: "Toco", capacityKg: 6000, capacityM3: 32, carrierId: "cerrado", status: "on_trip", year: 2020, nextMaintenance: "2026-12-05" },
  { plate: "MSP3E52", type: "3/4", capacityKg: 4500, capacityM3: 24, carrierId: "own", status: "available", year: 2023, nextMaintenance: "2027-02-14" },
  { plate: "MSP1F90", type: "Truck", capacityKg: 14000, capacityM3: 48, carrierId: "own", status: "maintenance", year: 2019, nextMaintenance: "2026-11-28" },
  { plate: "LTR6G44", type: "Carreta", capacityKg: 30000, capacityM3: 90, carrierId: "litoral", status: "available", year: 2023, nextMaintenance: "2027-04-20" },
];

export interface Driver {
  id: string;
  name: string;
  cnh: string;
  cnhValid: string;
  carrierId: string;
  status: "available" | "on_trip" | "rest" | "cnh_expiring";
  phone: string;
  deliveries30d: number;
}

export const DRIVERS: Driver[] = [
  { id: "d1", name: "Marcos A. Ribeiro", cnh: "E", cnhValid: "2028-03-15", carrierId: "serra", status: "on_trip", phone: "(51) 9 8812-4410", deliveries30d: 61 },
  { id: "d2", name: "Paulo H. Teixeira", cnh: "E", cnhValid: "2027-08-02", carrierId: "rodosul", status: "on_trip", phone: "(41) 9 9120-3381", deliveries30d: 44 },
  { id: "d3", name: "Ana C. Moreira", cnh: "C", cnhValid: "2029-01-20", carrierId: "own", status: "available", phone: "(11) 9 7301-2255", deliveries30d: 88 },
  { id: "d4", name: "José R. Santana", cnh: "D", cnhValid: "2026-12-20", carrierId: "cerrado", status: "cnh_expiring", phone: "(31) 9 8455-1903", deliveries30d: 37 },
  { id: "d5", name: "Luís F. Prado", cnh: "C", cnhValid: "2028-06-11", carrierId: "own", status: "rest", phone: "(11) 9 6644-7120", deliveries30d: 79 },
  { id: "d6", name: "Rafael T. Nunes", cnh: "E", cnhValid: "2030-02-28", carrierId: "litoral", status: "available", phone: "(13) 9 9781-0042", deliveries30d: 52 },
];

export interface Stop {
  seq: number;
  customer: string;
  city: string;
  address: string;
  window: string;
  invoice: string;
  volumes: number;
  weightKg: number;
  status: "pending" | "on_time" | "at_risk" | "delivered" | "incident";
  time?: string;
  note?: string;
}

export interface Load {
  code: string;
  origin: string;
  destination: string;
  km: number;
  departure: string;
  status: "planned" | "loading" | "in_transit" | "at_risk" | "incident" | "delivered";
  vehiclePlate: string | null;
  driverId: string | null;
  carrierId: string;
  dock: string;
  wave: string;
  weightKg: number;
  volumeM3: number;
  invoiceValue: number;
  freight: number;
  docs: { cte: number; mdfe: string | null; ciot: string | null; toll: number | null; insurance: boolean };
  stops: Stop[];
}

export const LOADS: Load[] = [
  {
    code: "CG-02418", origin: "CD Guarulhos · SP", destination: "Porto Alegre · RS", km: 1142, departure: "05:40", status: "in_transit",
    vehiclePlate: "RIO2A18", driverId: "d1", carrierId: "serra", dock: "D-04", wave: "ONDA-0931",
    weightKg: 11240, volumeM3: 31.2, invoiceValue: 412800, freight: 6840,
    docs: { cte: 7, mdfe: "0001234", ciot: "0123.4567.8901", toll: 312.4, insurance: true },
    stops: [
      { seq: 1, customer: "Autopeças Sorocaba Ltda", city: "Sorocaba · SP", address: "Av. Itavuvu, 4100", window: "07h–10h", invoice: "000.4812", volumes: 12, weightKg: 1480, status: "delivered", time: "08:12", note: "Comprovante com foto" },
      { seq: 2, customer: "Distribuidora Itapetininga", city: "Itapetininga · SP", address: "R. Campos Salles, 812", window: "09h–12h", invoice: "000.4813", volumes: 8, weightKg: 920, status: "delivered", time: "10:05", note: "Recebido por J. Souza" },
      { seq: 3, customer: "Ferragens Vale do Ribeira", city: "Registro · SP", address: "Rod. Régis Bittencourt km 449", window: "11h–14h", invoice: "000.4814", volumes: 5, weightKg: 610, status: "delivered", time: "12:31" },
      { seq: 4, customer: "Usinagem Paraná S.A.", city: "Curitiba · PR", address: "R. João Bettega, 3500", window: "14h–17h", invoice: "000.4815", volumes: 14, weightKg: 2380, status: "on_time", note: "Previsão 15:20" },
      { seq: 5, customer: "Metalúrgica Joinville S.A.", city: "Joinville · SC", address: "R. Dona Francisca, 8300", window: "16h–18h", invoice: "000.4816", volumes: 3, weightKg: 450, status: "at_risk", note: "Previsão 17:55" },
      { seq: 6, customer: "Caxias Componentes", city: "Caxias do Sul · RS", address: "Av. Rio Branco, 1200", window: "amanhã 8h–11h", invoice: "000.4817", volumes: 10, weightKg: 2150, status: "pending" },
      { seq: 7, customer: "Indústria Gaúcha de Freios", city: "Porto Alegre · RS", address: "Av. Assis Brasil, 9000", window: "amanhã 8h–12h", invoice: "000.4818", volumes: 16, weightKg: 3250, status: "pending" },
    ],
  },
  {
    code: "CG-02419", origin: "CD Guarulhos · SP", destination: "Curitiba · PR", km: 412, departure: "06:10", status: "at_risk",
    vehiclePlate: "FTR7C33", driverId: "d2", carrierId: "rodosul", dock: "D-02", wave: "ONDA-0932",
    weightKg: 18600, volumeM3: 61.5, invoiceValue: 288400, freight: 3920,
    docs: { cte: 5, mdfe: "0001235", ciot: "0123.4567.8902", toll: 188.0, insurance: true },
    stops: [
      { seq: 1, customer: "Parafusos Atibaia", city: "Atibaia · SP", address: "Av. Jerônimo de Camargo, 500", window: "07h–09h", invoice: "000.4820", volumes: 20, weightKg: 4200, status: "delivered", time: "08:40" },
      { seq: 2, customer: "Tornearia Campo Largo", city: "Campo Largo · PR", address: "R. Xavier da Silva, 77", window: "12h–14h", invoice: "000.4821", volumes: 18, weightKg: 3900, status: "delivered", time: "13:52" },
      { seq: 3, customer: "Eletroferro Curitiba", city: "Curitiba · PR", address: "Av. das Torres, 1800", window: "14h–16h", invoice: "000.4822", volumes: 22, weightKg: 4300, status: "at_risk", note: "Trânsito na BR-277, previsão 16:25" },
      { seq: 4, customer: "Hidráulica Pinhais", city: "Pinhais · PR", address: "R. Rio Paraná, 300", window: "15h–18h", invoice: "000.4823", volumes: 9, weightKg: 2600, status: "pending" },
      { seq: 5, customer: "Construmetal São José", city: "São José dos Pinhais · PR", address: "Av. Rui Barbosa, 6100", window: "16h–18h", invoice: "000.4824", volumes: 14, weightKg: 3600, status: "pending" },
    ],
  },
  {
    code: "CG-02420", origin: "CD Guarulhos · SP", destination: "Campinas · SP", km: 96, departure: "06:30", status: "delivered",
    vehiclePlate: "QWE4B21", driverId: "d3", carrierId: "own", dock: "D-01", wave: "ONDA-0930",
    weightKg: 2310, volumeM3: 14.1, invoiceValue: 84200, freight: 1180,
    docs: { cte: 6, mdfe: null, ciot: null, toll: 42.6, insurance: true },
    stops: [
      { seq: 1, customer: "Jundiaí Autopeças", city: "Jundiaí · SP", address: "Av. 9 de Julho, 2000", window: "07h–09h", invoice: "000.4801", volumes: 4, weightKg: 380, status: "delivered", time: "07:44" },
      { seq: 2, customer: "Valinhos Máquinas", city: "Valinhos · SP", address: "R. Dom Pedro II, 150", window: "08h–11h", invoice: "000.4802", volumes: 6, weightKg: 420, status: "delivered", time: "08:51" },
      { seq: 3, customer: "Campinas Tech Metal", city: "Campinas · SP", address: "Av. John Boyd Dunlop, 3900", window: "09h–12h", invoice: "000.4803", volumes: 9, weightKg: 610, status: "delivered", time: "09:40" },
      { seq: 4, customer: "Hortolândia Industrial", city: "Hortolândia · SP", address: "R. Luiz Camilo, 1000", window: "10h–13h", invoice: "000.4804", volumes: 3, weightKg: 290, status: "delivered", time: "10:35" },
      { seq: 5, customer: "Sumaré Rolamentos", city: "Sumaré · SP", address: "Av. Rebouças, 2300", window: "11h–14h", invoice: "000.4805", volumes: 5, weightKg: 330, status: "delivered", time: "11:28" },
      { seq: 6, customer: "Paulínia Petroequip", city: "Paulínia · SP", address: "Av. Brasil, 870", window: "13h–16h", invoice: "000.4806", volumes: 2, weightKg: 280, status: "delivered", time: "12:57" },
    ],
  },
  {
    code: "CG-02421", origin: "CD Guarulhos · SP", destination: "Belo Horizonte · MG", km: 586, departure: "04:50", status: "incident",
    vehiclePlate: "BRA9D07", driverId: "d4", carrierId: "cerrado", dock: "D-03", wave: "ONDA-0929",
    weightKg: 5140, volumeM3: 27.8, invoiceValue: 196500, freight: 4410,
    docs: { cte: 4, mdfe: "0001233", ciot: "0123.4567.8899", toll: 221.3, insurance: true },
    stops: [
      { seq: 1, customer: "Pouso Alegre Válvulas", city: "Pouso Alegre · MG", address: "Av. Vereador Antônio da Costa Rios, 1000", window: "09h–12h", invoice: "000.4790", volumes: 7, weightKg: 1100, status: "incident", time: "10:20", note: "Avaria em 2 volumes, recusa parcial" },
      { seq: 2, customer: "Lavras Implementos", city: "Lavras · MG", address: "R. Padre José Poggel, 300", window: "13h–16h", invoice: "000.4791", volumes: 9, weightKg: 1350, status: "pending" },
      { seq: 3, customer: "Contagem Siderúrgica", city: "Contagem · MG", address: "Av. João César de Oliveira, 2500", window: "amanhã 8h–11h", invoice: "000.4792", volumes: 11, weightKg: 1490, status: "pending" },
      { seq: 4, customer: "BH Ferramentas", city: "Belo Horizonte · MG", address: "Av. Cristiano Machado, 4000", window: "amanhã 9h–12h", invoice: "000.4793", volumes: 8, weightKg: 1200, status: "pending" },
    ],
  },
  {
    code: "CG-02422", origin: "CD Guarulhos · SP", destination: "São José dos Campos · SP", km: 84, departure: "14:00", status: "planned",
    vehiclePlate: null, driverId: null, carrierId: "own", dock: "D-01", wave: "ONDA-0934",
    weightKg: 1870, volumeM3: 11.4, invoiceValue: 57300, freight: 960,
    docs: { cte: 0, mdfe: null, ciot: null, toll: null, insurance: false },
    stops: [
      { seq: 1, customer: "Jacareí Plásticos", city: "Jacareí · SP", address: "Av. Siqueira Campos, 600", window: "15h–17h", invoice: "000.4830", volumes: 6, weightKg: 720, status: "pending" },
      { seq: 2, customer: "SJC Aeroparts", city: "São José dos Campos · SP", address: "Av. Brigadeiro Faria Lima, 1500", window: "16h–18h", invoice: "000.4831", volumes: 8, weightKg: 830, status: "pending" },
      { seq: 3, customer: "Caçapava Metais", city: "Caçapava · SP", address: "R. Dr. Pereira de Mattos, 90", window: "16h–18h", invoice: "000.4832", volumes: 3, weightKg: 320, status: "pending" },
    ],
  },
];

export interface Shipment {
  order: string;
  customer: string;
  city: string;
  weightKg: number;
  volumeM3: number;
  volumes: number;
  invoiceValue: number;
  deadline: string;
  wave: string;
  status: "ready" | "assigned" | "waiting";
  load?: string;
}

/** Pedidos liberados pelo ORION.WMS (evento proposto shipment.ready). */
export const SHIPMENTS: Shipment[] = [
  { order: "PV-88231", customer: "Ribeirão Preto Agroindustrial", city: "Ribeirão Preto · SP", weightKg: 2640, volumeM3: 12.8, volumes: 18, invoiceValue: 91200, deadline: "2026-11-28", wave: "ONDA-0935", status: "ready" },
  { order: "PV-88232", customer: "Franca Calçados Técnicos", city: "Franca · SP", weightKg: 880, volumeM3: 6.1, volumes: 7, invoiceValue: 22400, deadline: "2026-11-28", wave: "ONDA-0935", status: "ready" },
  { order: "PV-88233", customer: "Araraquara Sucroquímica", city: "Araraquara · SP", weightKg: 3120, volumeM3: 14.0, volumes: 22, invoiceValue: 118900, deadline: "2026-11-29", wave: "ONDA-0935", status: "ready" },
  { order: "PV-88234", customer: "São Carlos Motores", city: "São Carlos · SP", weightKg: 1460, volumeM3: 7.9, volumes: 11, invoiceValue: 64800, deadline: "2026-11-29", wave: "ONDA-0936", status: "waiting" },
  { order: "PV-88235", customer: "Londrina Agro Peças", city: "Londrina · PR", weightKg: 4210, volumeM3: 19.6, volumes: 30, invoiceValue: 143500, deadline: "2026-12-01", wave: "ONDA-0936", status: "ready" },
  { order: "PV-88236", customer: "Maringá Equipamentos", city: "Maringá · PR", weightKg: 2950, volumeM3: 15.2, volumes: 19, invoiceValue: 102300, deadline: "2026-12-01", wave: "ONDA-0936", status: "waiting" },
  { order: "PV-88230", customer: "SJC Aeroparts", city: "São José dos Campos · SP", weightKg: 830, volumeM3: 4.9, volumes: 8, invoiceValue: 24100, deadline: "2026-11-27", wave: "ONDA-0934", status: "assigned", load: "CG-02422" },
];

export interface Incident {
  id: string;
  load: string;
  stop: string;
  type: string;
  opened: string;
  status: "open" | "handling" | "closed";
  detail: string;
}

export const INCIDENTS: Incident[] = [
  { id: "OC-0412", load: "CG-02421", stop: "Pouso Alegre Válvulas", type: "Avaria", opened: "10:20", status: "open", detail: "2 volumes amassados. Cliente recebeu 5 de 7, recusa parcial registrada na NF 000.4790." },
  { id: "OC-0413", load: "CG-02419", stop: "Eletroferro Curitiba", type: "Atraso", opened: "13:58", status: "handling", detail: "Trânsito intenso na BR-277. Cliente avisado, aceitou receber até 16h30." },
  { id: "OC-0409", load: "CG-02417", stop: "Taubaté Forjados", type: "Cliente ausente", opened: "ontem 15:40", status: "closed", detail: "Reentrega feita hoje às 08:10." },
];

export const FREIGHT_TABLES: FreightTable[] = [
  { id: "sp-rs", route: "SP capital → RS capital", origin: "SP", destination: "RS", perKg: 0.48, minimum: 180, adValorem: 0.003, gris: 0.0015, tollPer100kg: 9.8, tdePct: 0.2, tdeMin: 90, icms: 0.12, cubage: 300, leadDays: 3 },
  { id: "sp-pr", route: "SP capital → PR interior", origin: "SP", destination: "PR", perKg: 0.36, minimum: 150, adValorem: 0.003, gris: 0.0015, tollPer100kg: 6.2, tdePct: 0.2, tdeMin: 90, icms: 0.12, cubage: 300, leadDays: 2 },
  { id: "sp-mg", route: "SP capital → MG capital", origin: "SP", destination: "MG", perKg: 0.33, minimum: 150, adValorem: 0.0025, gris: 0.001, tollPer100kg: 7.4, tdePct: 0.2, tdeMin: 90, icms: 0.12, cubage: 300, leadDays: 2 },
  { id: "sp-sp", route: "SP capital → SP interior", origin: "SP", destination: "SP", perKg: 0.22, minimum: 95, adValorem: 0.002, gris: 0.001, tollPer100kg: 4.1, tdePct: 0.15, tdeMin: 60, icms: 0.12, cubage: 300, leadDays: 1 },
];

/** Entregas por dia (14 dias): no prazo e com atraso. Último item = hoje. */
export const DELIVERIES_14D = [
  { day: "11-14", ok: 38, late: 3 }, { day: "11-15", ok: 42, late: 2 }, { day: "11-16", ok: 35, late: 4 }, { day: "11-17", ok: 47, late: 1 },
  { day: "11-18", ok: 51, late: 2 }, { day: "11-19", ok: 22, late: 1 }, { day: "11-20", ok: 18, late: 0 }, { day: "11-21", ok: 44, late: 3 },
  { day: "11-22", ok: 49, late: 2 }, { day: "11-23", ok: 52, late: 1 }, { day: "11-24", ok: 46, late: 4 }, { day: "11-25", ok: 55, late: 2 },
  { day: "11-26", ok: 41, late: 1 }, { day: "11-27", ok: 23, late: 1 },
];

export const carrierName = (id: string) => CARRIERS.find((c) => c.id === id)?.name ?? "—";
export const driverById = (id: string | null) => DRIVERS.find((d) => d.id === id) ?? null;
export const vehicleByPlate = (p: string | null) => VEHICLES.find((v) => v.plate === p) ?? null;
export const loadByCode = (code: string) => LOADS.find((l) => l.code === code) ?? null;
