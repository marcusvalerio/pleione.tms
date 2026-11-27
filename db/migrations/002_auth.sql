-- PLEIONE TMS · empresas, usuários e trilha de auditoria (mesmo modelo do login do ORION)
create extension if not exists pgcrypto;

create table tms.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  legal_name  text,
  document    text not null unique,         -- CNPJ só com dígitos
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table tms.users (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references tms.companies(id),
  name                  text not null,
  email                 text not null,
  role                  text not null check (role in ('admin', 'coordinator', 'planner', 'auditor')),
  password_hash         text,
  must_change_password  boolean not null default false,
  active                boolean not null default true,
  is_demo               boolean not null default false,
  last_login_at         timestamptz,
  created_at            timestamptz not null default now()
);
-- e-mail é único por empresa (quem acessa mais de uma empresa informa o CNPJ no login)
create unique index users_company_email_uq on tms.users (company_id, lower(email));

create table tms.audit_log (
  id           bigserial primary key,
  company_id   uuid references tms.companies(id),
  user_id      uuid references tms.users(id),
  action       text not null,
  entity_type  text,
  entity_id    text,
  entity_code  text,
  created_at   timestamptz not null default now()
);
create index audit_log_company_idx on tms.audit_log (company_id, created_at desc);
