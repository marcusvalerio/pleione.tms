"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Capacity, Card, CardBody, CardHeader, StatusBadge } from "@/components/ui";
import type { Shipment, Vehicle } from "@/lib/demo-data";
import { brl, fmtDate, num } from "@/lib/format";

/** Montagem de carga: escolhe pedidos e veículo, mostra ocupação por peso e volume. */
export function LoadBuilder({ shipments, vehicles }: { shipments: Shipment[]; vehicles: Vehicle[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const available = vehicles.filter((v) => v.status === "available");
  const [picked, setPicked] = useState<string[]>(shipments.filter((s) => s.status === "ready").slice(0, 3).map((s) => s.order));
  const [plate, setPlate] = useState(available[0]?.plate ?? "");
  const [created, setCreated] = useState<string | null>(null);
  const vehicle = available.find((v) => v.plate === plate);
  const sel = shipments.filter((s) => picked.includes(s.order));
  const totals = useMemo(
    () => sel.reduce((t, s) => ({ kg: t.kg + s.weightKg, m3: t.m3 + s.volumeM3, nf: t.nf + s.invoiceValue, vol: t.vol + s.volumes }), { kg: 0, m3: 0, nf: 0, vol: 0 }),
    [sel],
  );
  const over = vehicle ? totals.kg > vehicle.capacityKg || totals.m3 > vehicle.capacityM3 : false;
  const blocked = sel.some((s) => s.status === "waiting");

  /** Cria a carga: o servidor geocodifica, otimiza a ordem respeitando as janelas e grava. */
  async function create() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/cargas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optimize: true,
          vehiclePlate: plate,
          departure: "06:00",
          stops: sel.map((s) => ({ shipment: s.order, customer: s.customer, address: s.address, window: s.window, serviceMin: 25 })),
        }),
      });
      const json = await res.json();
      if (!res.ok) return setErr(json.error ?? "Não foi possível criar a carga.");
      setCreated(json.code);
      setPicked([]);
      router.refresh();
    } catch {
      setErr("Sem conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(order: string) {
    setCreated(null);
    setPicked((p) => (p.includes(order) ? p.filter((o) => o !== order) : [...p, order]));
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader title="Pedidos disponíveis" description={`${shipments.length} pedidos · selecione para montar a carga`} />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-8">
                  <span className="sr-only">Selecionar</span>
                </th>
                <th>Pedido</th>
                <th>Cliente e destino</th>
                <th className="num">Peso</th>
                <th className="num">m³</th>
                <th className="num">Valor NF</th>
                <th>Prazo</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.order} className="cursor-pointer" onClick={() => toggle(s.order)}>
                  <td>
                    <input
                      id={`sel-${s.order}`}
                      type="checkbox"
                      checked={picked.includes(s.order)}
                      onChange={() => toggle(s.order)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Selecionar ${s.order}`}
                      className="size-4 accent-[var(--action)]"
                    />
                  </td>
                  <td className="code">{s.order}</td>
                  <td>
                    <span className="text-fg">{s.customer}</span>
                    <span className="block text-xs text-muted">
                      {s.city} · {s.wave}
                    </span>
                  </td>
                  <td className="num">{num(s.weightKg)} kg</td>
                  <td className="num">{num(s.volumeM3)}</td>
                  <td className="num code">{brl(s.invoiceValue)}</td>
                  <td>{fmtDate(s.deadline)}</td>
                  <td>
                    <StatusBadge kind="shipment" status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Nova carga" actions={over ? <Badge tone="danger">Acima da capacidade</Badge> : sel.length ? <Badge tone="plan">Rascunho</Badge> : null} />
        <CardBody className="grid gap-4">
          <label className="block" htmlFor="vehicle">
            <span className="label">Veículo disponível</span>
            <select id="vehicle" className="input" value={plate} onChange={(e) => setPlate(e.target.value)}>
              {available.map((v) => (
                <option key={v.plate} value={v.plate}>
                  {v.plate} · {v.type} · {num(v.capacityKg / 1000)} t · {v.capacityM3} m³
                </option>
              ))}
            </select>
          </label>
          {vehicle ? (
            <>
              <Capacity label="Peso" used={totals.kg} total={vehicle.capacityKg} unit="kg" />
              <Capacity label="Volume" used={Number(totals.m3.toFixed(1))} total={vehicle.capacityM3} unit="m³" color="bg-link" />
            </>
          ) : null}
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-xs text-muted">Pedidos</dt>
              <dd className="font-display text-2xl">{sel.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Volumes</dt>
              <dd className="font-display text-2xl">{totals.vol}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Valor</dt>
              <dd className="font-mono text-sm">{brl(totals.nf)}</dd>
            </div>
          </dl>
          {blocked ? <p className="text-xs text-warn-fg">Há pedido aguardando conferência no ORION. Ele só entra na carga depois de conferido.</p> : null}
          <Button variant="primary" disabled={!sel.length || over || blocked || saving} onClick={create}>
            {saving ? "Roteirizando e criando…" : `Criar carga com ${sel.length} pedido${sel.length === 1 ? "" : "s"}`}
          </Button>
          {err ? <p role="alert" className="rounded-md bg-crit-bg px-3 py-2 text-sm text-crit-fg">{err}</p> : null}
          {created ? (
            <p role="status" className="rounded-md bg-ok-bg px-3 py-2 text-sm text-ok-fg">
              Carga{" "}
              <a href={`/cargas/${created}`} className="code font-semibold text-ok-fg underline">
                {created}
              </a>{" "}
              criada com a rota otimizada pela estrada.
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
