import type { ReactNode } from "react";
import { cn } from "./ui";

export type StopState = "done" | "now" | "late" | "incident" | "next";

const pin: Record<StopState, string> = {
  done: "bg-route border-route",
  now: "bg-signal border-signal stop-now shadow-[0_0_0_5px_var(--signal-soft)]",
  late: "bg-surface border-warn",
  incident: "bg-crit border-crit",
  next: "bg-surface border-line-strong",
};

/**
 * Linha de rota: o elemento de assinatura do PLEIONE.
 * Paradas quadradas ligadas por um traço; a cor diz o que já aconteceu.
 */
export function RouteLine({ children }: { children: ReactNode }) {
  return <ol className="grid">{children}</ol>;
}

export function RouteStop({ state, title, detail, aside, last }: { state: StopState; title: ReactNode; detail?: ReactNode; aside?: ReactNode; last?: boolean }) {
  return (
    <li className={cn("relative grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3", last ? "" : "pb-5")}>
      {!last ? <span aria-hidden className={cn("absolute top-[18px] -bottom-0.5 left-[13px] w-0.5", state === "done" ? "bg-route" : "bg-line-strong")} /> : null}
      <span aria-hidden className={cn("relative z-10 mx-auto mt-[3px] size-3.5 rounded-[1px] border-[3px]", pin[state])} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{title}</p>
        {detail ? <div className="text-xs text-muted">{detail}</div> : null}
      </div>
      {aside ? <div className="text-right">{aside}</div> : null}
    </li>
  );
}

/** Mini-trilha horizontal: uma parada quadrada por entrega (progresso da carga em tabelas). */
export function RouteDots({ done, total, alert }: { done: number; total: number; alert?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${done} de ${total} paradas concluídas`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "size-2 rounded-[1px]",
            i < done ? "bg-route" : i === done && alert ? "bg-signal" : "border border-line-strong",
          )}
        />
      ))}
      <span className="ml-1 font-mono text-[11px] text-muted">
        {done}/{total}
      </span>
    </span>
  );
}
