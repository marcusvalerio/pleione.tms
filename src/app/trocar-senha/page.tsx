import Link from "next/link";
import { redirect } from "next/navigation";
import { PleioneIcon } from "@/components/brand";
import { getSessionUser } from "@/server/auth/session";
import { logoutAction } from "@/server/actions/auth";
import { PASSWORD_RULE } from "@/server/auth/password";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trocar senha" };

export default async function ChangePasswordPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const forced = user.mustChangePassword;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <PleioneIcon size={40} />
          <p className="font-display text-2xl tracking-tight text-fg">
            pleione <span className="text-muted">tms</span>
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-6">
          <h1 className="font-sans text-base font-semibold text-fg">{forced ? "Defina uma nova senha" : "Trocar senha"}</h1>
          <p className="mt-1 text-sm text-muted">{forced ? `${user.name}, sua senha é temporária. Para continuar, defina uma senha pessoal.` : `${user.name} (${user.email})`}</p>
          <p className="mt-2 text-xs text-muted">{PASSWORD_RULE}</p>
          <ChangePasswordForm />
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
          {!forced ? (
            <Link href="/painel" className="font-medium text-link hover:underline">
              Voltar ao sistema
            </Link>
          ) : null}
          <form action={logoutAction}>
            <button type="submit" className="font-medium text-fg-2 hover:underline">
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
