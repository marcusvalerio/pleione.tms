import Link from "next/link";
import { redirect } from "next/navigation";
import { PleioneIcon, PleioneMark } from "@/components/brand";
import { ROLE_LABELS } from "@/lib/permissions";
import { getSessionUser, isDemoMode } from "@/server/auth/session";
import { listDemoUsers } from "@/server/auth/users";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (!isDemoMode() && (await getSessionUser())) redirect("/painel");
  const demoUsers = await listDemoUsers();
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0B0E0C] px-4 py-10 text-[#EEF4EF]" style={{ colorScheme: "dark" }}>
      {/* Dois símbolos gigantes respirando em tempos diferentes; o centro escurece para o cartão. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-[max(1500px,170vmin)] -translate-x-1/2 -translate-y-1/2 text-[#1A2A1F]">
          <PleioneMark size="100%" motion="breathe" />
        </div>
        <div className="absolute top-1/2 left-1/2 w-[max(980px,110vmin)] -translate-x-1/2 -translate-y-1/2 text-[#D7F8D9] opacity-[.07] [&_.mark-ray]:[animation-duration:8s]">
          <PleioneMark size="100%" motion="breathe" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,14,12,.92)_0%,rgba(11,14,12,.75)_28%,rgba(11,14,12,0)_55%,rgba(11,14,12,.6)_85%)]" />
      </div>

      <div className="relative flex w-full max-w-[380px] flex-col gap-[18px] rounded-[10px] border border-[#2E3832] bg-[#1D231F] p-8 sm:p-10">
        <span className="flex items-center gap-2.5">
          <PleioneIcon size={36} motion="reveal" />
          <span className="font-display text-[32px] leading-none tracking-[-0.03em] lowercase">pleione</span>
        </span>
        <div>
          <h1 className="text-2xl">Bom te ver de novo</h1>
          <p className="mt-1.5 text-sm text-[#9FACA3]">Entre para acompanhar suas cargas.</p>
        </div>
        <LoginForm demoUsers={demoUsers.map((u) => ({ ...u, roleLabel: ROLE_LABELS[u.role] }))} />
        {isDemoMode() ? (
          <p className="text-center text-xs text-[#9FACA3]">
            Modo demonstração: sem banco configurado, o sistema abre como administradora.{" "}
            <Link href="/painel" className="font-medium text-[#D7F8D9] underline-offset-2 hover:underline">
              Abrir o sistema
            </Link>
          </p>
        ) : null}
        {demoUsers.length ? (
          <p className="text-center text-xs text-[#9FACA3]">
            Ambiente com <strong className="text-[#EEF4EF]">dados de demonstração</strong> (empresa fictícia MetalSupply Componentes).
          </p>
        ) : null}
      </div>
    </div>
  );
}
