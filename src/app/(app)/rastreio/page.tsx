import Link from "next/link";
import { Card, CardBody, CardHeader, PageHeader, StatusBadge } from "@/components/ui";
import { RouteDots, RouteLine, RouteStop } from "@/components/route";
import { INCIDENTS, LOADS, VEHICLE_POSITIONS, driverById } from "@/lib/demo-data";
import { RouteMap } from "@/components/map/route-map";
import { loadToMapRoute } from "@/lib/map-routes";

export const metadata = { title: "Rastreio e ocorrências" };

export default function Rastreio() {
  const active = LOADS.filter((l) => ["in_transit", "at_risk", "incident"].includes(l.status));
  return (
    <>
      <PageHeader
        eyebrow="operação"
        title={
          <>
            Rastreio e <em>ocorrências</em>
          </>
        }
        description="Posição de cada veículo pelo rastreador e pelo app do motorista. Linha cheia é o trecho já percorrido; tracejada, o que falta."
      />
      <Card className="mb-5">
        <CardHeader
          title="Mapa da operação"
          description={`${active.length} cargas na rua · clique no veículo para abrir a carga`}
          actions={
            <span className="flex flex-wrap gap-3 text-xs text-fg-2">
              <Legend cls="bg-route" label="Entregue" />
              <Legend cls="border-2 border-link" label="Próxima" />
              <Legend cls="border-2 border-warn" label="Em risco" />
              <Legend cls="bg-crit" label="Ocorrência" />
              <Legend cls="bg-signal" label="Veículo" />
            </span>
          }
        />
        <CardBody>
          <RouteMap routes={active.map((l, i) => loadToMapRoute(l, i))} height={480} label="Mapa com as cargas em trânsito" />
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          {active.map((l) => {
            const next = l.stops.find((s) => s.status !== "delivered");
            const done = l.stops.filter((s) => s.status === "delivered").length;
            return (
              <Card key={l.code}>
                <CardHeader
                  title={
                    <Link href={`/cargas/${l.code}`} className="code link text-sm">
                      {l.code}
                    </Link>
                  }
                  description={`${l.destination} · ${driverById(l.driverId)?.name ?? "—"} · ${l.vehiclePlate ?? "—"}`}
                  actions={<StatusBadge kind="load" status={l.status} />}
                />
                <CardBody className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <RouteDots done={done} total={l.stops.length} alert={l.status !== "in_transit"} />
                    {VEHICLE_POSITIONS[l.code] ? (
                      <span className="font-mono text-[11px] text-muted">
                        {VEHICLE_POSITIONS[l.code].speed} km/h · sinal {VEHICLE_POSITIONS[l.code].when}
                      </span>
                    ) : null}
                  </div>
                  {next ? (
                    <RouteLine>
                      <RouteStop
                        last
                        state={next.status === "incident" ? "incident" : next.status === "at_risk" ? "late" : "now"}
                        title={`Próxima: ${next.customer}`}
                        detail={`${next.city} · janela ${next.window}${next.note ? ` · ${next.note}` : ""}`}
                        aside={<StatusBadge kind="stop" status={next.status} />}
                      />
                    </RouteLine>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader title="Ocorrências" description="Avaria, atraso, cliente ausente, recusa." />
          <ul className="divide-y divide-line">
            {INCIDENTS.map((i) => (
              <li key={i.id} className="grid gap-1 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-fg">
                    {i.type} · {i.stop}
                  </span>
                  <StatusBadge kind="incident" status={i.status} />
                </div>
                <p className="text-xs text-muted">{i.detail}</p>
                <p className="font-mono text-[11px] text-muted">
                  {i.id} · {i.load} · aberta {i.opened}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2.5 ${cls}`} aria-hidden />
      {label}
    </span>
  );
}
