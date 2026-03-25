# Guia de Publicação no GitHub — FiscalizaAI

Instruções passo a passo para publicar a plataforma FiscalizaAI no seu repositório GitHub pessoal.

---

## Passo 1: Criar um Novo Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Faça login com sua conta GitHub (https://www.github.com/oviteira)
3. Preencha os campos:
   - **Repository name:** `fiscaliza-ai`
   - **Description:** "Inteligência Artificial para Transparência Pública — Análise de dados governamentais com scores de risco"
   - **Visibility:** Selecione **Public** (para que seja acessível a todos)
   - **Initialize this repository with:** Deixe desmarcado (você já tem os arquivos localmente)

4. Clique em **Create repository**

Você será redirecionado para a página do repositório vazio. Copie a URL: `https://github.com/oviteira/fiscaliza-ai.git`

---

## Passo 2: Configurar Git Localmente

Abra o terminal no diretório do projeto e configure seu Git:

```bash
# Configure seu nome e email (se não estiver configurado)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"

# Verifique a configuração
git config --global user.name
git config --global user.email
```

---

## Passo 3: Inicializar o Repositório Git Local

Se o repositório Git ainda não foi inicializado:

```bash
# Navegue até o diretório do projeto
cd transparencia-publica-ia

# Inicialize o Git
git init

# Adicione todos os arquivos
git add .

# Crie o primeiro commit
git commit -m "feat: plataforma inicial de análise de transparência pública com IA"
```

Se o Git já foi inicializado (o que é provável), verifique o status:

```bash
git status
```

---

## Passo 4: Adicionar o Repositório Remoto

Conecte seu repositório local ao repositório remoto no GitHub:

```bash
# Adicione o repositório remoto
git remote add origin https://github.com/oviteira/fiscaliza-ai.git

# Verifique se foi adicionado corretamente
git remote -v
```

Você deve ver:

```
origin  https://github.com/oviteira/fiscaliza-ai.git (fetch)
origin  https://github.com/oviteira/fiscaliza-ai.git (push)
```

---

## Passo 5: Fazer Push para o GitHub

Envie todos os arquivos para o repositório remoto:

```bash
# Faça o push da branch main
git branch -M main
git push -u origin main
```

Se for a primeira vez, o Git pode pedir autenticação. Você tem duas opções:

### Opção A: Usar Token de Acesso Pessoal (Recomendado)

1. Acesse [github.com/settings/tokens](https://github.com/settings/tokens)
2. Clique em **Generate new token** → **Generate new token (classic)**
3. Preencha:
   - **Token name:** `transparencia-publica-ia-push`
   - **Expiration:** Selecione 90 dias
   - **Scopes:** Marque `repo` (acesso completo a repositórios)
4. Clique em **Generate token**
5. **Copie o token** (você não poderá vê-lo novamente)
6. No terminal, quando pedir senha, cole o token

### Opção B: Usar SSH (Alternativa)

Se preferir usar SSH:

```bash
# Gere uma chave SSH
ssh-keygen -t ed25519 -C "seu.email@example.com"

# Copie a chave pública
cat ~/.ssh/id_ed25519.pub
```

Adicione a chave em [github.com/settings/keys](https://github.com/settings/keys) e configure o Git para usar SSH:

```bash
git remote set-url origin git@github.com:oviteira/transparencia-publica-ia.git
```

---

## Passo 6: Verificar o Push

Após o push, acesse seu repositório no GitHub:

```
https://github.com/oviteira/fiscaliza-ai
```

Você deve ver todos os arquivos do projeto listados, incluindo:
- `README.md`
- `INSTALL.md`
- `CONTRIBUTING.md`
- `package.json`
- `client/` e `server/`

---

## Passo 7: Configurar GitHub Pages (Opcional)

Para publicar a plataforma automaticamente na web, configure o GitHub Pages:

1. Acesse seu repositório no GitHub
2. Clique em **Settings** (engrenagem no canto superior direito)
3. No menu lateral, clique em **Pages**
4. Em **Build and deployment**, selecione:
   - **Source:** `GitHub Actions`
5. O GitHub Actions já está configurado no arquivo `.github/workflows/ci.yml`

A plataforma será publicada automaticamente em:

```
https://oviteira.github.io/fiscaliza-ai/
```

---

## Passo 8: Fazer Commits Futuros

Após fazer alterações no código, siga este fluxo:

```bash
# Verifique o status
git status

# Adicione os arquivos alterados
git add .

# Crie um commit descritivo
git commit -m "feat: adiciona integração com API do Portal da Transparência"

# Faça o push
git push origin main
```

### Convenção de Commits

Use o padrão Conventional Commits:

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação sem mudança de lógica
refactor: refatoração de código
test: adição de testes
chore: tarefas de manutenção
```

---

## Passo 9: Criar Branches para Desenvolvimento

Para trabalhar em novas funcionalidades sem afetar a `main`:

```bash
# Crie uma nova branch
git checkout -b feature/nova-funcionalidade

# Faça suas alterações e commits
git add .
git commit -m "feat: implementa nova funcionalidade"

# Faça push da branch
git push origin feature/nova-funcionalidade

# No GitHub, abra um Pull Request (PR) para revisar antes de fazer merge
```

---

## Passo 10: Adicionar Badges ao README

Para tornar seu repositório mais profissional, adicione badges ao início do `README.md`:

```markdown
[![Licença MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org)
[![GitHub Stars](https://img.shields.io/github/stars/oviteira/fiscaliza-ai?style=social)](https://github.com/oviteira/fiscaliza-ai)
```

---

## Passo 11: Configurar Tópicos do Repositório

Para melhorar a descoberta do projeto:

1. No repositório, clique em **About** (ícone de engrenagem)
2. Em **Topics**, adicione:
   - `transparency`
   - `public-data`
   - `ai`
   - `brazil`
   - `open-source`
   - `react`
   - `typescript`

3. Clique em **Save changes**

---

## Passo 12: Criar um CHANGELOG

Mantenha um registro de mudanças para cada versão:

```bash
# Crie o arquivo CHANGELOG.md
touch CHANGELOG.md
```

Adicione ao `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] — 2026-03-25

### Added
- Painel geral com estatísticas em tempo real
- Análise de parlamentares com scores de risco
- Grafo de conexões interativo com D3.js
- Análise de contratos públicos
- Central de alertas categorizados
- Catálogo de 34+ fontes de dados
- Documentação completa da metodologia

### Security
- Todos os dados são públicos e abertos
- Linguagem técnica neutra sem acusações
- Avisos legais em todas as páginas
```

Faça commit:

```bash
git add CHANGELOG.md
git commit -m "docs: adiciona changelog inicial"
git push origin main
```

---

## Solução de Problemas

### Erro: "fatal: remote origin already exists"

**Solução:** Se o repositório remoto já existe, atualize-o:

```bash
git remote remove origin
git remote add origin https://github.com/oviteira/fiscaliza-ai.git
```

### Erro: "Permission denied (publickey)"

**Solução:** Se usar SSH, verifique se a chave está configurada:

```bash
ssh -T git@github.com
```

Se não funcionar, use HTTPS em vez de SSH.

### Erro: "fatal: The current branch main has no upstream branch"

**Solução:** Use o flag `-u` no primeiro push:

```bash
git push -u origin main
```

### Arquivos grandes não fazem push

**Solução:** O GitHub tem limite de 100MB por arquivo. Se tiver arquivos grandes:

```bash
# Instale Git LFS (Large File Storage)
git lfs install

# Rastreie arquivos grandes
git lfs track "*.zip"
git add .gitattributes
git commit -m "chore: configure git lfs"
```

---

## Próximos Passos

Após publicar no GitHub:

1. **Divulgue o projeto** — Compartilhe o link em redes sociais, comunidades e fóruns relevantes
2. **Abra issues** — Crie issues para funcionalidades planejadas e bugs conhecidos
3. **Convide colaboradores** — Adicione pessoas interessadas como colaboradores
4. **Mantenha atualizado** — Faça commits regularmente com melhorias e correções

---

## Referências Úteis

- [GitHub Docs — Creating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)
- [GitHub Docs — Pushing commits to a remote repository](https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

*Parabéns! Sua plataforma FiscalizaAI agora está publicada no GitHub e acessível ao mundo!*
