# Tutorial de Instalação — FiscalizaAI

Guia passo a passo para instalar e executar a plataforma FiscalizaAI localmente em sua máquina.

---

## Pré-requisitos

Antes de começar, certifique-se de que você tem instalado:

| Ferramenta | Versão Mínima | Download |
|-----------|--------------|----------|
| Node.js | 22.0 | [nodejs.org](https://nodejs.org) |
| Git | 2.40 | [git-scm.com](https://git-scm.com) |
| pnpm | 10.0 | [pnpm.io](https://pnpm.io) |

### Verificar Instalação

Abra o terminal e execute:

```bash
node --version
# v22.13.0 (ou superior)

git --version
# git version 2.40.0 (ou superior)

pnpm --version
# 10.4.1 (ou superior)
```

Se algum comando não for reconhecido, instale a ferramenta correspondente antes de prosseguir.

---

## Passo 1: Clonar o Repositório

Escolha um diretório onde deseja armazenar o projeto e execute:

```bash
# Navegue até o diretório desejado
cd ~/projetos
# ou
cd C:\Users\SeuUsuario\projetos

# Clone o repositório
git clone https://github.com/oviteira/fiscaliza-ai.git

# Entre no diretório do projeto
cd fiscaliza-ai
```

---

## Passo 2: Instalar Dependências

Com o terminal aberto no diretório do projeto, execute:

```bash
pnpm install
```

Este comando irá:
- Baixar todas as dependências do projeto (React, TypeScript, Tailwind, D3.js, etc.)
- Criar a pasta `node_modules/` com os pacotes
- Gerar o arquivo `pnpm-lock.yaml` para garantir versões consistentes

**Tempo estimado:** 2–5 minutos, dependendo da velocidade da sua conexão.

Se encontrar erros durante a instalação, verifique se você tem permissão de escrita no diretório e se a conexão com a internet está estável.

---

## Passo 3: Iniciar o Servidor de Desenvolvimento

Após a instalação das dependências, inicie o servidor:

```bash
pnpm dev
```

Você verá uma saída similar a:

```
➜  Local:   http://localhost:3000/
➜  Network: http://169.254.0.21:3000/
```

Abra seu navegador e acesse **http://localhost:3000/**. A plataforma deve carregar com o painel geral, gráficos e dados de demonstração.

---

## Passo 4: Explorar a Plataforma

A plataforma está organizada em 7 módulos principais:

### 1. Painel Geral (`/`)
Visão consolidada com estatísticas em tempo real, gráficos de evolução de alertas e cards com os principais indicadores.

### 2. Parlamentares (`/parlamentares`)
Lista de parlamentares com scores de risco, tabela interativa, filtros por nível de risco e painel lateral com detalhes.

### 3. Grafo de Conexões (`/grafos`)
Visualização interativa de redes com D3.js. Clique em qualquer nó para ver suas conexões e detalhes.

### 4. Contratos (`/contratos`)
Análise de contratos públicos com scores de risco, tabela com filtros e detalhamento de cada contrato.

### 5. Alertas (`/alertas`)
Central com todos os alertas detectados, categorizados por tipo, com valor envolvido e fontes de dados.

### 6. Fontes de Dados (`/fontes`)
Catálogo das 34+ bases de dados integradas, status de sincronização e quantidade de registros.

### 7. Metodologia (`/metodologia`)
Documentação completa da metodologia, composição dos scores e pipeline de análise.

---

## Passo 5: Fazer Alterações no Código

A plataforma utiliza **Vite** com **Hot Module Replacement (HMR)**, o que significa que as alterações no código são refletidas instantaneamente no navegador.

### Exemplo: Alterar o Título da Página

1. Abra o arquivo `client/src/pages/Home.tsx`
2. Localize a linha com o título
3. Faça a alteração e salve o arquivo
4. O navegador atualizará automaticamente

### Estrutura de Arquivos

```
client/src/
├── pages/              # Páginas da aplicação
│   ├── Home.tsx
│   ├── Parlamentares.tsx
│   ├── Grafos.tsx
│   ├── Contratos.tsx
│   ├── Alertas.tsx
│   ├── Fontes.tsx
│   └── Metodologia.tsx
├── components/         # Componentes reutilizáveis
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── NetworkGraph.tsx
│   └── RiskScore.tsx
├── lib/
│   └── mockData.ts     # Dados de demonstração
├── App.tsx             # Roteamento principal
└── index.css           # Design system global
```

---

## Passo 6: Verificar Tipos TypeScript

Para garantir que não há erros de tipo no código:

```bash
pnpm check
```

Este comando verifica todo o código TypeScript sem compilar. Execute antes de fazer commits.

---

## Passo 7: Build para Produção

Quando estiver pronto para publicar, crie uma versão otimizada:

```bash
pnpm build
```

Este comando irá:
- Compilar o código TypeScript
- Otimizar e minificar os arquivos
- Gerar a pasta `dist/` com os arquivos prontos para deploy

**Tempo estimado:** 1–2 minutos.

---

## Passo 8: Visualizar Build Localmente

Para testar a versão de produção localmente:

```bash
pnpm preview
```

Abra http://localhost:4173/ para ver como a aplicação se comportará em produção.

---

## Solução de Problemas

### Erro: "pnpm: command not found"

**Solução:** Instale o pnpm globalmente:

```bash
npm install -g pnpm@10
```

### Erro: "Port 3000 is already in use"

**Solução:** Use uma porta diferente:

```bash
pnpm dev -- --port 3001
```

### Erro: "Cannot find module 'react'"

**Solução:** Reinstale as dependências:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Alterações no código não aparecem no navegador

**Solução:** Limpe o cache e reinicie:

```bash
# Feche o servidor (Ctrl+C)
# Limpe o cache do Vite
rm -rf .vite

# Reinicie
pnpm dev
```

### Erro ao executar `pnpm check`

**Solução:** Verifique se há erros de sintaxe. Se persistir:

```bash
pnpm install
pnpm check
```

---

## Próximos Passos

Após instalar e explorar a plataforma localmente, você pode:

1. **Integrar dados reais** — Substitua os dados mock em `client/src/lib/mockData.ts` por chamadas reais às APIs do Portal da Transparência
2. **Customizar o design** — Modifique as cores e tipografia em `client/src/index.css`
3. **Adicionar novas funcionalidades** — Crie novos componentes e páginas seguindo a estrutura existente
4. **Publicar no GitHub** — Siga o guia em `GITHUB_SETUP.md`

---

## Suporte

Se encontrar problemas durante a instalação:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte a seção "Solução de Problemas" acima
3. Abra uma issue no GitHub com detalhes do erro
4. Inclua a saída completa do terminal e sua configuração de sistema

---

*Parabéns! Você agora tem o FiscalizaAI rodando localmente. Próximo passo: publicar no GitHub!*
