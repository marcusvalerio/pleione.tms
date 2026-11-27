import Link from "next/link";
import { KeyRound, LogOut, Search } from "lucide-react";
import { requireUser, isDemoMode } from "@/server/auth/session";
import { logoutAction } from "@/server/actions/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import { Sidebar } from "@/components/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { source } = await getStore();
  const demo = isDemoMode();
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:h-16">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate font-medium text-fg">{user.companyName}</span>
            {user.companyIsDemo ? <Badge tone="warning">Demonstração</Badge> : null}
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
              <p className="text-sm font-medium text-fg">{user.name}</p>
              <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <ThemeSwitcher />
            {!demo ? (
              <Link href="/trocar-senha" className="rounded-md p-2 text-muted hover:bg-subtle hover:text-fg" title="Trocar senha" aria-label="Trocar senha">
                <KeyRound className="size-4" />
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button type="submit" className="rounded-md p-2 text-muted hover:bg-subtle hover:text-fg" title="Sair" aria-label="Sair">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
        <footer className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-4 text-xs text-muted sm:px-6">
          <span>
            <b className="font-display text-sm font-medium text-fg-2">pleione</b> tms · versão 0.2 · {source === "neon" ? "dados no Neon" : "dados em memória"}
          </span>
          <span className="font-mono">gestão de transportes</span>
        </footer>
      </div>
    </div>
  );
}
