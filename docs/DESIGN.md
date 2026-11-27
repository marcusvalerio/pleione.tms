# PLEIONE · Guia de design — "Campo e sinal"

Tokens em `src/app/globals.css`, símbolo em `src/components/brand.tsx`, linha de rota em `src/components/route.tsx`.

## Cores

| Nome | Hex | Papel |
|---|---|---|
| Cream Paper | `#FDEEDC` | Fundo (base `#FBF1E4` na aplicação) |
| Graphite Night | `#1F2826` | Texto, tema escuro |
| Pine Shadow | `#0B5A3E` | Ação principal, marca |
| Ink Cobalt | `#3D3BE6` | Em trânsito, links, foco |
| Ember Signal | `#FF5F1F` | Destino, ocorrência, ação de despacho |
| Moss Field | `#8BBE67` | Paradas concluídas, linha de rota |
| Fern Leaf | `#079A2E` | Entregue, sucesso |
| Morning Haze | `#C6E6F4` | Fundos de informação |

Use sempre os papéis (`bg-surface`, `text-fg`, `bg-action`, `text-link`, `bg-signal`…), nunca a cor-base direto. Situações têm sempre rótulo.

## Tipografia

- **Gambetta** (Fontshare), com Newsreader como reserva: títulos e números, peso 500, itálico para ênfase.
- **Inter**: texto e interface.
- **Space Mono**: códigos, placa, CT-e, etiquetas (`eyebrow`).

## Forma

- Cantos retos: 2, 4 e 6 px. Contorno de 1 px no lugar de sombra.
- Linha curva com **paradas quadradas** é o elemento de assinatura: símbolo, rota da carga, trilha de progresso nas tabelas.
- Textura granulada leve sobre a página.

## Voz

O botão diz o que vai acontecer: “Criar carga com 3 pedidos”, “Despachar carga”.
