import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <EmptyState title="Esta rota não existe" description="O endereço pode ter mudado ou a carga não foi encontrada." />
        <Link href="/painel" className="link text-sm">
          Voltar para a torre de controle
        </Link>
      </div>
    </main>
  );
}
