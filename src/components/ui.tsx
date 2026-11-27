import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { STATUS, type Tone } from "@/lib/labels";

export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const tones: Record<Tone, string> = {
  plan: "bg-neutral-bg text-neutral-fg ring-1 ring-inset ring-line-strong",
  neutral: "bg-neutral-bg text-neutral-fg",
  transit: "bg-transit-bg text-transit-fg",
  warning: "bg-warn-bg text-warn-fg",
  danger: "bg-crit-bg text-crit-fg",
  success: "bg-ok-bg text-ok-fg",
  info: "bg-info-bg text-info-fg",
};

/** Selo de situação: quadrado + rótulo. Nunca só cor. */
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      <span className="size-1.5 bg-current" aria-hidden />
      {children}
    </span>
  );
}

export function StatusBadge({ kind, status }: { kind: keyof typeof STATUS; status: string }) {
  const s = (STATUS[kind] as Record<string, { label: string; tone: Tone }>)[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

type Variant = "primary" | "signal" | "secondary" | "ghost";
const variants: Record<Variant, string> = {
  primary: "bg-action text-on-action hover:bg-action-hover",
  signal: "bg-accent text-accent-fg ring-1 ring-inset ring-accent-fg/25 hover:brightness-95",
  secondary: "border border-line-strong bg-surface text-fg-2 hover:bg-subtle",
  ghost: "text-fg-2 hover:bg-subtle",
};
export function buttonClass(variant: Variant = "primary", size: "sm" | "md" = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors disabled:opacity-60",
    size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
    variants[variant],
    className,
  );
}
export function Button({ variant, size, className, ...p }: ComponentProps<"button"> & { variant?: Variant; size?: "sm" | "md" }) {
  return <button className={buttonClass(variant, size, className)} {...p} />;
}
export function ButtonLink({ href, variant = "secondary", size, className, children }: { href: string; variant?: Variant; size?: "sm" | "md"; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("min-w-0 rounded-lg border border-line bg-surface", className)}>{children}</section>;
}
export function CardHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="min-w-0">
        <h2 className="font-sans text-sm font-semibold tracking-normal text-fg">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-1">{eyebrow}</p> : null}
        <h1 className="text-3xl leading-tight text-fg">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Kpi({ label, value, unit, hint, tone, children }: { label: string; value: ReactNode; unit?: string; hint?: ReactNode; tone?: "warning" | "danger"; children?: ReactNode }) {
  return (
    <div className="h-full rounded-lg border border-line bg-surface p-3.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-[32px] leading-9", tone === "warning" ? "text-warn-fg" : tone === "danger" ? "text-crit-fg" : "text-fg")}>
        {value}
        {unit ? <span className="ml-1 font-sans text-sm text-muted">{unit}</span> : null}
      </p>
      {hint ? <div className="mt-0.5 text-xs text-muted">{hint}</div> : null}
      {children}
    </div>
  );
}

/** Barra de capacidade (peso, volume, valor). Acima de warnAt% fica em atenção. */
export function Capacity({ label, used, total, unit, color = "bg-fg", warnAt = 90 }: { label: string; used: number; total: number; unit: string; color?: string; warnAt?: number }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between text-xs text-fg-2">
        <span>{label}</span>
        <span className="font-mono">
          {used.toLocaleString("pt-BR")} / {total.toLocaleString("pt-BR")} {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-sm bg-chart-off" role="img" aria-label={`${label}: ${Math.round(pct)}%`}>
        <div className={cn("h-full", pct > warnAt ? "bg-warn" : color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Plate({ plate }: { plate: string }) {
  return (
    <span className="inline-grid min-w-[112px] overflow-hidden rounded-sm border-2 border-fg bg-surface text-center">
      <span className="bg-[#2B4FA8] py-px text-[8px] font-semibold tracking-[0.14em] text-white">BRASIL</span>
      <span className="px-2 font-mono text-lg tracking-wider text-fg">{plate}</span>
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <svg width="64" height="40" viewBox="0 0 64 40" aria-hidden className="text-line-strong">
        <path d="M4 34 C 18 4, 40 40, 60 8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="0" y="30" width="8" height="8" fill="currentColor" />
        <rect x="56" y="4" width="8" height="8" fill="currentColor" />
      </svg>
      <p className="font-display text-lg text-fg">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
    </div>
  );
}
