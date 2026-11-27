import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/ui";
import { getStore } from "@/server/store";
import { brl, fmtDate, num } from "@/lib/format";
import { LoadBuilder } from "./load-builder";

export const metadata = { title: "Embarques do ORION" };

export default async function Embarques() {
  const { SHIPMENTS, VEHICLES } = await getStore();
  const open = SHIPMENTS.filter((s) => s.status !== "assigned");
  return (
    <>
      <PageHeader
        eyebrow="operação · vindos do orion.wms"
        title={
          <>
            Embarques <em>prontos</em>
          </>
        }
        description="Pedidos separados e conferidos no ORION. Marque os que vão juntos, escolha o veículo e veja a ocupação antes de criar a carga."
      />
      <LoadBuilder shipments={open} vehicles={VEHICLES} />
      <Card className="mt-5">
        <CardHeader title="Já em carga" />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th className="num">Peso</th>
                <th className="num">Valor NF</th>
                <th>Prazo</th>
                <th>Carga</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.filter((s) => s.status === "assigned").map((s) => (
                <tr key={s.order}>
                  <td className="code">{s.order}</td>
                  <td className="text-fg">{s.customer}</td>
                  <td>{s.city}</td>
                  <td className="num">{num(s.weightKg)} kg</td>
                  <td className="num code">{brl(s.invoiceValue)}</td>
                  <td>{fmtDate(s.deadline)}</td>
                  <td className="code">{s.load}</td>
                  <td>
                    <StatusBadge kind="shipment" status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
