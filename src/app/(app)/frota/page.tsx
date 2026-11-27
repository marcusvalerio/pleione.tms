import { Card, PageHeader, Plate, StatusBadge } from "@/components/ui";
import { VEHICLES, carrierName } from "@/lib/demo-data";
import { fmtDate, num } from "@/lib/format";

export const metadata = { title: "Frota" };

export default function Frota() {
  return (
    <>
      <PageHeader eyebrow="cadastros" title="Frota" description="Veículos próprios e de terceiros habilitados, com capacidade e próxima manutenção." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {VEHICLES.map((v) => (
          <Card key={v.plate} className="grid gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <Plate plate={v.plate} />
              <StatusBadge kind="vehicle" status={v.status} />
            </div>
            <div>
              <p className="font-display text-xl text-fg">{v.type}</p>
              <p className="text-xs text-muted">
                {carrierName(v.carrierId)} · {v.year}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
              <div>
                <dt className="text-muted">Peso</dt>
                <dd className="font-mono text-fg">{num(v.capacityKg / 1000)} t</dd>
              </div>
              <div>
                <dt className="text-muted">Volume</dt>
                <dd className="font-mono text-fg">{v.capacityM3} m³</dd>
              </div>
              <div>
                <dt className="text-muted">Manutenção</dt>
                <dd className="font-mono text-fg">{fmtDate(v.nextMaintenance)}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
}
