import Link from "next/link";
import { Card, CardBody, CardHeader, PageHeader, StatusBadge } from "@/components/ui";
import { RouteDots, RouteLine, RouteStop } from "@/components/route";
import { INCIDENTS, LOADS, driverById } from "@/lib/demo-data";

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
        description="Posição de cada carga pela última parada confirmada no app do motorista. Ocorrências abertas pedem uma tratativa."
      />
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
                  <RouteDots done={done} total={l.stops.length} alert={l.status !== "in_transit"} />
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
