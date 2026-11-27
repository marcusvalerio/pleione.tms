/**
 * Cálculo de frete rodoviário no formato das tabelas brasileiras (NTC):
 * frete-peso sobre o peso taxado (maior entre real e cubado), ad valorem e GRIS sobre a NF,
 * pedágio por fração de 100 kg, TDE opcional e ICMS "por dentro".
 */
export interface FreightTable {
  id: string;
  route: string;
  origin: string;
  destination: string;
  perKg: number;
  minimum: number;
  adValorem: number; // fração da NF, ex.: 0.003
  gris: number;
  tollPer100kg: number;
  tdePct: number;
  tdeMin: number;
  icms: number;
  cubage: number; // kg por m³
  leadDays: number;
}

export interface FreightInput {
  weightKg: number;
  volumeM3: number;
  invoiceValue: number;
  tde: boolean;
}

export interface FreightLine {
  label: string;
  value: number;
}

export interface FreightResult {
  cubedKg: number;
  taxedKg: number;
  usesCubage: boolean;
  lines: FreightLine[];
  total: number;
  pctOfInvoice: number | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calcFreight(t: FreightTable, input: FreightInput): FreightResult {
  const weight = Math.max(0, input.weightKg);
  const cubedKg = round2(Math.max(0, input.volumeM3) * t.cubage);
  const taxedKg = Math.max(weight, cubedKg);
  const nf = Math.max(0, input.invoiceValue);

  const freightWeight = round2(Math.max(taxedKg * t.perKg, t.minimum));
  const adValorem = round2(nf * t.adValorem);
  const gris = round2(nf * t.gris);
  const toll = round2(Math.ceil(taxedKg / 100) * t.tollPer100kg);
  const tde = input.tde ? round2(Math.max(freightWeight * t.tdePct, t.tdeMin)) : 0;
  const subtotal = freightWeight + adValorem + gris + toll + tde;
  const icms = round2(subtotal / (1 - t.icms) - subtotal);

  const lines: FreightLine[] = [
    { label: "Frete-peso", value: freightWeight },
    { label: `Ad valorem · ${pct(t.adValorem)}`, value: adValorem },
    { label: `GRIS · ${pct(t.gris)}`, value: gris },
    { label: "Pedágio · por fração de 100 kg", value: toll },
  ];
  if (input.tde) lines.push({ label: `TDE · ${pct(t.tdePct)}`, value: tde });
  lines.push({ label: `ICMS · ${pct(t.icms)} (por dentro)`, value: icms });

  const total = round2(subtotal + icms);
  return { cubedKg, taxedKg, usesCubage: cubedKg > weight, lines, total, pctOfInvoice: nf > 0 ? (total / nf) * 100 : null };
}

function pct(f: number) {
  return `${(f * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
