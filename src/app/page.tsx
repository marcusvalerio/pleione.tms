import Link from "next/link";
import { ArrowRight, Calculator, LayoutDashboard, MapPinned, Smartphone, Waypoints } from "lucide-react";
import { PleioneIcon, PleioneMark } from "@/components/brand";

export const metadata = { title: "PLEIONE TMS · Gestão de transportes" };

const FEATURES = [
  { icon: Waypoints, t: "Roteirize e valide", d: "Digite endereços ou importe os pedidos do seu armazém. A rota sai pela estrada, na ordem que respeita a janela de cada cliente. Você confere e valida." },
  { icon: LayoutDashboard, t: "Torre de controle", d: "Cargas na rua, janelas em risco, ocorrências e custo do frete, num painel só." },
  { icon: MapPinned, t: "Rastreio no mapa", d: "Cada caminhão sobre a rodovia, o trecho feito e o que falta, parada a parada." },
  { icon: Calculator, t: "Frete sem planilha", d: "Frete-peso, ad valorem, GRIS, pedágio e TDE no formato das tabelas brasileiras, com cotação por transportadora." },
  { icon: Smartphone, t: "App do motorista", d: "Modo cabine para a noite: uma ação por tela, comprovante com foto, confirmar arrastando." },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-graphite text-[#EEF4EF]">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 sm:px-8">
        <span className="flex items-center gap-2.5">
          <PleioneIcon size={34} />
          <span className="font-display text-2xl tracking-tight lowercase">pleione</span>
        </span>
        <Link href="/login" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-mint px-4 text-sm font-semibold text-graphite hover:brightness-95">
          Entrar <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      <section className="relative overflow-hidden">
        {/* respiro: os 21 raios mudam de comprimento devagar, cortados pela borda */}
        <div aria-hidden className="pointer-events-none absolute top-1/2 right-[-48vw] w-[min(120vw,1000px)] -translate-y-1/2 text-mint opacity-25 sm:right-[-30vw] sm:opacity-60 lg:right-[-22vw] lg:opacity-90 xl:right-[-14vw]">
          <PleioneMark size="100%" motion="breathe" />
        </div>
        {/* degradê: o título fica sempre limpo, os raios aparecem à direita */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-graphite from-35% via-graphite/60 via-55% to-transparent to-75%" />
        <div className="relative mx-auto max-w-[1200px] px-4 pt-16 pb-28 sm:px-8 lg:pt-24 lg:pb-40">
          <p className="font-mono text-xs text-[#9FACA3]">pleione tms · gestão de transportes</p>
          <h1 className="mt-4 max-w-[13ch] text-[clamp(44px,8vw,104px)] leading-[.95] tracking-[-0.03em]">
            Cada entrega <em className="text-mint">na janela certa.</em>
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[#C3CDC6]">
            Roteirize, despache, acompanhe e confirme. Cargas, rotas pela estrada, frete e rastreio num sistema só, feito para a operação brasileira.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-5 font-semibold text-graphite hover:brightness-95">
              Acessar o sistema <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="#recursos" className="inline-flex h-11 items-center rounded-md px-5 font-medium text-mint ring-1 ring-[#2E3832] ring-inset hover:bg-[#262E29]">
              Ver recursos
            </Link>
          </div>
        </div>
      </section>

      <section id="recursos" className="bg-[#F6F8F6] text-graphite">
        <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-8">
          <p className="font-mono text-xs text-[#5C6A60]">o que ele faz</p>
          <h2 className="mt-2 max-w-[22ch] text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
            Do pedido conferido à <em>entrega com comprovante</em>.
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="rounded-lg border border-[#DCE3DE] bg-white p-5">
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-mint text-[#1C532D]">
                  <f.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-4 text-2xl">{f.t}</h3>
                <p className="mt-1 text-sm text-[#46524A]">{f.d}</p>
              </div>
            ))}
            <div className="flex flex-col justify-between rounded-lg bg-graphite p-5 text-[#EEF4EF]">
              <PleioneMark size={56} className="text-mint" />
              <div className="mt-6">
                <p className="font-display text-3xl leading-tight">As rotas <em className="text-mint">saem</em> do centro.</p>
                <Link href="/login" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint hover:underline">
                  Acessar o sistema <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-8 font-mono text-xs text-[#9FACA3] sm:px-8">
        <span>pleione tms · gestão de transportes</span>
        <span>do pedido à entrega, no prazo</span>
      </footer>
    </div>
  );
}
