# Funcionalidades Avançadas - FiscalizaAI v1.3.0

## Visão Geral

Documentação dos três novos recursos implementados na versão 1.3.0:

1. **Autenticação Social (OAuth2)**
2. **Sistema de Permissões (RBAC)**
3. **Exportação em Lote**

---

## 1. Autenticação Social (OAuth2)

### Descrição

Permite que usuários façam login usando suas contas GitHub ou Google, sem necessidade de criar contas separadas.

### Arquivos

- `server/oauth-social.ts` - Gerenciador de OAuth social
- `drizzle/schema.ts` - Campos adicionados à tabela `users`

### Configuração

#### Variáveis de Ambiente

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=seu-client-id-github
GITHUB_CLIENT_SECRET=seu-client-secret-github
GITHUB_CALLBACK_URL=https://fiscalizaai.com.br/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-google
GOOGLE_CLIENT_SECRET=seu-client-secret-google
GOOGLE_CALLBACK_URL=https://fiscalizaai.com.br/auth/google/callback
```

### Configurar GitHub OAuth

1. Acesse [github.com/settings/developers](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os dados:
   - **Application name**: FiscalizaAI
   - **Homepage URL**: https://fiscalizaai.com.br
   - **Authorization callback URL**: https://fiscalizaai.com.br/auth/github/callback
4. Copie o **Client ID** e **Client Secret**

### Configurar Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Vá para "APIs & Services" → "Credentials"
4. Clique em "Create Credentials" → "OAuth 2.0 Client ID"
5. Selecione "Web application"
6. Adicione **Authorized redirect URIs**: https://fiscalizaai.com.br/auth/google/callback
7. Copie o **Client ID** e **Client Secret**

### Uso

#### Gerar URL de Login GitHub

```typescript
import { gerenciadorOAuthSocial } from './server/oauth-social';

const url = gerenciadorOAuthSocial.gerarUrlGitHub(
  process.env.GITHUB_CLIENT_ID,
  'https://fiscalizaai.com.br/auth/github/callback',
  state // Token de segurança
);

// Redirecionar usuário para URL
```

#### Gerar URL de Login Google

```typescript
const url = gerenciadorOAuthSocial.gerarUrlGoogle(
  process.env.GOOGLE_CLIENT_ID,
  'https://fiscalizaai.com.br/auth/google/callback',
  state
);
```

#### Processar Callback GitHub

```typescript
// No endpoint /auth/github/callback
const code = req.query.code;
const state = req.query.state;

// Trocar código por token
const accessToken = await gerenciadorOAuthSocial.trocarCodigoGitHub(
  code,
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET
);

// Obter perfil
const perfil = await gerenciadorOAuthSocial.obterPerfilGitHub(accessToken);

// Processar usuário
const usuario = await gerenciadorOAuthSocial.processarGitHub(perfil);
```

#### Processar Callback Google

```typescript
// No endpoint /auth/google/callback
const code = req.query.code;

// Trocar código por token
const idToken = await gerenciadorOAuthSocial.trocarCodigoGoogle(
  code,
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://fiscalizaai.com.br/auth/google/callback'
);

// Obter perfil
const perfil = await gerenciadorOAuthSocial.obterPerfilGoogle(idToken);

// Processar usuário
const usuario = await gerenciadorOAuthSocial.processarGoogle(perfil);
```

### Fluxo de Login

```
1. Usuário clica em "Login com GitHub/Google"
   ↓
2. Redirecionar para URL de autorização
   ↓
3. Usuário autoriza acesso
   ↓
4. Redirecionar de volta para callback
   ↓
5. Trocar código por token
   ↓
6. Obter perfil do usuário
   ↓
7. Criar/atualizar usuário no banco
   ↓
8. Criar sessão e redirecionar para dashboard
```

---

## 2. Sistema de Permissões (RBAC)

### Descrição

Controle granular de acesso baseado em roles (papéis). Cada usuário tem um role que define quais recursos e ações pode acessar.

### Arquivos

- `server/rbac.ts` - Gerenciador de RBAC
- `drizzle/schema.ts` - Tabelas `permissoes` e `roles_permissoes`

### Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|-----------|
| **visualizador** | Pode visualizar dados e exportar relatórios | Leitura de parlamentares, contratos, alertas, estatísticas |
| **analista** | Pode analisar dados e atualizar alertas | Tudo de visualizador + atualizar alertas, agendar relatórios, exportar lote |
| **admin** | Acesso total ao sistema | Tudo + gerenciar usuários, sincronizações, configurações |

### Permissões por Role

#### Visualizador

```
- parlamentares:listar
- parlamentares:visualizar
- contratos:listar
- contratos:visualizar
- alertas:listar
- alertas:visualizar
- estatisticas:visualizar
- relatorios:exportar
```

#### Analista

```
- [Tudo de visualizador]
- alertas:atualizar_status
- alertas:adicionar_comentario
- parlamentares:adicionar_nota
- contratos:adicionar_nota
- relatorios:agendar
- relatorios:exportar_lote
- grafos:visualizar
```

#### Admin

```
- [Tudo de analista]
- usuarios:listar
- usuarios:criar
- usuarios:editar
- usuarios:deletar
- usuarios:alterar_role
- sincronizacoes:iniciar
- sincronizacoes:visualizar
- configuracoes:editar
- logs:visualizar
```

### Uso

#### Verificar Permissão

```typescript
import { gerenciadorRBAC } from './server/rbac';

const temPermissao = gerenciadorRBAC.temPermissao(
  'analista',
  'relatorios',
  'exportar_lote'
);

if (temPermissao) {
  // Permitir ação
} else {
  // Negar acesso
}
```

#### Verificar Múltiplas Permissões (AND)

```typescript
const permissoes = [
  { recurso: 'parlamentares', acao: 'listar' },
  { recurso: 'contratos', acao: 'listar' },
];

const temTodas = gerenciadorRBAC.temTodasPermissoes('visualizador', permissoes);
```

#### Verificar Múltiplas Permissões (OR)

```typescript
const permissoes = [
  { recurso: 'usuarios', acao: 'editar' },
  { recurso: 'parlamentares', acao: 'listar' },
];

const temAlguma = gerenciadorRBAC.temAlgumaPermissao('visualizador', permissoes);
```

#### Obter Todas as Permissões de um Role

```typescript
const permissoes = gerenciadorRBAC.obterPermissoes('analista');
console.log(permissoes); // Array de permissões
```

#### Comparar Roles

```typescript
const comparacao = gerenciadorRBAC.compararRoles('admin', 'visualizador');
// Retorna: 2 (admin é superior)

const superior = gerenciadorRBAC.roleSuperior('admin', 'visualizador');
// Retorna: true
```

#### Adicionar Permissão Customizada

```typescript
gerenciadorRBAC.adicionarPermissaoCustomizada(
  'analista',
  'relatorios',
  'deletar'
);
```

### Middleware para tRPC

```typescript
import { protectedProcedure } from './server/_core/trpc';
import { requerPermissao } from './server/rbac';

export const meuRouter = router({
  exportarRelatorios: protectedProcedure
    .use(async ({ ctx, next }) => {
      requerPermissao('relatorios', 'exportar_lote')(ctx.user.role);
      return next({ ctx });
    })
    .mutation(async ({ input }) => {
      // Lógica de exportação
    }),
});
```

---

## 3. Exportação em Lote

### Descrição

Permite exportar múltiplos relatórios de uma vez em um arquivo ZIP, facilitando análise offline.

### Arquivos

- `server/exportacao-lote.ts` - Gerenciador de exportação
- `drizzle/schema.ts` - Tabela `exportacoes`

### Tipos de Exportação

| Tipo | Descrição |
|------|-----------|
| **relatorios** | Exporta PDFs de relatórios |
| **dados** | Exporta dados em CSV/JSON |
| **graficos** | Exporta gráficos em PNG |

### Uso

#### Criar Exportação

```typescript
import { gerenciadorExportacaoLote } from './server/exportacao-lote';

const itens = [
  { tipo: 'parlamentar', id: 1, nome: 'João Silva' },
  { tipo: 'parlamentar', id: 2, nome: 'Maria Santos' },
  { tipo: 'contrato', id: 100, nome: 'Contrato XYZ' },
];

const exportacaoId = await gerenciadorExportacaoLote.criarExportacao(
  usuarioId,
  itens,
  'relatorios'
);
```

#### Processar Exportação

```typescript
// Processar em background (recomendado usar fila)
const urlArquivo = await gerenciadorExportacaoLote.processarExportacao(
  exportacaoId,
  itens
);

console.log('Arquivo disponível em:', urlArquivo);
```

#### Obter Status

```typescript
const status = await gerenciadorExportacaoLote.obterStatus(exportacaoId);

console.log({
  status: status.status, // 'pendente', 'processando', 'concluida', 'erro'
  totalItens: status.totalItens,
  itensProcessados: status.itensProcessados,
  urlArquivo: status.urlArquivo,
});
```

#### Listar Exportações do Usuário

```typescript
const exportacoes = await gerenciadorExportacaoLote.listarExportacoes(
  usuarioId,
  10 // Limite
);
```

#### Cancelar Exportação

```typescript
const cancelada = await gerenciadorExportacaoLote.cancelarExportacao(
  exportacaoId
);
```

#### Limpar Exportações Antigas

```typescript
// Deletar exportações com mais de 7 dias
const deletadas = await gerenciadorExportacaoLote.limparExportacoesAntigas(7);
```

### Fluxo de Exportação

```
1. Usuário seleciona itens para exportar
   ↓
2. Verificar permissão (RBAC)
   ↓
3. Criar registro de exportação no banco
   ↓
4. Processar em background (fila)
   ↓
5. Gerar PDFs para cada item
   ↓
6. Criar arquivo ZIP
   ↓
7. Upload para S3
   ↓
8. Atualizar status e URL no banco
   ↓
9. Notificar usuário (email/WebSocket)
   ↓
10. Usuário faz download do ZIP
```

### Recomendações

#### Usar Fila para Processamento

```typescript
import Bull from 'bull';

const filaExportacao = new Bull('exportacao', {
  redis: { host: '127.0.0.1', port: 6379 },
});

filaExportacao.process(async (job) => {
  const { exportacaoId, itens } = job.data;
  
  job.progress(0);
  const urlArquivo = await gerenciadorExportacaoLote.processarExportacao(
    exportacaoId,
    itens
  );
  job.progress(100);
  
  return { urlArquivo };
});

// Adicionar à fila
await filaExportacao.add({ exportacaoId, itens });
```

#### Limpar Automaticamente

```typescript
import cron from 'node-cron';

// Limpar exportações diariamente às 2 da manhã
cron.schedule('0 2 * * *', async () => {
  await gerenciadorExportacaoLote.limparExportacoesAntigas(7);
});
```

---

## Integração Completa

### Fluxo de Usuário Completo

```
1. Novo usuário acessa FiscalizaAI
   ↓
2. Clica em "Login com GitHub"
   ↓
3. Autoriza acesso
   ↓
4. Sistema cria usuário com role "visualizador"
   ↓
5. Usuário faz login
   ↓
6. Sistema verifica permissões (RBAC)
   ↓
7. Usuário visualiza dados permitidos
   ↓
8. Usuário seleciona 50 parlamentares para exportar
   ↓
9. Sistema verifica se tem permissão "relatorios:exportar_lote"
   ↓
10. Cria exportação em lote
   ↓
11. Processa em background
   ↓
12. Notifica usuário quando pronto
   ↓
13. Usuário faz download do ZIP
```

### Exemplo de Implementação

```typescript
// Endpoint tRPC para exportar em lote
export const exportarLoteRouter = router({
  criar: protectedProcedure
    .input(z.object({
      itens: z.array(z.object({
        tipo: z.enum(['parlamentar', 'contrato', 'emenda']),
        id: z.number(),
        nome: z.string(),
      })),
    }))
    .use(async ({ ctx, next }) => {
      // Verificar permissão
      if (!gerenciadorRBAC.temPermissao(ctx.user.role, 'relatorios', 'exportar_lote')) {
        throw new Error('Permissão negada');
      }
      return next({ ctx });
    })
    .mutation(async ({ ctx, input }) => {
      // Criar exportação
      const exportacaoId = await gerenciadorExportacaoLote.criarExportacao(
        ctx.user.id,
        input.itens,
        'relatorios'
      );

      // Processar em background
      // (usar fila em produção)
      gerenciadorExportacaoLote.processarExportacao(
        exportacaoId,
        input.itens
      ).catch(console.error);

      return { exportacaoId };
    }),

  obterStatus: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await gerenciadorExportacaoLote.obterStatus(input);
    }),
});
```

---

## Testes

Todos os recursos incluem testes unitários:

```bash
pnpm test
```

Resultado esperado:
```
✓ server/funcionalidades-avancadas.test.ts (26 tests)
✓ server/recursos-avancados.test.ts (28 tests)
✓ server/novos-recursos.test.ts (20 tests)
✓ server/fiscaliza.test.ts (20 tests)
✓ server/auth.logout.test.ts (1 test)

Test Files  5 passed (5)
Tests  96 passed (96)
```

---

## Troubleshooting

### GitHub OAuth não funciona

```bash
# Verificar variáveis de ambiente
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET

# Testar URL de autorização
curl "https://github.com/login/oauth/authorize?client_id=..."
```

### Google OAuth não funciona

```bash
# Verificar credenciais
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Verificar se redirect URI está configurado
# https://console.cloud.google.com/apis/credentials
```

### Exportação não inicia

```bash
# Verificar permissões do usuário
SELECT role, permissoes FROM users WHERE id = 123;

# Verificar se fila está rodando
redis-cli ping

# Verificar logs
tail -f .manus-logs/devserver.log | grep Exportação
```

### Arquivo ZIP corrompido

```bash
# Verificar integridade
unzip -t arquivo.zip

# Verificar tamanho
ls -lh arquivo.zip

# Verificar se S3 está acessível
aws s3 ls s3://seu-bucket/
```

---

## Roadmap Futuro

- [ ] Login com Microsoft/Apple
- [ ] Autenticação com 2FA
- [ ] Permissões customizadas por usuário
- [ ] Auditoria de ações (quem fez o quê)
- [ ] Exportação incremental (apenas novos dados)
- [ ] Compressão inteligente de ZIP
- [ ] Notificações de progresso em tempo real

---

## Suporte

Para dúvidas ou problemas:

- [Issues do GitHub](https://github.com/oviteira/fiscaliza-ai/issues)
- Email: suporte@fiscalizaai.com.br
