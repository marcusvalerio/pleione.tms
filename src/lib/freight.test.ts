import { describe, expect, it } from "vitest";
import { calcFreight, type FreightTable } from "./freight";

const table: FreightTable = {
  id: "t",
  route: "SP→RS",
  origin: "SP",
  destination: "RS",
  perKg: 0.5,
  minimum: 180,
  adValorem: 0.003,
  gris: 0.0015,
  tollPer100kg: 10,
  tdePct: 0.2,
  tdeMin: 90,
  icms: 0.12,
  cubage: 300,
  leadDays: 3,
};

describe("calcFreight", () => {
  it("usa o peso real quando é maior que o cubado", () => {
    const r = calcFreight(table, { weightKg: 1000, volumeM3: 2, invoiceValue: 10000, tde: false });
    expect(r.taxedKg).toBe(1000);
    expect(r.usesCubage).toBe(false);
    // 500 + 30 + 15 + 100 = 645; ICMS por dentro: 645/0,88 = 732,95
    expect(r.total).toBeCloseTo(732.95, 2);
  });

  it("usa o peso cubado (300 kg/m³) quando é maior", () => {
    const r = calcFreight(table, { weightKg: 100, volumeM3: 2, invoiceValue: 0, tde: false });
    expect(r.taxedKg).toBe(600);
    expect(r.usesCubage).toBe(true);
    expect(r.pctOfInvoice).toBeNull();
  });

  it("aplica o frete mínimo e a TDE mínima", () => {
    const r = calcFreight(table, { weightKg: 10, volumeM3: 0, invoiceValue: 0, tde: true });
    expect(r.lines[0].value).toBe(180);
    expect(r.lines.find((l) => l.label.startsWith("TDE"))?.value).toBe(90);
  });
});
