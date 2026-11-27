import Link from "next/link";
import { PleioneIcon, PleioneMark } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default function Login() {
  return (
    <main className="grid min-h-dvh bg-graphite text-[#EEF4EF] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* lado da marca: o símbolo respira, cortado pela borda */}
      <section className="relative hidden overflow-hidden lg:block">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 w-[120%] -translate-x-[38%] -translate-y-1/2 text-mint">
          <PleioneMark size="100%" motion="breathe" />
        </div>
        <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-graphite from-15% via-graphite/70 via-30% to-transparent to-55% p-12">
          <p className="max-w-[16ch] font-display text-5xl leading-[1.02] tracking-[-0.02em]">
            As rotas <em className="text-mint">saem</em> do centro.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#F6F8F6] px-4 py-12 text-graphite sm:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <PleioneIcon size={40} motion="reveal" />
            <span className="leading-none">
              <span className="block font-display text-[26px] tracking-tight lowercase">pleione</span>
              <span className="mt-0.5 block font-mono text-[10px] text-[#5C6A60]">gestão de transportes</span>
            </span>
          </Link>
          <h1 className="mt-10 text-3xl">Entrar</h1>
          <p className="mt-1 text-sm text-[#5C6A60]">Use o e-mail e a senha da sua empresa.</p>
          <LoginForm />
          <p className="mt-8 font-mono text-[11px] text-[#5C6A60]">pleione tms · gestão de transportes</p>
        </div>
      </section>
    </main>
  );
}
