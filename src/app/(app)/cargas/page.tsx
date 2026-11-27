import Link from "next/link";
import { Card, EmptyState, PageHeader, StatusBadge, buttonClass, cn } from "@/components/ui";
import { RouteDots } from "@/components/route";
import { getStore } from "@/server/store";
import { STATUS } from "@/lib/labels";
import { brl, num } from "@/lib/format";
import { routeGeometry } from "@/lib/map-routes";

export const metadata = { title: "Cargas" };

export default async function Cargas({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { LOADS, carrierName, driverById } = await getStore();
  const { status, q } = await searchParams;
  const term = q?.trim().toLowerCase();
  const rows = LOADS.filter((l) => !status || l.status === status).filter(
    (l) =>
      !term ||
      [l.code, l.destination, l.vehiclePlate ?? "", carrierName(l.carrierId), ...l.stops.flatMap((s) => [s.customer, s.invoice])].some((v) =>
        v.toLowerCase().includes(term),
      ),
  );
  const filters = [{ key: "", label: "Todas" }, ...Object.entries(STATUS.load).map(([key, v]) => ({ key, label: v.label }))];

  return (
    <>
      <PageHeader
        eyebrow="operação"
        title="Cargas"
        description="Cada carga é um veículo com uma sequência de paradas. Clique para ver a rota, a ocupação e os documentos."
        actions={
          <Link href="/embarques" className={buttonClass("primary", "sm")}>
            Montar carga
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por situação">
        {filters.map((f) => {
          const active = (status ?? "") === f.key;
          return (
            <Link
              key={f.key}
              href={f.key ? `/cargas?status=${f.key}` : "/cargas"}
              role="tab"
              aria-selected={active}
              className={cn("rounded-sm border px-2.5 py-1 text-xs", active ? "border-fg bg-fg text-canvas" : "border-line-strong bg-surface text-fg-2 hover:bg-subtle")}
            >
              {f.label}
            </Link>
          );
        })}
        {term ? <span className="ml-2 self-center text-xs text-muted">Busca: “{q}”</span> : null}
      </div>
      <Card>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Carga</th>
                  <th>Rota</th>
                  <th>Veículo</th>
                  <th>Motorista</th>
                  <th>Paradas</th>
                  <th className="num">Peso</th>
                  <th className="num">m³</th>
                  <th className="num">Frete</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.code}>
                    <td>
                      <Link href={`/cargas/${l.code}`} className="code link">
                        {l.code}
                      </Link>
                    </td>
                    <td>
                      <span className="text-fg">{l.destination}</span>
                      <span className="block text-xs text-muted">
                        {num(l.route?.km ?? routeGeometry(l.code)?.km ?? l.km)} km · saída {l.departure} · doca {l.dock}
                      </span>
                    </td>
                    <td className="code">{l.vehiclePlate ?? "—"}</td>
                    <td>{driverById(l.driverId)?.name ?? <span className="text-muted">a definir</span>}</td>
                    <td>
                      <RouteDots done={l.stops.filter((s) => s.status === "delivered").length} total={l.stops.length} alert={l.status === "incident" || l.status === "at_risk"} />
                    </td>
                    <td className="num">{num(l.weightKg)} kg</td>
                    <td className="num">{num(l.volumeM3)}</td>
                    <td className="num code">{brl(l.freight)}</td>
                    <td>
                      <StatusBadge kind="load" status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhuma carga encontrada" description="Mude o filtro ou a busca." />
        )}
      </Card>
    </>
  );
}
