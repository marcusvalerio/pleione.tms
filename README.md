# PLEIONE TMS

Gestão de transportes do ecossistema **ASTRAEUS**: o ATLAS (ERP) planeja, o ORION (WMS) separa e o PLEIONE (TMS) leva até o cliente.

> Versão 0.1. Todas as telas usam dados de demonstração em memória (`src/lib/demo-data.ts`). Ainda não há banco de dados, login nem integração ligada.

## Telas

| Rota | O que faz |
| --- | --- |
| `/painel` | Torre de controle: cargas na rua, OTIF, janelas em risco, ocorrências, custo de frete |
| `/embarques` | Pedidos prontos no ORION e montagem de carga com ocupação por peso e volume |
| `/cargas` e `/cargas/[código]` | Lista com filtro e busca; detalhe com mapa da rota, linha de rota, veículo, ocupação e documentos |
| `/rastreio` | Mapa da operação com todas as cargas na rua, posição do veículo, próxima parada e ocorrências |
| `/fretes` | Simulador (frete-peso, ad valorem, GRIS, pedágio, TDE, ICMS) e tabelas vigentes |
| `/transportadoras`, `/frota`, `/motoristas` | Cadastros |
| `/integracao` | Contrato de eventos proposto com ATLAS e ORION |
| `/documentos` | CT-e e MDF-e (fase 2) |

## Como executar

```bash
npm install
npm run dev
```

`npm run check` roda lint, tipos e testes (`src/lib/freight.test.ts`).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 e lucide-react, a mesma base do ORION.WMS. O design segue [`docs/DESIGN.md`](docs/DESIGN.md).

## Referências de mercado

As funcionalidades foram inspiradas em Oracle OTM, SAP TM e Blue Yonder (globais) e em TOTVS TMS, Senior TMS e ESL/Bsoft (Brasil).

## Mapa

Leaflet sobre a base do OpenStreetMap, com filtro de cor no tom da marca (e invertido no tema escuro).

O traçado de cada carga segue a estrada: vem do OSRM (motor de rotas aberto, dados do OpenStreetMap), simplificado com tolerância de ~10 m e gravado em `src/lib/route-geometry.json`, junto com a distância e o tempo de cada trecho. O caminhão é posicionado sobre o traçado (trecho atual + percentual percorrido), então fica sempre na rodovia.

Para gerar de novo depois de mudar paradas ou coordenadas:

```bash
npx tsx scripts/routes.ts
```

`OSRM_URL` aponta para outro servidor OSRM (o público é só para demonstração). Em produção: OSRM próprio ou um provedor com chave, e o mesmo cálculo roda no servidor ao criar a carga. A base de mapa pública (`tile.openstreetmap.org`) também deve ser trocada por um provedor com chave quando houver volume.
