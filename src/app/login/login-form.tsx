"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PleioneMark } from "@/components/brand";

/**
 * Formulário de entrada. A autenticação ainda não existe (próxima fase):
 * por enquanto ele leva direto ao painel, com os dados da empresa de demonstração.
 */
export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        router.push("/painel");
      }}
    >
      <label className="block" htmlFor="email">
        <span className="label">E-mail</span>
        <input id="email" type="email" className="input" defaultValue="carla.mendes@metalsupply.demo" autoComplete="email" required />
      </label>
      <label className="block" htmlFor="senha">
        <span className="label">Senha</span>
        <input id="senha" type="password" className="input" defaultValue="pleione-demo" autoComplete="current-password" required />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-graphite font-semibold text-mint transition-transform hover:brightness-110 active:scale-[.98] disabled:opacity-80"
      >
        {busy ? <PleioneMark size={20} motion="loading" /> : null}
        {busy ? "Entrando…" : "Entrar"}
      </button>
      <p className="rounded-md bg-[#FFF6DB] px-3 py-2 text-xs text-[#7A5300]">Demonstração: o login real chega com a autenticação. Qualquer acesso abre a empresa de exemplo.</p>
    </form>
  );
}
