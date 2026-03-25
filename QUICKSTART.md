# Quick Start — FiscalizaAI

Comece em 5 minutos com a plataforma FiscalizaAI.

---

## 1. Clonar e Instalar

```bash
git clone https://github.com/oviteira/fiscaliza-ai.git
cd fiscaliza-ai
pnpm install
```

---

## 2. Iniciar o Servidor

```bash
pnpm dev
```

Acesse http://localhost:3000 no seu navegador.

---

## 3. Explorar a Plataforma

| Página | URL | Descrição |
|--------|-----|-----------|
| Painel Geral | `/` | Visão consolidada com gráficos |
| Parlamentares | `/parlamentares` | Lista com scores de risco |
| Grafo de Conexões | `/grafos` | Visualização interativa D3 |
| Contratos | `/contratos` | Análise de contratos públicos |
| Alertas | `/alertas` | Central de alertas |
| Fontes | `/fontes` | Catálogo de bases de dados |
| Metodologia | `/metodologia` | Documentação dos algoritmos |

---

## 4. Fazer Alterações

Edite qualquer arquivo em `client/src/` e veja as mudanças instantaneamente no navegador (HMR).

---

## 5. Publicar no GitHub

```bash
git remote add origin https://github.com/oviteira/transparencia-publica-ia.git
git branch -M main
git push -u origin main
```

Consulte [GITHUB_SETUP.md](GITHUB_SETUP.md) para detalhes completos.

---

## 6. Build para Produção

```bash
pnpm build
pnpm preview
```

---

## Próximos Passos

- Leia [INSTALL.md](INSTALL.md) para instruções detalhadas
- Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para contribuir
- Veja [README.md](README.md) para visão geral do projeto

---

*Pronto para começar? Faça o clone acima e execute `pnpm dev`!*
