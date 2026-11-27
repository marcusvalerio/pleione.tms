import { notFound } from "next/navigation";
import { Badge, ButtonLink, Capacity, Card, CardBody, CardHeader, PageHeader, Plate, StatusBadge } from "@/components/ui";
import { RouteLine, RouteStop, type StopState } from "@/components/route";
import { INCIDENTS, LOADS, carrierName, driverById, loadByCode, vehicleByPlate } from "@/lib/demo-data";
import { brl, fmtDate, num } from "@/lib/format";

export function generateStaticParams() {
  return LOADS.map((l) => ({ code: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return { title: (await params).code };
}

const stateOf = (s: string, isNext: boolean): StopState =>
  s === "delivered" ? "done" : s === "incident" ? "incident" : s === "at_risk" ? "late" : isNext ? "now" : "next";

export default async function Carga({ params }: { params: Promise<{ code: string }> }) {
  const load = loadByCode((await params).code);
  if (!load) notFound();
  const vehicle = vehicleByPlate(load.vehiclePlate);
  const driver = driverById(load.driverId);
  const nextIdx = load.stops.findIndex((s) => s.status !== "delivered");
  const incidents = INCIDENTS.filter((i) => i.load === load.code);
  const insuranceLimit = 450000;

  return (
    <>
      <PageHeader
        eyebrow={`cargas / ${load.code}`}
        title={<span className="font-mono text-2xl tracking-normal">{load.code}</span>}
        description={`${load.origin} → ${load.destination} · ${num(load.km)} km · saída ${load.departure} · ${carrierName(load.carrierId)}`}
        actions={
          <>
            <StatusBadge kind="load" status={load.status} />
            {load.status === "planned" ? (
              <ButtonLink href="/cargas" variant="signal" size="sm">
                Despachar carga
              </ButtonLink>
            ) : (
              <ButtonLink href="/rastreio" size="sm">
                Abrir rastreio
              </ButtonLink>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Rota" description={`${load.stops.length} paradas · onda ${load.wave} no ORION · doca ${load.dock}`} />
          <CardBody>
            <RouteLine>
              <RouteStop state="done" title={`${load.origin} · doca ${load.dock}`} detail={`Carregado · ${load.stops.length} pedidos · ${load.wave}`} aside={<span className="code">{load.departure}</span>} />
              {load.stops.map((s, i) => (
                <RouteStop
                  key={s.seq}
                  last={i === load.stops.length - 1}
                  state={stateOf(s.status, i === nextIdx)}
                  title={`${s.seq}. ${s.customer}`}
                  detail={
                    <>
                      {s.city} · {s.address}
                      <br />
                      Janela {s.window} · NF <span className="code">{s.invoice}</span> · {s.volumes} vol. · {num(s.weightKg)} kg
                      {s.note ? <span className="block text-fg-2">{s.note}</span> : null}
                    </>
                  }
                  aside={
                    <div className="grid justify-items-end gap-1">
                      <StatusBadge kind="stop" status={s.status} />
                      {s.time ? <span className="code">{s.time}</span> : null}
                    </div>
                  }
                />
              ))}
            </RouteLine>
          </CardBody>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <CardHeader title="Veículo e motorista" />
            <CardBody className="grid gap-4">
              {vehicle ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Plate plate={vehicle.plate} />
                  <div>
                    <p className="font-medium text-fg">
                      {vehicle.type} · {num(vehicle.capacityKg / 1000)} t
                    </p>
                    <p className="text-xs text-muted">{carrierName(vehicle.carrierId)}</p>
                  </div>
                </div>
              ) : (
                <Badge tone="plan">Veículo a definir</Badge>
              )}
              <p className="text-sm text-fg-2">
                {driver ? (
                  <>
                    {driver.name} · CNH {driver.cnh} · válida até <span className="code">{fmtDate(driver.cnhValid)}</span>
                  </>
                ) : (
                  "Motorista a definir"
                )}
              </p>
              {vehicle ? (
                <>
                  <Capacity label="Peso" used={load.weightKg} total={vehicle.capacityKg} unit="kg" />
                  <Capacity label="Volume" used={load.volumeM3} total={vehicle.capacityM3} unit="m³" color="bg-link" />
                </>
              ) : null}
              <Capacity label="Valor da carga (limite da apólice)" used={load.invoiceValue} total={insuranceLimit} unit="R$" color="bg-route" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documentos" description="Emissão automática fica para a fase 2." actions={load.docs.mdfe ? <Badge tone="success">Autorizados</Badge> : <Badge tone="neutral">Pendentes</Badge>} />
            <CardBody>
              <dl className="grid gap-2 text-sm">
                {[
                  ["CT-e", load.docs.cte ? `${load.docs.cte} emitidos` : "—"],
                  ["MDF-e", load.docs.mdfe ?? "—"],
                  ["CIOT", load.docs.ciot ?? "—"],
                  ["Vale-pedágio", load.docs.toll ? brl(load.docs.toll) : "—"],
                  ["Averbação do seguro", load.docs.insurance ? "RCTR-C · ok" : "—"],
                  ["Frete da carga", brl(load.freight)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-dashed border-line pb-2 last:border-0">
                    <dt className="text-fg-2">{k}</dt>
                    <dd className="code">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          {incidents.length ? (
            <Card>
              <CardHeader title="Ocorrências" />
              <ul className="divide-y divide-line">
                {incidents.map((i) => (
                  <li key={i.id} className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-fg">
                        {i.type} · <span className="code">{i.id}</span>
                      </span>
                      <StatusBadge kind="incident" status={i.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{i.detail}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
