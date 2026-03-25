# Guia de Contribuição — FiscalizaAI

Obrigado pelo interesse em contribuir com o FiscalizaAI! Este documento descreve o processo para contribuir com o projeto.

## Como Contribuir

### 1. Reportar Bugs

Se encontrou um bug, abra uma issue no GitHub com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Ambiente (OS, browser, versão Node)

### 2. Sugerir Funcionalidades

Para sugerir novas funcionalidades:
- Abra uma issue com o label `enhancement`
- Descreva o caso de uso e o impacto esperado
- Inclua mockups ou exemplos se possível

### 3. Contribuir com Código

#### Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USUARIO/fiscaliza-ai.git
cd fiscaliza-ai

# Adicione o repositório original como upstream
git remote add upstream https://github.com/oviteira/fiscaliza-ai.git
```

#### Criar Branch

```bash
# Atualize seu fork
git fetch upstream
git checkout main
git merge upstream/main

# Crie uma branch para sua contribuição
git checkout -b feature/nome-da-funcionalidade
# ou
git checkout -b fix/nome-do-bug
```

#### Desenvolver

```bash
# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev

# Execute verificações de tipo
pnpm check
```

#### Commit e Pull Request

```bash
# Faça commits descritivos
git commit -m "feat: adiciona integração com API do Portal da Transparência"
git commit -m "fix: corrige cálculo de score para parlamentares sem contratos"

# Envie para seu fork
git push origin feature/nome-da-funcionalidade

# Abra um Pull Request no GitHub
```

## Convenções de Código

### Commits (Conventional Commits)

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação sem mudança de lógica
refactor: refatoração de código
test: adição ou correção de testes
chore: tarefas de manutenção
```

### TypeScript

- Use tipos explícitos para props e retornos de funções
- Evite `any` — use `unknown` quando necessário
- Documente funções complexas com JSDoc

### React

- Componentes funcionais com hooks
- Props tipadas com interfaces TypeScript
- Evite prop drilling — use contextos para estado global

### CSS/Tailwind

- Siga o design system definido em `index.css`
- Use as variáveis CSS para cores de risco
- Mantenha consistência com a paleta navy/ciano

## Áreas de Contribuição

### Alta Prioridade

**Integração com APIs Reais**
- Portal da Transparência: `https://api.portaldatransparencia.gov.br`
- TSE: `https://dadosabertos.tse.jus.br`
- SIAFI/SIAPE: via Portal da Transparência
- Receita Federal: `https://www.receitafederal.gov.br/dados`

**Algoritmos de Análise**
- Implementar cálculo real de scores baseado em dados históricos
- Modelos de detecção de anomalias (Isolation Forest, LOF)
- Análise de grafos para detecção de comunidades suspeitas

### Média Prioridade

- Exportação de relatórios (PDF, CSV, JSON)
- Sistema de notificações por e-mail
- Histórico temporal de scores
- Comparação entre parlamentares

### Baixa Prioridade

- Internacionalização (i18n)
- Modo claro/escuro alternável
- PWA (Progressive Web App)
- Testes automatizados

## Segurança Jurídica

**Importante:** Ao contribuir com algoritmos de análise, mantenha sempre:

1. **Linguagem neutra** — Use "score de risco", "padrão estatístico", nunca "corrupção" ou "suspeito"
2. **Rastreabilidade** — Toda conclusão deve ser rastreável até dados públicos verificáveis
3. **Disclaimer** — Mantenha os avisos legais em todas as páginas relevantes
4. **Proporcionalidade** — Scores devem refletir desvios estatísticos, não julgamentos morais

## Código de Conduta

- Seja respeitoso e construtivo
- Foque no impacto para a transparência pública
- Documente suas decisões técnicas
- Priorize a segurança jurídica da plataforma

## Contato

Para dúvidas sobre contribuições, abra uma issue ou entre em contato via GitHub.

---

*Juntos podemos construir uma ferramenta que fortalece a democracia brasileira.*
