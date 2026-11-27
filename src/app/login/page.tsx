import Link from "next/link";
import { redirect } from "next/navigation";
import { PleioneIcon, PleioneMark } from "@/components/brand";
import { ROLE_LABELS } from "@/lib/permissions";
import { getSessionUser, isDemoMode } from "@/server/auth/session";
import { listDemoUsers } from "@/server/auth/users";
import GEOMETRY from "@/lib/route-geometry.json";
import { LoginForm } from "./login-form";
import { LoginScene, type SceneRoute } from "./scene";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

/**
 * Rotas ilustrativas do fundo. A tela é pública: usa só as rotas de exemplo do projeto,
 * nunca as cargas reais da empresa. Reduzidas a 1 ponto a cada 3 (é só o fundo).
 */
const SCENE: SceneRoute[] = Object.entries(GEOMETRY as unknown as Record<string, { coords: [number, number][]; stopIdx: number[] }>).map(([code, g]) => {
  const keep = new Set(g.stopIdx);
  const idx: number[] = [];
  g.coords.forEach((_, i) => (i % 3 === 0 || keep.has(i)) && idx.push(i));
  const pos = new Map(idx.map((v, i) => [v, i]));
  return { code, coords: idx.map((i) => g.coords[i]), stopIdx: g.stopIdx.map((s) => pos.get(s)!) };
});

const TICKER = ["rotas pela estrada", "janelas respeitadas", "rastreio parada a parada", "frete calculado na hora", "comprovante com foto"];

function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return h < 5 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function LoginPage() {
  if (!isDemoMode() && (await getSessionUser())) redirect("/painel");
  const demoUsers = await listDemoUsers();
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0B0E0C] text-[#EEF4EF]" style={{ colorScheme: "dark" }}>
      {/* operação ao vivo: rotas de luz, caminhões correndo, paradas acendendo */}
      <LoginScene routes={SCENE} />
      {/* o símbolo respira atrás de tudo, gigante e quase apagado */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 left-[38%] w-[max(1400px,150vmin)] -translate-x-1/2 -translate-y-1/2 text-[#D7F8D9] opacity-[.045]">
        <PleioneMark size="100%" motion="breathe" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_left,rgba(11,14,12,.85),rgba(11,14,12,0)_42%),linear-gradient(to_top,rgba(11,14,12,.85),rgba(11,14,12,0)_40%)]" />

      <div className="relative flex min-h-dvh flex-col px-4 py-6 sm:px-10 lg:py-10">
        <header className="flex items-center gap-2.5">
          <PleioneIcon size={36} motion="reveal" />
          <span className="font-display text-[28px] leading-none tracking-[-0.03em] lowercase">pleione</span>
        </header>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          <section className="hidden self-end lg:block">
            <p className="max-w-[13ch] font-display text-[clamp(52px,5.6vw,84px)] leading-[.95] tracking-[-0.03em]">
              {greeting()}. <em className="text-[#D7F8D9]">As rotas já saíram.</em>
            </p>
          </section>

          <main className="flex justify-center">
            <div className="enter flex w-full max-w-[400px] flex-col gap-[18px] rounded-[10px] border border-[#2E3832] bg-[#1D231F]/92 p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)] backdrop-blur-md sm:p-10">
              <div>
                <h1 className="text-[28px] leading-tight">Bom te ver de novo</h1>
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
          </main>
        </div>

        <footer className="flex items-center gap-4 overflow-hidden font-mono text-[11px] text-[#9FACA3] lg:max-w-[calc(100%-464px)]">
          <span className="flex shrink-0 items-center gap-2 text-[#D7F8D9]">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#63C473] opacity-60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-[#63C473]" />
            </span>
            ao vivo
          </span>
          <span className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <span className="ticker inline-flex gap-8 whitespace-nowrap">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i}>
                  {t} <span className="text-[#46524A]">■</span>
                </span>
              ))}
            </span>
          </span>
        </footer>
      </div>
    </div>
  );
}
