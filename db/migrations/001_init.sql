-- PLEIONE TMS · esquema inicial
create schema if not exists tms;

create table tms.carriers (
  id            text primary key,
  name          text not null,
  cnpj          text not null,
  kind          text not null check (kind in ('own', 'third')),
  regions       text not null default '',
  otif          numeric(5,2) not null default 0,
  cost_per_kg   numeric(8,3) not null default 0,
  loads_30d     integer not null default 0,
  rntrc         text not null default '—'
);

create table tms.vehicles (
  plate             text primary key,
  type              text not null,
  capacity_kg       integer not null check (capacity_kg > 0),
  capacity_m3       numeric(6,1) not null check (capacity_m3 > 0),
  carrier_id        text not null references tms.carriers(id),
  status            text not null check (status in ('available', 'on_trip', 'maintenance')),
  year              integer not null,
  next_maintenance  date not null
);

create table tms.drivers (
  id              text primary key,
  name            text not null,
  cnh             text not null,
  cnh_valid       date not null,
  carrier_id      text not null references tms.carriers(id),
  status          text not null check (status in ('available', 'on_trip', 'rest', 'cnh_expiring')),
  phone           text not null,
  deliveries_30d  integer not null default 0
);

create table tms.freight_tables (
  id               text primary key,
  route            text not null,
  origin           text not null,
  destination      text not null,
  per_kg           numeric(8,3) not null,
  minimum          numeric(10,2) not null,
  ad_valorem       numeric(7,5) not null,
  gris             numeric(7,5) not null,
  toll_per_100kg   numeric(8,2) not null,
  tde_pct          numeric(5,3) not null,
  tde_min          numeric(10,2) not null,
  icms             numeric(5,3) not null,
  cubage           integer not null default 300,
  lead_days        integer not null
);

create sequence tms.load_code_seq start 2423;

create table tms.loads (
  code              text primary key,
  origin            text not null,
  destination       text not null,
  km                numeric(8,1) not null,
  departure         text not null,
  status            text not null check (status in ('planned', 'loading', 'in_transit', 'at_risk', 'incident', 'delivered')),
  vehicle_plate     text references tms.vehicles(plate),
  driver_id         text references tms.drivers(id),
  carrier_id        text not null references tms.carriers(id),
  dock              text not null,
  wave              text not null default '',
  weight_kg         numeric(10,1) not null default 0,
  volume_m3         numeric(8,1) not null default 0,
  invoice_value     numeric(14,2) not null default 0,
  freight           numeric(12,2) not null default 0,
  docs              jsonb not null default '{"cte":0,"mdfe":null,"ciot":null,"toll":null,"insurance":false}',
  -- traçado pela estrada: { coords: [[lat,lng]...], stopIdx: [...], legs: [{km,min}], km, min }
  route             jsonb,
  -- última posição: { leg, progress, when, speed }
  vehicle_position  jsonb,
  created_at        timestamptz not null default now()
);
create index loads_status_idx on tms.loads(status);

create table tms.load_stops (
  load_code   text not null references tms.loads(code) on delete cascade,
  seq         integer not null,
  customer    text not null,
  city        text not null,
  address     text not null,
  "window"    text not null,
  invoice     text not null default '',
  volumes     integer not null default 0,
  weight_kg   numeric(10,1) not null default 0,
  status      text not null check (status in ('pending', 'on_time', 'at_risk', 'delivered', 'incident')),
  time        text,
  note        text,
  lat         double precision,
  lng         double precision,
  primary key (load_code, seq)
);

create table tms.shipments (
  order_code     text primary key,
  customer       text not null,
  city           text not null,
  address        text not null,
  window_start   text not null,
  window_end     text not null,
  weight_kg      numeric(10,1) not null,
  volume_m3      numeric(8,1) not null,
  volumes        integer not null,
  invoice_value  numeric(14,2) not null,
  deadline       date not null,
  wave           text not null,
  status         text not null check (status in ('ready', 'assigned', 'waiting')),
  load_code      text references tms.loads(code)
);

create table tms.incidents (
  id         text primary key,
  load_code  text not null,
  stop       text not null,
  type       text not null,
  opened     text not null,
  status     text not null check (status in ('open', 'handling', 'closed')),
  detail     text not null
);

create table tms.delivery_stats (
  day      date primary key,
  on_time  integer not null,
  late     integer not null
);
