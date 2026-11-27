# PLEIONE · Guia de design — "Grafite e menta"

> **O ORION guarda. O PLEIONE distribui.**

Tokens em `src/app/globals.css`, símbolo em `src/components/brand.tsx`. Se este arquivo e o código discordarem, vale o código. A estrutura segue a do guia do ORION (`orion.wms/docs/DESIGN.md`). O PLEIONE é um produto próprio; a marca guarda-chuva (ASTRAEUS) será tratada à parte.

## 1. Personalidade e voz

- Atributos: **pontual · firme · guia**. Valores: prazo antes de pressa · clareza na estrada · firmeza no imprevisto · integração sem atrito.
- A interface do dia a dia é calma. A energia (símbolo animado, títulos grandes) fica no login, na landing page e nas peças de marca.
- O botão diz o que vai acontecer: **Otimizar rota**, **Validar e criar carga**, **Despachar carga**, **Confirmar entrega**.
- Números com unidade e hora: *1.479 km*, *4h50 ao volante*, *chega 10:20*. Códigos em Space Mono (`CG-02418`, `RIO2A18`, `NF 000.4816`).
- Erros dizem o que houve e como resolver. Sem "Ops!" e sem exclamação.

## 2. Símbolo

- As **sete colunas do ORION**, com as mesmas larguras e cortes, deitadas como **raios** entre dois círculos: o interno (o CD, 0,38R) e o externo (0,96R). As sete se repetem 3 vezes: **21 raios**.
- Use sempre `<PleioneMark />` ou `<PleioneIcon />`. Não redesenhe à mão.
- **Uma cor só:** menta sobre grafite (principal) ou grafite sobre menta, branco ou névoa.
- Abaixo de 24 px, use 14 raios (o `PleioneIcon` troca sozinho).
- **Não gira.** O anel girando é a assinatura do ORION.
- Ícone do app e favicon: fundo grafite `#1D231F`, raios menta `#D7F8D9`, cantos de 22%.

## 3. Cor

Origem: **menta `#D7F8D9`** e **grafite `#1D231F`**. Névoa e grafite cobrem 90% da tela; o grafite é a ação e o menta é o destaque.

| Escala | Uso | Base |
|---|---|---|
| Grafite 50–950 | neutros, texto, fundo escuro | 900 `#1D231F` |
| Menta 50–950 | marca, destaque, sucesso (600) | 100 `#D7F8D9` |
| Cobalto | foco e "em trânsito" (o mesmo do ORION) | 600 `#2563EB` |
| Âmbar | calor raro: novidade (faz o papel do creme do ORION) | 200 `#FDECB8` |

| Papel | Claro | Escuro | Modo cabine |
|---|---|---|---|
| fundo | `#F6F8F6` | `#121613` | `#0B0E0C` |
| superfície | `#FFFFFF` | `#1D231F` | `#161B17` |
| contorno | `#DCE3DE` | `#2E3832` | `#26302A` |
| texto | `#1D231F` | `#EEF4EF` | `#D7F8D9` |
| texto secundário | `#5C6A60` | `#9FACA3` | `#8EDB97` |
| ação / texto na ação | `#1D231F` / `#D7F8D9` | `#D7F8D9` / `#1D231F` | `#D7F8D9` / `#1D231F` |
| destaque / texto | `#D7F8D9` / `#1C532D` | `#1F3A27` / `#B6EDBB` | `#1F3A27` / `#D7F8D9` |
| link | `#226A36` | `#8EDB97` | `#B6EDBB` |
| foco | `#2563EB` | `#93B4FD` | `#FDECB8` |

- **Modo cabine** (`data-mode="cabine"`): app do motorista à noite. É o equivalente ao modo inventário do ORION.
- **Situações** (sempre com rótulo): sucesso `#2C8642` (menta 600), em trânsito `#2563EB`, neutro `#7A887E`. Atenção `#E0A100`, crítico `#E03A45` e informação `#4E97E3` são **idênticas às do ORION**.
- **Gráficos:** s1 grafite · s2 menta 600 · s3 menta 300 · s4 cobalto 500 · s5 grafite 400 · s6 menta 900. "Hoje" em cobalto. No escuro, s1 vira menta 100.
- Regras: menta não leva texto claro; o menta da marca não é o verde de "entregue"; um botão principal por tela; texto corrido em AAA (7:1).

## 4. Tipografia e forma

- **Gambetta** (Newsreader de reserva) em títulos e números, com itálico para ênfase; **Inter** no texto; **Space Mono** em códigos, placas e rótulos.
- Cantos retos: 2 · 4 · 6 px. Contorno de 1 px no lugar de sombra. Espaço em múltiplos de 4.
- Paradas de rota são **quadradas**.

## 5. Movimento

Mesmos tempos e mesma curva do ORION: `cubic-bezier(.2,.7,.2,1)`. Com `prefers-reduced-motion`, tudo aparece pronto.

| Efeito | Onde | Tempo | Classe |
|---|---|---|---|
| Abertura do símbolo (raios crescem do centro) | login, landing | 21 × 40 ms | `motion="reveal"` |
| Respiro (raios mudam de comprimento) | **só login e landing page** | ciclo de 6 s | `motion="breathe"` |
| Carregando (onda nos raios, sem girar) | carregamento de telas, botões | volta de 1,6 s | `motion="loading"` |
| Entrada em cascata | cartões, linhas de tabela | 240 ms, +60 ms cada | `.enter` + `--i` |
| Números que contam | indicadores | 1,4 s | `<CountUp />` |
| Rota se desenha | mapa, ao validar a rota | 2,4 s | `draw` no `RouteMap` |
| Próxima parada pulsa | linha de rota | 2 s | `.stop-now` |
| Sair | tudo | 120 ms, só opacidade | — |

## 6. Checklist

- [ ] Símbolo vindo de `<PleioneMark />`, em uma cor só, sem girar.
- [ ] Cores pelos papéis (`bg-action`, `text-fg`, `bg-accent`…), sem hex solto em telas do sistema.
- [ ] Situação sempre com rótulo; atenção, crítico e info iguais às do ORION.
- [ ] Respiro só no login e na landing page.
- [ ] Movimento respeita `prefers-reduced-motion`.
