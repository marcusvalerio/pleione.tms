"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "./ui";

type Pref = "light" | "dark" | "system";
const KEY = "pleione-theme";
const OPTIONS: { value: Pref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Escuro", Icon: Moon },
  { value: "system", label: "Sistema", Icon: Monitor },
];

function apply(v: Pref) {
  const root = document.documentElement;
  if (v === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", v);
}

/** Tema claro/escuro/sistema, lembrado no navegador. */
export function ThemeSwitcher() {
  const [pref, setPref] = useState<Pref>("system");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY) as Pref | null;
      if (v === "light" || v === "dark") {
        apply(v);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o valor salvo no navegador
        setPref(v);
      }
    } catch {}
  }, []);
  function choose(v: Pref) {
    setPref(v);
    apply(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  }
  return (
    <div role="radiogroup" aria-label="Tema" className="inline-flex rounded-md border border-line bg-surface p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={pref === value}
          aria-label={`Tema ${label.toLowerCase()}`}
          title={`Tema: ${label}`}
          onClick={() => choose(value)}
          className={cn("rounded-sm p-1.5", pref === value ? "bg-action text-on-action" : "text-muted hover:bg-subtle hover:text-fg")}
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}
