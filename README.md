# PLEIONE TMS

Gestão de transportes do ecossistema **ASTRAEUS**: o ATLAS (ERP) planeja, o ORION (WMS) separa e o PLEIONE (TMS) leva até o cliente.

> Versão 0.2. Os dados ficam no **Neon** (Postgres, projeto `pleione-tms`, região São Paulo). Sem `DATABASE_URL`, o app usa os dados de demonstração em memória (`src/lib/demo-data.ts`). Ainda não há login nem integração com o ORION ligada.

## Telas

| Rota | O que faz |
| --- | --- |
| `/painel` | Torre de controle: cargas na rua, OTIF, janelas em risco, ocorrências, custo de frete |
| `/embarques` | Pedidos prontos no ORION e montagem de carga com ocupação por peso e volume |
| `/roteirizar` | Digite endereços ou traga pedidos do ORION: o sistema localiza, otimiza a sequência respeitando as janelas, traça pela estrada e prevê a chegada. Você ajusta a ordem se quiser e valida |
| `/cargas` e `/cargas/[código]` | Lista com filtro e busca; detalhe com mapa da rota, linha de rota, veículo, ocupação e documentos |
| `/rastreio` | Mapa da operação com todas as cargas na rua, posição do veículo, próxima parada e ocorrências |
| `/fretes` | Simulador (frete-peso, ad valorem, GRIS, pedágio, TDE, ICMS) e tabelas vigentes |
| `/transportadoras`, `/frota`, `/motoristas` | Cadastros |
| `/integracao` | Contrato de eventos proposto com ATLAS e ORION |
| `/documentos` | CT-e e MDF-e (fase 2) |

## Como executar

```bash
npm install
cp .env.example .env.local   # cole a DATABASE_URL do Neon
npm run db:migrate           # aplica db/migrations/*.sql
npm run db:seed              # dados de demonstração (só se o banco estiver vazio)
npm run dev
```

## Banco (Neon)

- Esquema `tms`: transportadoras, veículos, motoristas, tabelas de frete, pedidos vindos do ORION (`shipments`), cargas (`loads`, com o traçado da rota em `route` jsonb), paradas, ocorrências e estatística diária de entregas.
- Migrações em `db/migrations/`, controladas pela tabela `public.schema_migrations`.
- Leitura: `src/server/store.ts`. Gravação de carga: `POST /api/cargas`. O servidor recalcula a rota pela estrada, grava carga, paradas e traçado numa transação e marca os pedidos como "em carga".
- Em produção (Vercel), defina `DATABASE_URL` nas variáveis de ambiente do projeto.

`npm run check` roda lint, tipos e testes (`src/lib/freight.test.ts`).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 e lucide-react, a mesma base do ORION.WMS. O design segue [`docs/DESIGN.md`](docs/DESIGN.md).

## Referências de mercado

As funcionalidades foram inspiradas em Oracle OTM, SAP TM e Blue Yonder (globais) e em TOTVS TMS, Senior TMS e ESL/Bsoft (Brasil).

## Roteirização

1. **Endereço → coordenada:** Nominatim (OpenStreetMap), com cache e limite de 1 requisição por segundo. Endereço achado só pela cidade aparece com aviso para conferir no mapa.
2. **Matriz de tempos e distâncias pela estrada:** OSRM `table`.
3. **Melhor ordem:** `src/lib/solver.ts`. Prioridade: menos atraso em relação às janelas, depois o término mais cedo, depois a menor distância. Até 8 paradas testa todas as ordens; acima disso usa vizinho mais próximo + 2-opt.
4. **Traçado final e horários:** OSRM `route` na ordem escolhida; `src/lib/schedule.ts` soma trecho, espera de janela e tempo de descarga.

API: `POST /api/roteirizacao` (`src/app/api/roteirizacao/route.ts`). `GEOCODER_URL` e `OSRM_URL` trocam os servidores públicos (só para demonstração) por instâncias próprias ou um provedor contratado.

## Mapa

Leaflet sobre a base do OpenStreetMap, com filtro de cor no tom da marca (e invertido no tema escuro).

O traçado de cada carga segue a estrada: vem do OSRM (motor de rotas aberto, dados do OpenStreetMap), simplificado com tolerância de ~10 m e gravado em `src/lib/route-geometry.json`, junto com a distância e o tempo de cada trecho. O caminhão é posicionado sobre o traçado (trecho atual + percentual percorrido), então fica sempre na rodovia.

Para gerar de novo depois de mudar paradas ou coordenadas:

```bash
npx tsx scripts/routes.ts
```

`OSRM_URL` aponta para outro servidor OSRM (o público é só para demonstração). Em produção: OSRM próprio ou um provedor com chave, e o mesmo cálculo roda no servidor ao criar a carga. A base de mapa pública (`tile.openstreetmap.org`) também deve ser trocada por um provedor com chave quando houver volume.
