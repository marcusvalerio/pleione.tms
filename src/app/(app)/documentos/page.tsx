import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "CT-e e MDF-e" };

export default function Documentos() {
  return (
    <>
      <PageHeader eyebrow="frete · fase 2" title="CT-e e MDF-e" description="Emissão de CT-e, MDF-e, CIOT, vale-pedágio e averbação do seguro, integrada ao fiscal do ATLAS e à SEFAZ." />
      <Card>
        <EmptyState
          title="Chega na fase 2"
          description="Enquanto isso, os números dos documentos emitidos fora do sistema aparecem no detalhe de cada carga."
        />
      </Card>
    </>
  );
}
