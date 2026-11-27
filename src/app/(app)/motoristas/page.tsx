import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { DRIVERS, carrierName } from "@/lib/demo-data";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Motoristas" };

export default function Motoristas() {
  return (
    <>
      <PageHeader eyebrow="cadastros" title="Motoristas" description="Habilitação, validade da CNH e situação de jornada." />
      <Card>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Transportadora</th>
                <th>CNH</th>
                <th>Validade</th>
                <th>Telefone</th>
                <th className="num">Entregas 30d</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {DRIVERS.map((d) => (
                <tr key={d.id}>
                  <td className="text-fg">{d.name}</td>
                  <td>{carrierName(d.carrierId)}</td>
                  <td className="code">{d.cnh}</td>
                  <td className="code">{fmtDate(d.cnhValid)}</td>
                  <td className="code">{d.phone}</td>
                  <td className="num">{d.deliveries30d}</td>
                  <td>
                    <StatusBadge kind="driver" status={d.status} />
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
