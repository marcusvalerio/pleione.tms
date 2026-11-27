/**
 * Matriz de permissões do TMS. O servidor usa para autorizar de verdade; a interface,
 * só para esconder o que a pessoa não pode fazer (nunca como proteção).
 */
export const ROLES = ["admin", "coordinator", "planner", "auditor"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  coordinator: "Coordenador de transportes",
  planner: "Programador de cargas",
  auditor: "Auditor (consulta)",
};

const OPERATION: Role[] = ["admin", "coordinator", "planner"];
const MANAGERS: Role[] = ["admin", "coordinator"];

export const PERMISSIONS = {
  "load.create": OPERATION,
  "load.dispatch": MANAGERS,
  "route.plan": OPERATION,
  "incident.handle": OPERATION,
  "freight.manage": MANAGERS,
  "fleet.manage": MANAGERS,
  "audit.view": ["admin", "coordinator", "auditor"] as Role[],
  "users.manage": ["admin"] as Role[],
} satisfies Record<string, Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
