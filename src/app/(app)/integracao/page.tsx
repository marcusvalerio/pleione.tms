import { Badge, Card, CardBody, CardHeader, PageHeader } from "@/components/ui";

export const metadata = { title: "Integração" };

const EVENTS = [
  { type: "shipment.ready", from: "orion", to: "pleione", when: "Pedido conferido no WMS (e packing list fechado, se exportação)", status: "proposto" },
  { type: "load.planned", from: "pleione", to: "orion", when: "Carga criada: transportadora, veículo, doca e janela", status: "proposto" },
  { type: "dock.slot_requested", from: "pleione", to: "orion", when: "TMS pede janela de doca para carregar", status: "proposto" },
  { type: "dock.slot_confirmed", from: "orion", to: "pleione", when: "WMS confirma ou recusa a janela (sem sobreposição)", status: "proposto" },
  { type: "outbound.shipped", from: "orion", to: "atlas · pleione", when: "Expedição confirmada, agora com o código da carga", status: "existe no orion" },
  { type: "delivery.completed", from: "pleione", to: "atlas", when: "Entrega com comprovante: fecha o pedido de venda", status: "proposto" },
  { type: "freight.cost_allocated", from: "pleione", to: "atlas", when: "Custo de frete rateado por pedido e NF", status: "proposto" },
];

export default function Integracao() {
  return (
    <>
      <PageHeader
        eyebrow="ecossistema astraeus"
        title={
          <>
            O ERP planeja, o WMS separa, <em>o TMS leva</em>
          </>
        }
        description="Contrato de eventos entre ATLAS.ERP, ORION.WMS e PLEIONE.TMS. Mesmo envelope do ORION (id, tipo, versão, empresa, ocorrido_em, payload), assinado com HMAC por empresa."
      />
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { n: "atlas", r: "ERP · MRP", d: "Cadastros, pedidos de venda, fiscal (NF-e, CT-e) e custos.", c: "#DDB54C" },
          { n: "orion", r: "WMS", d: "Separação, conferência, volumes e agenda de docas.", c: "#7DB7F0" },
          { n: "pleione", r: "TMS", d: "Cargas, roteiros, transportadoras, frete, rastreio e entrega.", c: "#FF5F1F" },
        ].map((s) => (
          <Card key={s.n} className="p-4">
            <div className="flex items-center gap-2">
              <span className="size-3" style={{ background: s.c }} />
              <span className="font-display text-xl text-fg">{s.n}</span>
              <span className="eyebrow">{s.r}</span>
            </div>
            <p className="mt-2 text-sm text-fg-2">{s.d}</p>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Eventos" description="Nada aqui está ligado ainda; é a proposta de contrato para a fase de integração." />
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Evento</th>
                <th>De → para</th>
                <th>Quando</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map((e) => (
                <tr key={e.type}>
                  <td className="code">{e.type}</td>
                  <td className="font-mono text-xs">
                    {e.from} → {e.to}
                  </td>
                  <td className="whitespace-normal">{e.when}</td>
                  <td>
                    <Badge tone={e.status === "proposto" ? "plan" : "success"}>{e.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardBody className="border-t border-line text-xs text-muted">
          A agenda de docas continua sendo do ORION. O PLEIONE pede a janela e o ORION garante que não há sobreposição.
        </CardBody>
      </Card>
    </>
  );
}
