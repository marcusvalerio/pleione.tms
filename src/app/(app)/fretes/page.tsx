import { Card, CardHeader, PageHeader } from "@/components/ui";
import { getStore } from "@/server/store";
import { brl } from "@/lib/format";
import { Simulator } from "./simulator";

export const metadata = { title: "Tabelas e simulador de frete" };

const pct = (f: number) => `${(f * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

export default async function Fretes() {
  const { CARRIERS, FREIGHT_TABLES } = await getStore();
  return (
    <>
      <PageHeader
        eyebrow="frete"
        title={
          <>
            Tabelas e <em>simulador</em>
          </>
        }
        description="O cálculo segue o modelo das tabelas brasileiras: frete-peso sobre o peso taxado, ad valorem, GRIS, pedágio, TDE e ICMS por dentro."
      />
      <Simulator tables={FREIGHT_TABLES} carriers={CARRIERS.filter((c) => c.kind === "third")} />
      <Card className="mt-5">
        <CardHeader title="Tabelas vigentes" description="Valores de demonstração." />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Rota</th>
                <th className="num">R$/kg</th>
                <th className="num">Mínimo</th>
                <th className="num">Ad valorem</th>
                <th className="num">GRIS</th>
                <th className="num">Pedágio/100 kg</th>
                <th className="num">TDE</th>
                <th className="num">Cubagem</th>
                <th className="num">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {FREIGHT_TABLES.map((t) => (
                <tr key={t.id}>
                  <td className="text-fg">{t.route}</td>
                  <td className="num code">{brl(t.perKg)}</td>
                  <td className="num code">{brl(t.minimum)}</td>
                  <td className="num">{pct(t.adValorem)}</td>
                  <td className="num">{pct(t.gris)}</td>
                  <td className="num code">{brl(t.tollPer100kg)}</td>
                  <td className="num">{pct(t.tdePct)}</td>
                  <td className="num">{t.cubage} kg/m³</td>
                  <td className="num">{t.leadDays} d.u.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
