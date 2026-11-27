import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { can, type Permission } from "@/lib/permissions";
import { db } from "../db";
import { COMPANY } from "@/lib/demo-data";
import { createToken, verifyToken } from "./token";
import { loadSessionUser, type SessionUser } from "./users";

export const SESSION_COOKIE = "pleione_session";
const TTL_SECONDS = 60 * 60 * 12; // 12 horas, um turno (igual ao ORION)

export async function startSession(userId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, createToken(userId, TTL_SECONDS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Sem banco configurado, o app roda em demonstração: entra como administradora da empresa de exemplo. */
export function isDemoMode(): boolean {
  return !db();
}

const DEMO_ADMIN: SessionUser = {
  id: "demo",
  companyId: "demo",
  companyName: COMPANY.name,
  companyDocument: COMPANY.cnpj.replace(/\D/g, ""),
  companyIsDemo: true,
  name: "Carla Mendes",
  email: "admin@metalsupply.demo",
  role: "admin",
  mustChangePassword: false,
};

/** Usuário do cookie; recarregado do banco a cada requisição (perfil e inativação valem na hora). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (isDemoMode()) return DEMO_ADMIN;
  const payload = verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return loadSessionUser(payload.uid);
});

/** Para páginas: sem sessão, vai para o login; senha temporária, vai para a troca. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/trocar-senha");
  return user;
}

/** Para rotas de API: devolve o usuário ou uma resposta 401/403 pronta. */
export async function authorizeApi(permission: Permission): Promise<SessionUser | Response> {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sua sessão expirou. Entre de novo." }, { status: 401 });
  if (!can(user.role, permission)) return Response.json({ error: "Seu perfil não pode fazer esta operação." }, { status: 403 });
  return user;
}
