# Brainstorming de Design — TransparênciaIA

## Contexto
Plataforma de análise de dados públicos com IA para jornalistas, ONGs e órgãos de fiscalização.
Foco em scores de risco, grafos de conexões, relatórios e transparência política.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** Data Noir — Investigative Journalism Aesthetic

**Core Principles:**
1. Tensão visual entre dados frios e impacto humano — tabelas e números com peso emocional
2. Hierarquia tipográfica agressiva: títulos grandes e bold contrastando com dados densos
3. Interface como "sala de guerra" de investigação: dark mode com acentos de alerta
4. Credibilidade institucional sem burocracia visual

**Color Philosophy:**
- Fundo: Cinza-carvão profundo (#0D1117) evocando telas de terminal e salas escuras
- Primário: Âmbar/laranja (#F59E0B) — cor de alerta, urgência, luz de investigação
- Secundário: Azul-aço (#3B82F6) — dados, links, confiança técnica
- Risco alto: Vermelho-sangue (#DC2626)
- Risco médio: Âmbar (#F59E0B)
- Risco baixo: Verde-musgo (#10B981)
- Texto: Branco-gelo (#F8FAFC) e cinza-prata (#94A3B8)

**Layout Paradigm:**
- Sidebar fixa à esquerda com navegação vertical densa
- Área principal dividida em painéis redimensionáveis
- Grafos ocupam 60% da viewport quando ativos
- Cards de risco com bordas coloridas à esquerda (estilo terminal de monitoramento)

**Signature Elements:**
1. Linhas de conexão animadas nos grafos com pulso de dados em tempo real
2. Badges de score de risco com gradiente de cor (verde→amarelo→vermelho)
3. Cabeçalho com "ticker" de dados mostrando estatísticas em tempo real

**Interaction Philosophy:**
- Hover nos nós do grafo revela painel lateral com detalhes
- Filtros aplicados com animação de "varredura" sobre os dados
- Transições de página com efeito de "scan" horizontal

**Animation:**
- Entrada de cards: fade-in com translate-y de baixo para cima (200ms, ease-out)
- Grafos: nós surgem com spring animation, arestas se desenham progressivamente
- Score badges: preenchimento animado do arco (1s, ease-in-out)
- Hover em linhas de dados: highlight com glow sutil

**Typography System:**
- Display: Space Grotesk Bold (títulos, scores grandes)
- Body: IBM Plex Mono (dados, tabelas, códigos)
- UI: Inter Medium (labels, botões, navegação)
- Hierarquia: 48px display → 24px heading → 16px body → 12px caption

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Civic Tech Brutalism — Força Institucional com Clareza Radical

**Core Principles:**
1. Tipografia como arquitetura: fontes condensadas e pesadas estruturam a informação
2. Grade assimétrica quebrada — blocos de conteúdo em ângulos inesperados
3. Contraste máximo: preto sobre branco, sem meios-tons desnecessários
4. Dados como protagonistas visuais, não decoração

**Color Philosophy:**
- Base: Branco puro (#FFFFFF) e preto absoluto (#000000)
- Acento único: Verde-lima elétrico (#84CC16) para destacar ações e alertas
- Risco: Gradiente de amarelo-ouro (#EAB308) a vermelho-tijolo (#B91C1C)
- Sem gradientes decorativos — apenas cor sólida com propósito

**Layout Paradigm:**
- Grade de 12 colunas com quebras intencionais
- Elementos que "sangram" para fora dos containers
- Sidebar com largura variável baseada em conteúdo
- Tabelas com bordas grossas e zebra-striping de alto contraste

**Signature Elements:**
1. Barras de progresso de risco com textura de "hachura" nos segmentos críticos
2. Números de score em tipografia display gigante como elementos decorativos
3. Divisores de seção com linhas duplas estilo jornal impresso

**Interaction Philosophy:**
- Cliques com feedback visual imediato e sem suavização excessiva
- Filtros como toggles físicos estilo painel de controle industrial
- Modais que "empurram" o conteúdo ao invés de sobrepor

**Animation:**
- Mínima: apenas transições de estado (100ms, linear)
- Grafos com layout calculado instantaneamente, sem animação de física
- Foco em velocidade de resposta sobre estética de movimento

**Typography System:**
- Display: Barlow Condensed ExtraBold (títulos, scores)
- Body: Source Sans Pro Regular (conteúdo longo)
- Dados: JetBrains Mono (números, IDs, códigos)

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Intelligence Dashboard — Aesthetic Governamental Futurista

**Core Principles:**
1. Clareza analítica: cada pixel serve à compreensão de dados complexos
2. Profundidade em camadas: informação primária, secundária e terciária claramente hierarquizadas
3. Azul-marinho institucional com acentos técnicos de ciano — credibilidade + modernidade
4. Densidade informacional alta sem sensação de sobrecarga

**Color Philosophy:**
- Fundo: Azul-marinho escuro (#0F172A) — autoridade, profundidade, seriedade institucional
- Superfícies: Azul-ardósia (#1E293B) para cards e painéis
- Primário: Ciano-elétrico (#06B6D4) — dados ativos, links, destaque técnico
- Risco crítico: Coral (#F43F5E)
- Risco moderado: Âmbar (#FBBF24)
- Risco baixo: Esmeralda (#34D399)
- Texto: Branco (#F1F5F9) e cinza-azulado (#94A3B8)

**Layout Paradigm:**
- Dashboard com sidebar colapsável à esquerda
- Grid de painéis redimensionáveis (estilo Bloomberg Terminal moderno)
- Mapa/grafo como elemento central dominante
- Painel de detalhes deslizante da direita

**Signature Elements:**
1. Anéis de score de risco com gradiente radial animado
2. Linhas de conexão no grafo com espessura proporcional ao valor financeiro
3. Mini sparklines inline nas tabelas mostrando tendência temporal

**Interaction Philosophy:**
- Drill-down progressivo: clicar em qualquer elemento revela mais profundidade
- Filtros persistentes visíveis em breadcrumb
- Exportação de relatórios com um clique

**Animation:**
- Entrada de dashboard: painéis surgem em cascata (stagger de 100ms)
- Grafos: física de partículas com spring suave (amortecimento 0.8)
- Scores: contador animado de 0 até o valor final (800ms, ease-out)
- Hover: glow ciano sutil nos elementos interativos

**Typography System:**
- Display: Sora SemiBold (títulos de seção, scores)
- Body: DM Sans Regular (conteúdo, descrições)
- Dados: Fira Code (números, IDs, hashes)
- Hierarquia: 36px display → 20px heading → 15px body → 11px caption mono

</idea>
</response>

---

## Decisão Final

**Escolhido: Intelligence Dashboard — Aesthetic Governamental Futurista**

Razão: Combina credibilidade institucional com modernidade técnica. O dark mode com azul-marinho e ciano cria a atmosfera certa para uma ferramenta analítica séria. A densidade informacional alta é essencial para o público-alvo (jornalistas investigativos, analistas de dados, auditores). A filosofia de drill-down progressivo se alinha perfeitamente com a natureza investigativa da plataforma.
