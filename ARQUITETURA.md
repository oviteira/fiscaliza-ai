# Arquitetura do FiscalizaAI

## Visão Geral

FiscalizaAI é uma plataforma de análise de transparência pública que cruza dados de múltiplas fontes governamentais para identificar padrões de risco e inconsistências financeiras.

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React 19)                    │
│  - Dashboard com gráficos interativos                    │
│  - Visualização de grafos de conexões (D3.js)           │
│  - Busca e filtros avançados                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              tRPC API Gateway                            │
│  - Procedimentos públicos (queries)                      │
│  - Procedimentos protegidos (mutations)                  │
│  - Type-safe end-to-end                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Node.js + Express)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Routers tRPC                                    │   │
│  │  - parlamentares.ts                             │   │
│  │  - contratos.ts                                 │   │
│  │  - emendas.ts                                   │   │
│  │  - alertas.ts                                   │   │
│  │  - analise.ts                                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Serviços                                        │   │
│  │  - sincronizacao-dados.ts                       │   │
│  │  - analise-risco.ts                             │   │
│  │  - integracao-apis.ts                           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Database Layer (Drizzle ORM)                    │   │
│  │  - Queries tipadas                              │   │
│  │  - Migrations automáticas                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Banco de Dados (MySQL)                      │
│  - Parlamentares                                        │
│  - Contratos                                            │
│  - Emendas                                              │
│  - Alertas                                              │
│  - Sincronizações                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         APIs Externas (Dados Públicos)                   │
│  - Portal da Transparência Federal                      │
│  - TSE (Tribunal Superior Eleitoral)                    │
│  - Receita Federal (CNPJ)                               │
│  - SIAFI (Execução Orçamentária)                        │
│  - Portais Estaduais de Transparência                   │
└─────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Frontend (React 19 + Tailwind CSS)

**Localização**: `client/src/`

**Componentes**:
- `Layout.tsx` - Layout principal com sidebar
- `Header.tsx` - Cabeçalho com ticker de dados
- `RiskScore.tsx` - Visualização de scores de risco
- `NetworkGraph.tsx` - Grafo de conexões (D3.js)
- `Sidebar.tsx` - Navegação lateral

**Páginas**:
- `Home.tsx` - Dashboard principal
- `Parlamentares.tsx` - Lista de parlamentares
- `Grafos.tsx` - Visualização de conexões
- `Contratos.tsx` - Análise de contratos
- `Alertas.tsx` - Central de alertas
- `Fontes.tsx` - Fontes de dados integradas
- `Metodologia.tsx` - Explicação da IA

### 2. Backend (Node.js + Express)

**Localização**: `server/`

**Routers tRPC** (`server/routers/fiscaliza.ts`):
```
fiscaliza/
├── parlamentares/
│   ├── listar()
│   ├── buscarPorCPF()
│   ├── buscarPorNome()
│   └── obterDetalhes()
├── contratos/
│   ├── listar()
│   └── buscarPorNumero()
├── emendas/
│   ├── listar()
│   └── buscarPorParlamentar()
├── alertas/
│   ├── listar()
│   └── buscarPorParlamentar()
└── analise/
    ├── obterEstatisticas()
    └── distribuicaoRisco()
```

**Serviços**:
- `integracao-apis.ts` - Conecta às APIs do governo
- `analise-risco.ts` - Calcula scores de risco
- `sincronizacao-dados.ts` - Sincroniza dados periodicamente

### 3. Banco de Dados (MySQL)

**Schema** (`drizzle/schema.ts`):

```sql
-- Parlamentares
CREATE TABLE parlamentares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  partido VARCHAR(50),
  estado VARCHAR(2),
  scoreRisco VARCHAR(10),
  nivelRisco ENUM('baixo', 'medio', 'alto', 'critico'),
  totalContratos INT,
  totalEmendas INT,
  ...
);

-- Contratos
CREATE TABLE contratos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numeroContrato VARCHAR(50) UNIQUE NOT NULL,
  orgaoContratante VARCHAR(255),
  empresaContratada VARCHAR(255),
  valorContrato VARCHAR(30),
  dataAssinatura TIMESTAMP,
  scoreRisco VARCHAR(10),
  nivelRisco ENUM('baixo', 'medio', 'alto', 'critico'),
  temSobrepreco INT,
  temVinculoFamiliar INT,
  ...
);

-- Emendas
CREATE TABLE emendas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numeroEmenda VARCHAR(50) UNIQUE NOT NULL,
  parlamentarId INT,
  parlamentarNome VARCHAR(255),
  valorEmenda VARCHAR(30),
  municipio VARCHAR(100),
  estado VARCHAR(2),
  scoreRisco VARCHAR(10),
  nivelRisco ENUM('baixo', 'medio', 'alto', 'critico'),
  ...
);

-- Alertas
CREATE TABLE alertas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('sobrepreco', 'vinculo_familiar', ...),
  parlamentarId INT,
  contratoId INT,
  emendaId INT,
  titulo VARCHAR(255),
  descricao TEXT,
  scoreRisco VARCHAR(10),
  nivelRisco ENUM('baixo', 'medio', 'alto', 'critico'),
  status ENUM('novo', 'analisando', 'confirmado', 'descartado'),
  ...
);
```

## Fluxo de Dados

### 1. Sincronização de Dados

```
APIs Governamentais
        ↓
gerenciadorIntegracoes.sincronizarTodos()
        ↓
sincronizador.sincronizarContratos()
sincronizador.sincronizarEmendas()
        ↓
Banco de Dados (INSERT/UPDATE)
```

**Frequência**: A cada 6 horas (configurável)

### 2. Cálculo de Scores de Risco

```
Dados do Banco
        ↓
AnalisadorRisco.calcularScoreParlamentar()
        ↓
Indicadores:
- Concentração de Fornecedor (25%)
- Variação Patrimonial (20%)
- Vínculo Familiar (22%)
- Sobrepreço (18%)
- Padrão de Emendas (10%)
- Inconsistência RH (5%)
        ↓
Score Final (0-100)
        ↓
Classificação: Baixo/Médio/Alto/Crítico
        ↓
Banco de Dados (UPDATE scoreRisco, nivelRisco)
```

### 3. Busca e Visualização

```
Usuário acessa Frontend
        ↓
React chama tRPC query
        ↓
Backend executa query no Banco
        ↓
Dados retornam com type-safety
        ↓
Frontend renderiza gráficos/tabelas
```

## Indicadores de Risco

### 1. Concentração de Fornecedor (25%)

**Lógica**: Detecta se um parlamentar direciona a maioria dos contratos para um único fornecedor.

```
Percentual = (Valor do Maior Fornecedor / Total) * 100

> 80% → 100 (crítico)
> 60% → 75 (alto)
> 40% → 50 (médio)
> 20% → 25 (baixo)
≤ 20% → 0 (sem risco)
```

### 2. Vínculo Familiar (22%)

**Lógica**: Detecta se familiares do parlamentar são sócios de empresas contratadas.

```
Percentual = (Contratos com Familiar / Total) * 100

> 50% → 100 (crítico)
> 30% → 75 (alto)
> 10% → 50 (médio)
> 0% → 25 (baixo)
= 0% → 0 (sem risco)
```

### 3. Sobrepreço (18%)

**Lógica**: Detecta contratos com valores acima da referência SINAPI.

```
Risco = (% Contratos com Sobrepreço * 0.5) + (Maior Sobrepreço * 0.5)
```

### 4. Padrão de Emendas (10%)

**Lógica**: Detecta concentração geográfica ou temporal anormal.

```
Risco = Concentração Geográfica + Concentração Temporal
```

### 5. Variação Patrimonial (20%)

**Lógica**: Detecta variações anormais no patrimônio declarado (requer dados de IR).

### 6. Inconsistência RH (5%)

**Lógica**: Detecta funcionários fantasmas (requer dados de SIAPE).

## Fluxo de Autenticação

```
Usuário clica "Login"
        ↓
Redireciona para OAuth (Manus)
        ↓
Usuário autentica
        ↓
OAuth retorna token
        ↓
Backend valida token
        ↓
Cria sessão (JWT)
        ↓
Frontend armazena cookie de sessão
        ↓
Requisições subsequentes incluem sessão
```

## Segurança

### 1. Autenticação
- OAuth 2.0 via Manus
- JWT para sessões
- Cookies HTTP-only

### 2. Autorização
- Role-based access control (RBAC)
- Admin pode sincronizar dados
- Usuários podem visualizar dados públicos

### 3. Validação
- Zod para validação de entrada
- Type-safety end-to-end com tRPC
- Sanitização de dados

### 4. Proteção de Dados
- Conexão HTTPS/TLS
- Variáveis sensíveis em .env
- Sem exposição de chaves API

## Performance

### 1. Caching
- Dados são cacheados no banco
- Queries otimizadas com índices
- Frontend cache com React Query

### 2. Paginação
- Limite padrão: 50 registros
- Offset-based pagination
- Suporta filtros avançados

### 3. Índices do Banco
```sql
CREATE INDEX idx_parlamentares_scoreRisco ON parlamentares(scoreRisco);
CREATE INDEX idx_parlamentares_estado ON parlamentares(estado);
CREATE INDEX idx_contratos_scoreRisco ON contratos(scoreRisco);
CREATE INDEX idx_emendas_estado ON emendas(estado);
```

## Escalabilidade

### Horizontal
- Stateless backend (pode rodar em múltiplas instâncias)
- Load balancer (Nginx)
- Banco de dados centralizado

### Vertical
- Aumentar recursos do servidor
- Otimizar queries
- Implementar Redis para cache

## Monitoramento

### Métricas
- Tempo de resposta das APIs
- Taxa de erro
- Uso de memória/CPU
- Tamanho do banco de dados

### Logs
- `.manus-logs/devserver.log` - Servidor
- `.manus-logs/browserConsole.log` - Erros do frontend
- `.manus-logs/networkRequests.log` - Requisições HTTP

## Roadmap Futuro

1. **Análise em Tempo Real**
   - WebSocket para atualizações live
   - Alertas instantâneos

2. **Machine Learning**
   - Detecção de anomalias com ML
   - Previsão de riscos

3. **Integração com Mais Fontes**
   - Portais municipais
   - Dados de doações eleitorais
   - Dados de patrimônio

4. **Exportação de Relatórios**
   - PDF com análises detalhadas
   - Excel com dados brutos
   - Gráficos customizáveis

5. **API Pública**
   - Endpoints REST para terceiros
   - Documentação OpenAPI
   - Rate limiting

## Referências

- [Drizzle ORM](https://orm.drizzle.team/)
- [tRPC](https://trpc.io/)
- [React 19](https://react.dev/)
- [D3.js](https://d3js.org/)
- [Portal da Transparência](https://www.portaldatransparencia.gov.br/)
