"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Calculator,
  FileCheck2,
  LayoutDashboard,
  MapPinned,
  Menu,
  PackageOpen,
  Route,
  Truck,
  UserRound,
  Waypoints,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { PleioneLogo } from "./brand";
import { cn } from "./ui";

const NAV: { section: string; items: { label: string; href: string; icon: LucideIcon; soon?: boolean }[] }[] = [
  {
    section: "Operação",
    items: [
      { label: "Torre de controle", href: "/painel", icon: LayoutDashboard },
      { label: "Embarques do ORION", href: "/embarques", icon: PackageOpen },
      { label: "Roteirizar", href: "/roteirizar", icon: Waypoints },
      { label: "Cargas", href: "/cargas", icon: Route },
      { label: "Rastreio e ocorrências", href: "/rastreio", icon: MapPinned },
    ],
  },
  {
    section: "Frete",
    items: [
      { label: "Tabelas e simulador", href: "/fretes", icon: Calculator },
      { label: "CT-e e MDF-e", href: "/documentos", icon: FileCheck2, soon: true },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { label: "Transportadoras", href: "/transportadoras", icon: Building2 },
      { label: "Frota", href: "/frota", icon: Truck },
      { label: "Motoristas", href: "/motoristas", icon: UserRound },
    ],
  },
  { section: "Ecossistema", items: [{ label: "Integração", href: "/integracao", icon: Workflow }] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Menu principal" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV.map((g) => (
        <div key={g.section}>
          <p className="eyebrow mb-1 px-2">{g.section}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 border-l-[3px] px-2 py-1.5 text-sm transition-[background-color,color,border-color] duration-200 ease-[cubic-bezier(.2,.7,.2,1)]",
                      active ? "border-signal bg-signal-soft font-semibold text-signal-fg" : "border-transparent text-fg-2 hover:bg-subtle hover:text-fg",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.soon ? <span className="font-mono text-[10px] text-muted">fase 2</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4">
          <Link href="/painel">
            <PleioneLogo />
          </Link>
        </div>
        {nav}
      </aside>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/painel">
          <PleioneLogo size={24} descriptor={false} />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-fg-2 hover:bg-subtle" aria-label="Abrir menu" aria-expanded={open}>
          <Menu className="size-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-graphite/50" aria-label="Fechar menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <PleioneLogo size={24} descriptor={false} />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 text-muted hover:bg-subtle" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </>
  );
}
