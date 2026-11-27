import Link from "next/link";
import { ArrowRight, CircleAlert, Route, TriangleAlert } from "lucide-react";
import { Badge, ButtonLink, Card, CardBody, CardHeader, Kpi, PageHeader, StatusBadge } from "@/components/ui";
import { RouteDots } from "@/components/route";
import { DELIVERIES_14D, INCIDENTS, LOADS, SHIPMENTS, VEHICLES, carrierName } from "@/lib/demo-data";
import { brl, num } from "@/lib/format";

export const metadata = { title: "Torre de controle" };

export default function Painel() {
  const inTransit = LOADS.filter((l) => ["in_transit", "at_risk", "incident"].includes(l.status));
  const stopsOut = inTransit.reduce((s, l) => s + l.stops.filter((x) => x.status !== "delivered").length, 0);
  const atRisk = LOADS.flatMap((l) => l.stops).filter((s) => s.status === "at_risk").length;
  const openInc = INCIDENTS.filter((i) => i.status !== "closed");
  const ready = SHIPMENTS.filter((s) => s.status === "ready");
  const totalOk = DELIVERIES_14D.reduce((s, d) => s + d.ok, 0);
  const totalLate = DELIVERIES_14D.reduce((s, d) => s + d.late, 0);
  const otif = (totalOk / (totalOk + totalLate)) * 100;
  const freight = LOADS.reduce((s, l) => s + l.freight, 0);
  const invoice = LOADS.reduce((s, l) => s + l.invoiceValue, 0);
  const kg = LOADS.reduce((s, l) => s + l.weightKg, 0);
  const fleetBusy = VEHICLES.filter((v) => v.status === "on_trip").length;

  return (
    <>
      <PageHeader
        eyebrow="quinta, 27 de novembro · atualizado há 1 min"
        title={
          <>
            Torre de <em>controle</em>
          </>
        }
        description="O que está rodando, o que pode atrasar e quanto está custando o transporte hoje."
        actions={
          <>
            <ButtonLink href="/roteirizar" size="sm">
              Roteirizar entregas
            </ButtonLink>
            <ButtonLink href="/cargas?status=planned" variant="primary" size="sm">
              Despachar cargas planejadas
            </ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Cargas na rua" value={String(inTransit.length)} unit="cargas" hint={`${stopsOut} entregas pendentes`} />
        <Kpi label="OTIF · 14 dias" value={num(otif)} unit="%" hint="meta 95%">
          <Spark data={DELIVERIES_14D.map((d) => (d.ok / (d.ok + d.late)) * 100)} />
        </Kpi>
        <Kpi label="Janelas em risco" value={String(atRisk)} tone={atRisk ? "warning" : undefined} hint={atRisk ? <Badge tone="warning">Atenção</Badge> : "nenhuma"} />
        <Kpi label="Ocorrências abertas" value={String(openInc.length)} tone={openInc.length ? "danger" : undefined} hint={openInc.map((i) => i.type.toLowerCase()).join(" · ")} />
        <Kpi label="Frete / faturamento" value={num((freight / invoice) * 100)} unit="%" hint={`${brl(freight / kg)} por kg`} />
        <Kpi label="Frota em uso" value={`${fleetBusy}/${VEHICLES.length}`} unit="veíc." hint={`${ready.length} embarques prontos no ORION`} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Cargas de hoje"
            actions={
              <Link href="/cargas" className="link inline-flex items-center gap-1 text-xs">
                Ver todas <ArrowRight className="size-3" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Carga</th>
                  <th>Destino</th>
                  <th>Transportadora</th>
                  <th>Paradas</th>
                  <th>Situação</th>
                  <th className="num">Frete</th>
                </tr>
              </thead>
              <tbody>
                {LOADS.map((l) => {
                  const done = l.stops.filter((s) => s.status === "delivered").length;
                  return (
                    <tr key={l.code}>
                      <td>
                        <Link href={`/cargas/${l.code}`} className="code link">
                          {l.code}
                        </Link>
                      </td>
                      <td>{l.destination}</td>
                      <td>{carrierName(l.carrierId)}</td>
                      <td>
                        <RouteDots done={done} total={l.stops.length} alert={l.status === "incident" || l.status === "at_risk"} />
                      </td>
                      <td>
                        <StatusBadge kind="load" status={l.status} />
                      </td>
                      <td className="num code">{brl(l.freight)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Entregas por dia" description="No prazo e com atraso, últimos 14 dias." />
          <CardBody>
            <DeliveriesChart />
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Precisa de atenção"
            actions={
              <Link href="/rastreio" className="link text-xs">
                Rastreio
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {openInc.map((i) => (
              <li key={i.id}>
                <Link href={`/cargas/${i.load}`} className="flex items-start gap-2.5 px-4 py-3 hover:bg-subtle">
                  {i.status === "open" ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-crit-fg" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn-fg" />}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">
                      {i.type} · {i.stop}
                    </span>
                    <span className="block text-xs text-muted">{i.detail}</span>
                  </span>
                  <span className="ml-auto code">{i.load}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader
            title="Prontos para carregar"
            description="Pedidos conferidos no ORION.WMS aguardando carga."
            actions={
              <Link href="/embarques" className="link text-xs">
                Embarques
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {ready.map((s) => (
              <li key={s.order} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="code">{s.order}</span> <span className="text-fg">{s.customer}</span>
                  <span className="block text-xs text-muted">
                    {s.city} · {num(s.weightKg)} kg · {num(s.volumeM3)} m³
                  </span>
                </span>
                <Route className="size-4 text-muted" aria-hidden />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Spark({ data }: { data: number[] }) {
  const w = 140;
  const h = 26;
  const min = Math.min(...data) - 1;
  const max = Math.max(...data) + 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 8) + 4, h - 4 - ((v - min) / (max - min)) * (h - 8)] as const);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-[26px] w-full" role="img" aria-label="OTIF diário nos últimos 14 dias">
      <polyline fill="none" stroke="var(--link)" strokeWidth={1.75} points={pts.map((p) => p.join(",")).join(" ")} />
      <rect x={last[0] - 3.5} y={last[1] - 3.5} width={7} height={7} fill="var(--signal)" />
    </svg>
  );
}

function DeliveriesChart() {
  const W = 300;
  const H = 160;
  const pad = { l: 22, b: 18, t: 8 };
  const max = 60;
  const inner = H - pad.b - pad.t;
  const slot = (W - pad.l) / DELIVERIES_14D.length;
  const base = H - pad.b;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Entregas no prazo e com atraso por dia">
        {[0, 30, 60].map((t) => {
          const y = base - (t / max) * inner;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W} y1={y} y2={y} stroke="var(--line)" strokeDasharray={t ? "2 4" : undefined} />
              <text x={0} y={y + 3} fontSize={9} fill="var(--muted)">
                {t}
              </text>
            </g>
          );
        })}
        {DELIVERIES_14D.map((d, i) => {
          const x = pad.l + slot * i + slot * 0.2;
          const w = slot * 0.6;
          const h1 = (d.ok / max) * inner;
          const h2 = (d.late / max) * inner;
          const today = i === DELIVERIES_14D.length - 1;
          return (
            <g key={d.day}>
              <title>{`${d.day.split("-").reverse().join("/")}: ${d.ok} no prazo, ${d.late} com atraso`}</title>
              <rect x={x} y={base - h1} width={w} height={h1} fill={today ? "var(--link)" : "var(--fg)"} />
              {h2 > 0 ? <rect x={x} y={base - h1 - h2 - 2} width={w} height={h2} fill="var(--signal)" /> : null}
              {i % 3 === 1 ? (
                <text x={x + w / 2} y={H - 4} fontSize={9} fill="var(--muted)" textAnchor="middle">
                  {d.day.split("-").reverse().join("/")}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-fg-2">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-fg" /> No prazo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-signal" /> Com atraso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-link" /> Hoje (parcial)
        </span>
      </figcaption>
    </figure>
  );
}
