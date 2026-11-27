import "server-only";
import { db } from "../db";
import type { Role } from "@/lib/permissions";
import { verifyPassword } from "./password";

export interface SessionUser {
  id: string;
  companyId: string;
  companyName: string;
  companyDocument: string;
  companyIsDemo: boolean;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

export async function loadSessionUser(userId: string): Promise<SessionUser | null> {
  const sql = db();
  if (!sql) return null;
  const [u] = await sql`
    select u.id, u.company_id as "companyId", c.name as "companyName", c.document as "companyDocument", c.is_demo as "companyIsDemo",
           u.name, u.email, u.role, u.must_change_password as "mustChangePassword"
    from tms.users u join tms.companies c on c.id = u.company_id
    where u.id = ${userId} and u.active`;
  return (u as SessionUser) ?? null;
}

// hash válido de uma senha qualquer: o tempo de resposta é o mesmo exista ou não o e-mail
const DUMMY_HASH = "scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export class AmbiguousLoginError extends Error {
  constructor() {
    super("Este e-mail existe em mais de uma empresa. Informe o CNPJ da empresa.");
    this.name = "AmbiguousLoginError";
  }
}

/** Login por e-mail e senha. O e-mail é único por empresa; com mais de uma, exige o CNPJ. */
export async function authenticate(email: string, password: string, companyDocument?: string | null): Promise<SessionUser | null> {
  const sql = db();
  if (!sql) return null;
  const doc = (companyDocument ?? "").replace(/\D/g, "") || null;
  const rows = await sql`
    select u.id, u.password_hash from tms.users u join tms.companies c on c.id = u.company_id
    where lower(u.email) = lower(${email.trim()}) and u.active and (${doc}::text is null or c.document = ${doc})
    order by u.created_at`;
  if (!rows.length) {
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }
  const matches: string[] = [];
  for (const row of rows) if (await verifyPassword(password, row.password_hash ?? DUMMY_HASH)) matches.push(row.id);
  if (matches.length > 1) throw new AmbiguousLoginError();
  if (!matches.length) return null;
  return loadSessionUser(matches[0]);
}

export async function listDemoUsers(): Promise<{ email: string; name: string; role: Role }[]> {
  const sql = db();
  if (!sql) return [];
  const rows = await sql`
    select email, name, role from tms.users where is_demo and active
    order by array_position(array['admin','coordinator','planner','auditor'], role)`;
  return rows as { email: string; name: string; role: Role }[];
}

export async function audit(user: Pick<SessionUser, "id" | "companyId">, action: string, entity?: { type: string; id?: string; code?: string }) {
  const sql = db();
  if (!sql) return;
  await sql`insert into tms.audit_log (company_id, user_id, action, entity_type, entity_id, entity_code)
            values (${user.companyId}, ${user.id}, ${action}, ${entity?.type ?? null}, ${entity?.id ?? null}, ${entity?.code ?? null})`;
}
