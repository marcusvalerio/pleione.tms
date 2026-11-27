"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { db } from "../db";
import { hashPassword, passwordProblem, verifyPassword } from "../auth/password";
import { endSession, getSessionUser, isDemoMode, startSession } from "../auth/session";
import { AmbiguousLoginError, audit, authenticate } from "../auth/users";

const fail = (message: string): ActionState => ({ ok: false, message, ts: Date.now() });

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemoMode()) redirect("/painel");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return fail("Informe e-mail e senha.");
  const companyDocument = String(formData.get("company") ?? "") || null;
  let user;
  try {
    user = await authenticate(email, password, companyDocument);
  } catch (error) {
    if (error instanceof AmbiguousLoginError) return fail(error.message);
    throw error;
  }
  if (!user) return fail("E-mail ou senha inválidos.");
  await startSession(user.id);
  await db()!`update tms.users set last_login_at = now() where id = ${user.id}`;
  await audit(user, "auth.login", { type: "user", id: user.id, code: user.email });
  redirect(user.mustChangePassword ? "/trocar-senha" : "/painel");
}

export async function logoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user && !isDemoMode()) await audit(user, "auth.logout", { type: "user", id: user.id, code: user.email });
  await endSession();
  redirect("/login");
}

export async function changePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || isDemoMode()) return fail("Entre de novo para trocar a senha.");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const problem = passwordProblem(next);
  if (problem) return fail(problem);
  if (next !== confirm) return fail("A confirmação não é igual à nova senha.");
  const sql = db()!;
  const [row] = await sql`select password_hash from tms.users where id = ${user.id}`;
  if (!(await verifyPassword(current, row?.password_hash ?? null))) return fail("A senha atual está incorreta.");
  if (current === next) return fail("A nova senha precisa ser diferente da atual.");
  await sql`update tms.users set password_hash = ${await hashPassword(next)}, must_change_password = false where id = ${user.id}`;
  await audit(user, "auth.password_changed", { type: "user", id: user.id, code: user.email });
  redirect("/painel");
}
