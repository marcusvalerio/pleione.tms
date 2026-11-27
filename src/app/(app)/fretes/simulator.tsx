"use client";

import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, cn } from "@/components/ui";
import { calcFreight, type FreightTable } from "@/lib/freight";
import type { Carrier } from "@/lib/demo-data";
import { brl, num } from "@/lib/format";

/** Simulador: memória de cálculo + cotação por transportadora (fator sobre a tabela a partir do custo/kg). */
export function Simulator({ tables, carriers }: { tables: FreightTable[]; carriers: Carrier[] }) {
  const [tableId, setTableId] = useState(tables[0].id);
  const [weight, setWeight] = useState(1850);
  const [volume, setVolume] = useState(9.6);
  const [invoice, setInvoice] = useState(62000);
  const [tde, setTde] = useState(false);
  const table = tables.find((t) => t.id === tableId) ?? tables[0];
  const r = calcFreight(table, { weightKg: weight, volumeM3: volume, invoiceValue: invoice, tde });
  const avg = carriers.reduce((s, c) => s + c.costPerKg, 0) / carriers.length;
  const quotes = carriers.map((c) => ({ ...c, value: r.total * (c.costPerKg / avg), lead: table.leadDays + (c.otif < 94 ? 1 : 0) }));
  // melhor custo-serviço: menor valor ajustado pelo OTIF
  const best = quotes.reduce((b, q) => (q.value / q.otif < b.value / b.otif ? q : b), quotes[0]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Embarque" description="Altere os valores para recalcular." />
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Num id="peso" label="Peso real (kg)" value={weight} onChange={setWeight} />
          <Num id="m3" label="Volume (m³)" value={volume} onChange={setVolume} step={0.1} />
          <Num id="nf" label="Valor da NF (R$)" value={invoice} onChange={setInvoice} />
          <label className="block" htmlFor="rota">
            <span className="label">Rota</span>
            <select id="rota" className="input" value={tableId} onChange={(e) => setTableId(e.target.value)}>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.route}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-2 sm:col-span-2" htmlFor="tde">
            <input id="tde" type="checkbox" checked={tde} onChange={(e) => setTde(e.target.checked)} className="size-4 accent-[var(--action)]" />
            Cliente com dificuldade de entrega (TDE)
          </label>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Memória de cálculo"
          actions={<span className="text-xs text-muted">Peso taxado {num(r.taxedKg)} kg {r.usesCubage ? `(cubado, ${table.cubage} kg/m³)` : "(real)"}</span>}
        />
        <CardBody className="grid gap-4">
          <dl className="text-sm">
            {r.lines.map((l) => (
              <div key={l.label} className="flex justify-between border-b border-dashed border-line py-1.5">
                <dt className="text-fg-2">{l.label}</dt>
                <dd className="font-mono">{brl(l.value)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-3">
              <dt className="font-semibold text-fg">Total do frete</dt>
              <dd className="font-display text-3xl text-signal-fg">{brl(r.total)}</dd>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <dt>Frete sobre a NF</dt>
              <dd>{r.pctOfInvoice === null ? "—" : `${num(r.pctOfInvoice)}%`}</dd>
            </div>
          </dl>
          <div>
            <p className="eyebrow mb-2">cotação</p>
            <ul className="grid gap-2">
              {quotes.map((q) => (
                <li
                  key={q.id}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm",
                    q.id === best.id ? "border-link bg-transit-bg" : "border-line",
                  )}
                >
                  <span className="min-w-0">
                    <b className="font-medium text-fg">{q.name}</b>
                    <span className="block text-xs text-muted">
                      {q.lead} dias úteis · OTIF {num(q.otif)}%
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="code block">{brl(q.value)}</span>
                    {q.id === best.id ? <Badge tone="transit">Melhor custo-serviço</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Num({ id, label, value, onChange, step }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block" htmlFor={id}>
      <span className="label">{label}</span>
      <input id={id} type="number" min={0} step={step} className="input font-mono" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </label>
  );
}
