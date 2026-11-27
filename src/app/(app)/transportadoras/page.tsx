import { Badge, Card, PageHeader } from "@/components/ui";
import { getStore } from "@/server/store";
import { brl, num } from "@/lib/format";

export const metadata = { title: "Transportadoras" };

export default async function Transportadoras() {
  const { CARRIERS } = await getStore();
  return (
    <>
      <PageHeader eyebrow="cadastros" title="Transportadoras" description="Frota própria e terceiros, com nível de serviço e custo dos últimos 30 dias." />
      <Card>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Transportadora</th>
                <th>CNPJ</th>
                <th>RNTRC</th>
                <th>Regiões</th>
                <th className="num">Cargas 30d</th>
                <th className="num">Custo/kg</th>
                <th className="num">OTIF</th>
              </tr>
            </thead>
            <tbody>
              {CARRIERS.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="text-fg">{c.name}</span> {c.kind === "own" ? <Badge tone="info">Própria</Badge> : null}
                  </td>
                  <td className="code">{c.cnpj}</td>
                  <td className="code">{c.rntrc}</td>
                  <td>{c.regions}</td>
                  <td className="num">{c.loads30d}</td>
                  <td className="num code">{brl(c.costPerKg)}</td>
                  <td className="num">
                    <Badge tone={c.otif >= 95 ? "success" : c.otif >= 93 ? "warning" : "danger"}>{num(c.otif)}%</Badge>
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
