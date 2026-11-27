import { Search } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { COMPANY, source } = await getStore();
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:h-16">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate font-medium text-fg">{COMPANY.name}</span>
            {COMPANY.demo ? <Badge tone="warning">Demonstração</Badge> : null}
            {source === "demo" ? <Badge tone="neutral">Sem banco</Badge> : null}
          </div>
          <form action="/cargas" className="ml-auto hidden w-full max-w-sm md:block" role="search">
            <label className="relative block">
              <span className="sr-only">Buscar carga, NF, placa ou cliente</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input name="q" className="input pl-9" placeholder="Buscar carga, NF, placa ou cliente" />
            </label>
          </form>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium text-fg">Carla Mendes</p>
              <p className="text-xs text-muted">Coordenadora de transportes</p>
            </div>
            <ThemeSwitcher />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
        <footer className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-4 text-xs text-muted sm:px-6">
          <span>
            <b className="font-display text-sm font-medium text-fg-2">pleione</b> tms · versão 0.2 · {source === "neon" ? "dados no Neon" : "dados em memória"}
          </span>
          <span className="font-mono">
            ecossistema <b className="text-fg-2">ASTRAEUS</b> · atlas · orion · pleione
          </span>
        </footer>
      </div>
    </div>
  );
}
