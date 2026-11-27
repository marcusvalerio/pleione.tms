"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/server/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";
import { buttonClass } from "@/components/ui";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, INITIAL_ACTION_STATE);
  return (
    <form action={action} className="mt-4 grid gap-3">
      {[
        ["current", "Senha atual", "current-password"],
        ["next", "Nova senha", "new-password"],
        ["confirm", "Repita a nova senha", "new-password"],
      ].map(([name, label, ac]) => (
        <label key={name} className="block" htmlFor={`pw-${name}`}>
          <span className="label">{label}</span>
          <input id={`pw-${name}`} name={name} type="password" autoComplete={ac} required className="input" />
        </label>
      ))}
      <button type="submit" disabled={pending} className={buttonClass("primary", "md", "mt-1")}>
        {pending ? "Salvando…" : "Salvar nova senha"}
      </button>
      {state.message && !state.ok ? (
        <p role="alert" className="rounded-md bg-crit-bg px-3 py-2 text-sm text-crit-fg">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
