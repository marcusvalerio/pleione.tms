"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2, MapPin, PackagePlus, Plus, Sparkles, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, cn } from "@/components/ui";
import { RouteMap, type MapPointState, type MapRoute } from "@/components/map/route-map";
import type { Shipment } from "@/lib/demo-data";
import { fmtClock, fmtDuration, schedule } from "@/lib/schedule";
import { num } from "@/lib/format";

interface PlanStop {
  id: string;
  customer: string;
  address: string;
  window: [string, string] | null;
  serviceMin: number;
  source: "orion" | "manual";
  ref?: string;
  weightKg?: number;
}

interface ApiResult {
  geo: { id: string; at: [number, number]; label: string; precision: "exato" | "rua" | "cidade" }[];
  route: { order: number[]; coords: [number, number][]; stopIdx: number[]; legs: { km: number; min: number }[]; km: number; min: number };
  informed: { km: number; min: number };
}

const ORIGIN = { label: "CD Guarulhos · doca D-01", address: "Guarulhos, SP" };

const fromShipment = (s: Shipment): PlanStop => ({
  id: s.order,
  ref: s.order,
  customer: s.customer,
  address: s.address,
  window: s.window,
  serviceMin: 25,
  source: "orion",
  weightKg: s.weightKg,
});

export function Planner({ shipments }: { shipments: Shipment[] }) {
  const [stops, setStops] = useState<PlanStop[]>(() => shipments.slice(0, 4).map(fromShipment));
  const [departure, setDeparture] = useState("05:30");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [mode, setMode] = useState<"optimize" | "keep" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ msg: string; missing?: string[] } | null>(null);
  const [validated, setValidated] = useState<string | false>(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({ customer: "", address: "", from: "08:00", to: "17:00" });

  // Paradas na ordem do resultado (ou como estão na lista, antes de roteirizar)
  const ordered = result ? result.route.order.map((i) => ({ stop: stops[i], geo: result.geo[i] })) : null;
  const times = useMemo(
    () => (result && ordered ? schedule(departure, result.route.legs.map((l) => l.min), ordered.map((o) => ({ window: o.stop.window, serviceMin: o.stop.serviceMin }))) : null),
    [result, ordered, departure],
  );

  async function run(nextMode: "optimize" | "keep", list = stops) {
    setLoading(true);
    setError(null);
    setValidated(false);
    try {
      const res = await fetch("/api/roteirizacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: nextMode,
          departure,
          stops: list.map((s) => ({ id: s.id, address: s.address, window: s.window, serviceMin: s.serviceMin })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult(null);
        setError({ msg: json.error ?? "Falha ao roteirizar.", missing: json.missing });
        return;
      }
      setResult(json);
      setMode(nextMode);
    } catch {
      setError({ msg: "Sem conexão com o serviço de rotas. Tente de novo em instantes." });
    } finally {
      setLoading(false);
    }
  }

  function change(next: PlanStop[]) {
    setStops(next);
    setResult(null);
    setMode(null);
    setValidated(false);
  }

  /** Ajuste manual: move a parada na sequência calculada e recalcula mantendo a ordem. */
  function move(pos: number, dir: -1 | 1) {
    if (!ordered) return;
    const seq = ordered.map((o) => o.stop);
    const j = pos + dir;
    if (j < 0 || j >= seq.length) return;
    [seq[pos], seq[j]] = [seq[j], seq[pos]];
    setStops(seq);
    run("keep", seq);
  }

  function addManual(e: React.FormEvent) {
    e.preventDefault();
    if (form.address.trim().length < 5) return;
    change([
      ...stops,
      {
        id: `M-${Date.now().toString(36)}`,
        customer: form.customer.trim() || "Entrega avulsa",
        address: form.address.trim(),
        window: form.from && form.to ? [form.from, form.to] : null,
        serviceMin: 20,
        source: "manual",
      },
    ]);
    setForm({ customer: "", address: "", from: "08:00", to: "17:00" });
  }

  /** Grava a carga no banco com a ordem que o usuário conferiu. */
  async function validate() {
    if (!ordered) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/cargas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure,
          optimize: false,
          stops: ordered.map((o) => ({
            shipment: o.stop.source === "orion" ? o.stop.ref : undefined,
            customer: o.stop.customer,
            address: o.stop.address,
            window: o.stop.window,
            serviceMin: o.stop.serviceMin,
            at: o.geo.at,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError({ msg: json.error ?? "Não foi possível criar a carga." });
        return;
      }
      setValidated(json.code);
      router.refresh();
    } catch {
      setError({ msg: "Sem conexão com o servidor. Tente de novo." });
    } finally {
      setSaving(false);
    }
  }

  const available = shipments.filter((s) => !stops.some((p) => p.id === s.order));
  const late = times?.filter((t) => t.status === "late").length ?? 0;
  const approx = result?.geo.filter((g) => g.precision === "cidade").length ?? 0;
  const saved = result && mode === "optimize" ? { km: result.informed.km - result.route.km, min: result.informed.min - result.route.min } : null;
  const totalKg = stops.reduce((s, p) => s + (p.weightKg ?? 0), 0);

  const mapRoutes = useMemo<MapRoute[]>(() => {
    if (!result || !ordered || !times) return [];
    return [
      {
        code: "rota sugerida",
        color: "#2563EB",
        draw: true,
        path: result.route.coords,
        traveledTo: result.route.coords.length - 1,
        points: [
          { at: result.route.coords[0], label: ORIGIN.label, state: "origin" as MapPointState },
          ...ordered.map((o, k) => ({
            at: result.route.coords[result.route.stopIdx[k + 1]],
            label: `${o.stop.customer} · chegada ${fmtClock(times[k].arrive)}`,
            state: (times[k].status === "late" ? "late" : o.geo.precision === "cidade" ? "pending" : "next") as MapPointState,
          })),
        ],
      },
    ];
  }, [result, ordered, times]);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* Coluna de entrada */}
      <div className="grid content-start gap-5">
        <Card>
          <CardHeader title="Paradas" description={`${stops.length} entregas${totalKg ? ` · ${num(totalKg)} kg vindos do ORION` : ""}`} />
          <ul className="divide-y divide-line">
            {stops.map((s) => (
              <li key={s.id} className={cn("flex items-start gap-2 px-4 py-2.5", error?.missing?.includes(s.id) && "bg-crit-bg")}>
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg">
                    {s.ref ? <span className="code mr-1">{s.ref}</span> : null}
                    {s.customer}
                  </p>
                  <p className="text-xs text-muted">{s.address}</p>
                  <p className="font-mono text-[11px] text-fg-2">
                    {s.window ? `janela ${s.window[0]}–${s.window[1]}` : "sem janela"} · descarga {s.serviceMin} min
                    {s.source === "manual" ? " · avulsa" : ""}
                  </p>
                  {error?.missing?.includes(s.id) ? <p className="text-xs text-crit-fg">Endereço não encontrado. Confira rua, número e cidade.</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => change(stops.filter((x) => x.id !== s.id))}
                  className="rounded-sm p-1 text-muted hover:bg-subtle hover:text-fg"
                  aria-label={`Remover ${s.customer}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <CardBody className="grid gap-3 border-t border-line">
            <label className="flex items-center justify-between gap-3 text-sm" htmlFor="departure">
              <span className="text-fg-2">Saída do CD</span>
              <input id="departure" type="time" className="input w-32 font-mono" value={departure} onChange={(e) => setDeparture(e.target.value)} />
            </label>
            <Button variant="primary" onClick={() => run("optimize")} disabled={loading || stops.length === 0}>
              <Sparkles className="size-4" aria-hidden />
              {loading ? "Calculando a rota…" : result ? "Otimizar de novo" : "Otimizar rota"}
            </Button>
            {error ? (
              <p role="alert" className="rounded-md bg-crit-bg px-3 py-2 text-sm text-crit-fg">
                {error.msg}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Adicionar endereço" description="Entrega avulsa: digite o endereço como no pedido." />
          <form onSubmit={addManual} className="grid gap-3 p-4">
            <label className="block" htmlFor="m-cust">
              <span className="label">Cliente</span>
              <input id="m-cust" className="input" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Ex.: Mogi Ferragens" />
            </label>
            <label className="block" htmlFor="m-addr">
              <span className="label">Endereço completo</span>
              <input
                id="m-addr"
                className="input"
                required
                minLength={5}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, cidade, UF"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block" htmlFor="m-from">
                <span className="label">Janela de</span>
                <input id="m-from" type="time" className="input font-mono" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </label>
              <label className="block" htmlFor="m-to">
                <span className="label">até</span>
                <input id="m-to" type="time" className="input font-mono" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
              </label>
            </div>
            <Button type="submit" variant="secondary">
              <Plus className="size-4" aria-hidden />
              Adicionar parada
            </Button>
          </form>
        </Card>

        {available.length ? (
          <Card>
            <CardHeader title="Trazer do ORION" description="Pedidos conferidos, com endereço e janela do cliente." />
            <ul className="divide-y divide-line">
              {available.map((s) => (
                <li key={s.order} className="flex items-center gap-2 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-fg">
                      <span className="code mr-1">{s.order}</span>
                      {s.customer}
                    </p>
                    <p className="text-xs text-muted">
                      {s.city} · {num(s.weightKg)} kg · janela {s.window[0]}–{s.window[1]}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => change([...stops, fromShipment(s)])} aria-label={`Adicionar ${s.order}`}>
                    <PackagePlus className="size-4" aria-hidden />
                    Adicionar
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      {/* Coluna de resultado */}
      <div className="grid content-start gap-5">
        {result && ordered && times ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Summary label="Distância" value={`${num(result.route.km)} km`} />
              <Summary label="Ao volante" value={fmtDuration(result.route.min)} />
              <Summary label="Volta prevista ao fim" value={fmtClock(times[times.length - 1].leave)} hint="última descarga concluída" />
              <Summary
                label={mode === "optimize" ? "Ganho da otimização" : "Ordem"}
                value={saved ? (saved.km > 0.5 ? `−${num(saved.km)} km` : "já era a melhor") : "ajustada à mão"}
                hint={saved && saved.km > 0.5 ? `−${fmtDuration(Math.max(0, saved.min))} vs. ordem informada` : undefined}
                good={!!saved && saved.km > 0.5}
              />
            </div>
            {late || approx ? (
              <div className="grid gap-2">
                {late ? (
                  <p className="rounded-md bg-warn-bg px-3 py-2 text-sm text-warn-fg">
                    {late} parada{late > 1 ? "s chegam" : " chega"} fora da janela. Antecipe a saída, ajuste a ordem ou divida em duas cargas.
                  </p>
                ) : null}
                {approx ? (
                  <p className="rounded-md bg-info-bg px-3 py-2 text-sm text-info-fg">
                    {approx} endereço{approx > 1 ? "s foram localizados" : " foi localizado"} só pela cidade. Confira o pino no mapa antes de validar.
                  </p>
                ) : null}
              </div>
            ) : null}
            <Card>
              <CardHeader
                title={mode === "optimize" ? "Rota sugerida" : "Rota com a sua ordem"}
                description="Traçado pela estrada. Passe o mouse nas paradas para ver a chegada prevista."
                actions={mode === "optimize" ? <Badge tone="transit">Otimizada</Badge> : <Badge tone="plan">Ajustada</Badge>}
              />
              <CardBody>
                <RouteMap routes={mapRoutes} height={380} label="Mapa da rota sugerida" />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Sequência e horários" description="Use as setas para trocar a ordem; a rota é recalculada na hora." />
              <ol className="divide-y divide-line">
                <li className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="size-3.5 shrink-0 bg-fg" aria-hidden />
                  <span className="flex-1 text-fg">{ORIGIN.label}</span>
                  <span className="code">saída {departure}</span>
                </li>
                {ordered.map((o, k) => {
                  const t = times[k];
                  return (
                    <li key={o.stop.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-2.5 text-sm">
                      <span className="mt-0.5 flex size-5 items-center justify-center bg-fg font-mono text-[11px] text-canvas">{k + 1}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-fg">{o.stop.customer}</p>
                        <p className="truncate text-xs text-muted" title={o.geo.label}>
                          {o.stop.address}
                          {o.geo.precision !== "exato" ? ` · localizado pela ${o.geo.precision}` : ""}
                        </p>
                        <p className="font-mono text-[11px] text-fg-2">
                          +{num(result.route.legs[k].km)} km · {fmtDuration(result.route.legs[k].min)} · chega {fmtClock(t.arrive)}
                          {t.waitMin > 0 ? ` · espera ${fmtDuration(t.waitMin)}` : ""} · sai {fmtClock(t.leave)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {t.status === "late" ? (
                          <Badge tone="warning">Fora da janela</Badge>
                        ) : t.status === "wait" ? (
                          <Badge tone="info">Aguarda janela</Badge>
                        ) : (
                          <Badge tone="success">Na janela</Badge>
                        )}
                        <button type="button" disabled={k === 0 || loading} onClick={() => move(k, -1)} className="rounded-sm p-1 text-muted hover:bg-subtle disabled:opacity-30" aria-label={`Subir ${o.stop.customer}`}>
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={k === ordered.length - 1 || loading}
                          onClick={() => move(k, 1)}
                          className="rounded-sm p-1 text-muted hover:bg-subtle disabled:opacity-30"
                          aria-label={`Descer ${o.stop.customer}`}
                        >
                          <ArrowDown className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <CardBody className="flex flex-wrap items-center justify-between gap-3 border-t border-line">
                <p className="text-xs text-muted">Conferiu a ordem, os horários e os pinos? Validar cria a carga e pede a janela de doca ao ORION.</p>
                <Button variant="signal" onClick={validate} disabled={loading || saving || !!validated}>
                  <CheckCircle2 className="size-4" aria-hidden />
                  {saving ? "Criando a carga…" : "Validar e criar carga"}
                </Button>
              </CardBody>
              {validated ? (
                <p role="status" className="border-t border-line bg-ok-bg px-4 py-3 text-sm text-ok-fg">
                  Carga{" "}
                  <a href={`/cargas/${validated}`} className="code font-semibold text-ok-fg underline">
                    {validated}
                  </a>{" "}
                  criada com {ordered.length} paradas, {num(result.route.km)} km. Os pedidos do ORION saíram da lista de prontos.
                </p>
              ) : null}
            </Card>
          </>
        ) : (
          <Card>
            <div className="grid place-items-center gap-3 px-6 py-16 text-center">
              <svg width="160" height="80" viewBox="0 0 160 80" aria-hidden>
                <path d="M10 66 C 40 10, 70 70, 100 30 S 140 20, 150 14" fill="none" stroke="var(--line-strong)" strokeWidth="2.5" strokeDasharray="5 6" />
                <rect x="4" y="60" width="12" height="12" fill="var(--fg)" />
                <rect x="45" y="33" width="9" height="9" fill="var(--line-strong)" />
                <rect x="95" y="25" width="9" height="9" fill="var(--line-strong)" />
                <rect x="143" y="7" width="14" height="14" fill="var(--signal)" />
              </svg>
              <p className="font-display text-2xl text-fg">
                Monte as paradas e clique em <em>Otimizar rota</em>
              </p>
              <p className="max-w-lg text-sm text-muted">
                O PLEIONE localiza cada endereço, escolhe a ordem que respeita as janelas dos clientes com o menor tempo de estrada, traça a rota pela rodovia e calcula a chegada em cada cliente.
                Você confere, ajusta se quiser, e valida.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value, hint, good }: { label: string; value: string; hint?: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-0.5 font-display text-2xl", good ? "text-ok-fg" : "text-fg")}>{value}</p>
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
