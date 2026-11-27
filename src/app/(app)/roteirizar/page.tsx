import { PageHeader } from "@/components/ui";
import { getStore } from "@/server/store";
import { Planner } from "./planner";

export const metadata = { title: "Roteirizar" };

export default async function Roteirizar() {
  const { SHIPMENTS } = await getStore();
  return (
    <>
      <PageHeader
        eyebrow="operação"
        title={
          <>
            Roteirizar <em>e validar</em>
          </>
        }
        description="Traga entregas do ORION ou digite endereços. O sistema monta a melhor sequência pela estrada, prevê a chegada em cada cliente e você só confere e valida."
      />
      <Planner shipments={SHIPMENTS.filter((s) => s.status === "ready")} />
    </>
  );
}
