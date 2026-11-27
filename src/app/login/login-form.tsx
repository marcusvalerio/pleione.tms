"use client";

import { useActionState, useState } from "react";
import { PleioneMark } from "@/components/brand";
import { loginAction } from "@/server/actions/auth";
import { INITIAL_ACTION_STATE } from "@/lib/action-state";

const DEMO_PASSWORD_HINT = "pleione-demo";

const INPUT =
  "h-12 w-full rounded-md border border-[#2E3832] bg-[#121613] px-3.5 text-[15px] text-[#EEF4EF] placeholder:text-[#7A887E] focus:border-[#D7F8D9] focus:ring-2 focus:ring-[#D7F8D9]/25 focus:outline-none";

export function LoginForm({ demoUsers }: { demoUsers: { email: string; name: string; role: string; roleLabel: string }[] }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <form action={action} className="flex flex-col gap-[18px]" aria-label="Entrar">
        <label className="flex flex-col gap-1.5 text-[13px] text-[#9FACA3]">
          E-mail
          <input name="email" type="email" autoComplete="username" required placeholder="voce@empresa.com.br" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-[#9FACA3]">
          Senha
          <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className={INPUT} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <details className="-mt-1 text-[13px] text-[#9FACA3]" open={Boolean(state.message?.includes("CNPJ"))}>
          <summary className="cursor-pointer">Acessa mais de uma empresa?</summary>
          <label className="mt-2 flex flex-col gap-1.5">
            CNPJ da empresa
            <input name="company" inputMode="numeric" autoComplete="organization" placeholder="00.000.000/0000-00" className={INPUT} />
          </label>
        </details>
        <p className="-mt-1 text-right text-[13px] text-[#9FACA3]">Esqueceu a senha? Peça ao administrador.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-md bg-[#D7F8D9] text-[15px] font-semibold text-[#1D231F] transition-[filter,transform] hover:brightness-105 active:scale-[.98] disabled:opacity-80"
        >
          {pending ? <PleioneMark size={20} motion="loading" /> : null}
          {pending ? "Entrando…" : "Entrar"}
        </button>
        {state.message && !state.ok ? (
          <p role="alert" className="rounded-md bg-[#3D0F15] px-3 py-2 text-sm text-[#FFA3A9]">
            {state.message}
          </p>
        ) : null}
      </form>
      {demoUsers.length ? (
        <div className="border-t border-[#2E3832] pt-4">
          <p className="text-xs font-medium text-[#EEF4EF]">Perfis de demonstração</p>
          <p className="mt-0.5 text-xs text-[#9FACA3]">
            Clique para preencher. Senha: <code className="font-mono">{DEMO_PASSWORD_HINT}</code>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {demoUsers.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => {
                  setEmail(u.email);
                  setPassword(DEMO_PASSWORD_HINT);
                }}
                className="rounded-md border border-[#2E3832] px-2.5 py-2 text-left transition-colors hover:border-[#D7F8D9] hover:bg-[#262E29]"
              >
                <span className="block text-xs font-medium text-[#EEF4EF]">{u.roleLabel}</span>
                <span className="block truncate text-[11px] text-[#9FACA3]">{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
