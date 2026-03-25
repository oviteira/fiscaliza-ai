# Recursos Avançados - FiscalizaAI v1.2.0

## Visão Geral

Esta documentação descreve os três recursos avançados implementados na versão 1.2.0 do FiscalizaAI:

1. **Agendamento de Relatórios**
2. **Integração com Slack e Microsoft Teams**
3. **Dashboard de Estatísticas**

---

## 1. Agendamento de Relatórios

### Descrição

Permite agendar a geração automática de relatórios em PDF em horários específicos (diários, semanais ou mensais), com envio automático por email para destinatários configurados.

### Arquivos

- `server/agendamento-relatorios.ts` - Gerenciador de agendamentos
- `drizzle/schema.ts` - Tabela `relatorios_agendados`

### Configuração

#### Variáveis de Ambiente

```bash
# Não requer configuração adicional, usa as mesmas do sistema de email
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@seu-dominio.com
SMTP_PASSWORD=sua-senha-smtp
SMTP_FROM=noreply@fiscalizaai.com.br
```

#### Inicialização

```typescript
import { gerenciadorAgendamentos } from './server/agendamento-relatorios';

// No servidor, após iniciar Express
await gerenciadorAgendamentos.inicializar();
```

### Uso

#### Agendar Novo Relatório

```typescript
import { gerenciadorAgendamentos } from './server/agendamento-relatorios';

const agendamento = {
  id: 1,
  parlamentarId: 123,
  frequencia: 'semanal' as const,
  horario: '14:30',
  destinatarios: ['admin@fiscalizaai.com.br', 'jornalista@exemplo.com'],
  ativo: true,
};

gerenciadorAgendamentos.agendar(agendamento);
```

#### Frequências Suportadas

| Frequência | Descrição | Exemplo |
|-----------|-----------|---------|
| `diaria` | Todos os dias no horário especificado | 14:30 todos os dias |
| `semanal` | Toda segunda-feira no horário especificado | 14:30 toda segunda |
| `mensal` | Primeiro dia do mês no horário especificado | 14:30 dia 1º de cada mês |

#### Cancelar Agendamento

```typescript
gerenciadorAgendamentos.cancelar(1);
```

#### Obter Agendamentos Ativos

```typescript
const total = gerenciadorAgendamentos.obterAgendamentos();
console.log(`${total} agendamentos ativos`);
```

#### Parar Todos os Agendamentos

```typescript
gerenciadorAgendamentos.pararTodos();
```

### Fluxo de Execução

```
1. Horário agendado é atingido
   ↓
2. Relatório é gerado em PDF
   ↓
3. PDF é armazenado em S3
   ↓
4. Email é enviado para todos os destinatários
   ↓
5. Próximo agendamento é registrado
```

### Exemplo Completo

```typescript
// Agendar relatório semanal para parlamentar
const agendamento = {
  id: 1,
  parlamentarId: 123,
  frequencia: 'semanal',
  horario: '09:00',
  destinatarios: [
    'admin@fiscalizaai.com.br',
    'coordenador@ong.org.br',
  ],
  ativo: true,
};

gerenciadorAgendamentos.agendar(agendamento);

// Relatório será gerado toda segunda-feira às 9h
// e enviado por email para os destinatários
```

---

## 2. Integração com Slack e Microsoft Teams

### Descrição

Envia notificações em tempo real para canais do Slack e webhooks do Microsoft Teams quando alertas são detectados.

### Arquivos

- `server/integracao-slack-teams.ts` - Gerenciador de integrações

### Configuração

#### Variáveis de Ambiente

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-seu-token-slack

# Teams (não requer env, usa webhooks)
# Webhooks são configurados por alerta/canal
```

#### Inicialização

```typescript
import { inicializarIntegracoes } from './server/integracao-slack-teams';

// No servidor, após iniciar Express
inicializarIntegracoes();
```

### Slack

#### Obter Token

1. Acesse [api.slack.com/apps](https://api.slack.com/apps)
2. Crie uma nova aplicação
3. Em "OAuth & Permissions", adicione as scopes:
   - `chat:write`
   - `channels:read`
   - `users:read`
4. Copie o "Bot User OAuth Token"

#### Enviar Mensagem

```typescript
import { gerenciadorSlackTeams } from './server/integracao-slack-teams';

const sucesso = await gerenciadorSlackTeams.enviarSlack({
  canal: '#alertas-fiscalizacao',
  titulo: 'Sobrepreço Detectado',
  descricao: 'Contrato com sobrepreço de 25% foi detectado',
  scoreRisco: 85,
  nivelRisco: 'alto',
  linkAnalise: 'https://fiscalizaai.com.br/contratos/123',
  campos: [
    {
      titulo: 'Parlamentar',
      valor: 'João Silva',
      curto: true,
    },
    {
      titulo: 'Valor do Contrato',
      valor: 'R$ 500.000,00',
      curto: true,
    },
  ],
});
```

#### Enviar para Múltiplos Canais

```typescript
const enviadas = await gerenciadorSlackTeams.enviarSlackMultiplo(
  ['#alertas-fiscalizacao', '#alertas-geral', '#monitoramento'],
  {
    titulo: 'Novo Alerta',
    descricao: 'Um novo alerta foi detectado',
    scoreRisco: 75,
    nivelRisco: 'alto',
    linkAnalise: 'https://fiscalizaai.com.br/alertas/456',
  }
);

console.log(`${enviadas} mensagens enviadas`);
```

#### Testar Conexão

```typescript
const conectado = await gerenciadorSlackTeams.testarSlack();
console.log('Slack conectado:', conectado);
```

### Microsoft Teams

#### Obter Webhook

1. Acesse seu workspace do Teams
2. Clique em "⋯ Mais opções" no canal desejado
3. Selecione "Conectores"
4. Procure por "Incoming Webhook"
5. Configure e copie a URL do webhook

#### Enviar Mensagem

```typescript
import { gerenciadorSlackTeams } from './server/integracao-slack-teams';

const sucesso = await gerenciadorSlackTeams.enviarTeams({
  webhook: 'https://outlook.webhook.office.com/webhookb2/...',
  titulo: 'Sobrepreço Detectado',
  descricao: 'Contrato com sobrepreço de 25% foi detectado',
  scoreRisco: 85,
  nivelRisco: 'alto',
  linkAnalise: 'https://fiscalizaai.com.br/contratos/123',
  cor: '#F43F5E',
});
```

#### Enviar para Múltiplos Webhooks

```typescript
const enviadas = await gerenciadorSlackTeams.enviarTeamsMultiplo(
  [
    'https://outlook.webhook.office.com/webhookb2/...1',
    'https://outlook.webhook.office.com/webhookb2/...2',
  ],
  {
    titulo: 'Novo Alerta',
    descricao: 'Um novo alerta foi detectado',
    scoreRisco: 75,
    nivelRisco: 'alto',
    linkAnalise: 'https://fiscalizaai.com.br/alertas/456',
  }
);

console.log(`${enviadas} mensagens enviadas`);
```

#### Testar Conexão

```typescript
const conectado = await gerenciadorSlackTeams.testarTeams(
  'https://outlook.webhook.office.com/webhookb2/...'
);
console.log('Teams conectado:', conectado);
```

### Cores de Risco

As mensagens usam cores específicas para cada nível de risco:

| Nível | Cor Slack | Cor Hex |
|-------|-----------|---------|
| Crítico | danger | #F43F5E |
| Alto | warning | #FBBF24 |
| Médio | warning | #F59E0B |
| Baixo | good | #34D399 |

---

## 3. Dashboard de Estatísticas

### Descrição

Página de análises com gráficos de tendências, distribuições e evolução temporal dos dados de risco.

### Arquivos

- `client/src/pages/Estatisticas.tsx` - Página de estatísticas

### Componentes

#### Cards de Resumo

Mostram estatísticas principais:
- Parlamentares monitorados
- Contratos analisados
- Alertas detectados
- Score médio de risco

#### Gráficos

1. **Tendência de Risco** - Gráfico de área mostrando evolução do score de risco
2. **Distribuição de Nível de Risco** - Gráfico de pizza com distribuição por nível
3. **Tipos de Alerta Mais Comuns** - Gráfico de barras com tipos de alerta
4. **Evolução de Contratos** - Gráfico de linha com evolução mensal
5. **Parlamentares com Maior Risco** - Lista com top 5 parlamentares

### Uso

```typescript
import Estatisticas from '@/pages/Estatisticas';

// Adicionar rota
<Route path="/estatisticas" component={Estatisticas} />
```

### Customização

#### Alterar Dados

Os dados são mock e podem ser substituídos por dados reais:

```typescript
// Antes (mock)
const dadosTendenciaRisco = [
  { data: '01/03', scoreRisco: 45, parlamentares: 150 },
  // ...
];

// Depois (real)
const { data: dadosTendenciaRisco } = trpc.estatisticas.tendenciaRisco.useQuery();
```

#### Adicionar Novo Gráfico

```typescript
<Card className="bg-slate-800 border-slate-700">
  <CardHeader>
    <CardTitle className="text-white">Novo Gráfico</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={seusDados}>
        {/* Componentes do Recharts */}
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### Exemplo de Integração com tRPC

```typescript
// server/routers/estatisticas.ts
export const estatisticasRouter = router({
  tendenciaRisco: publicProcedure.query(async () => {
    const db = await getDb();
    // Buscar dados do banco
    return dados;
  }),
});

// client/src/pages/Estatisticas.tsx
const { data: dadosTendencia } = trpc.estatisticas.tendenciaRisco.useQuery();
```

---

## Integração Completa

### Fluxo de Alerta com Todos os Recursos

```
1. Novo alerta detectado na análise de risco
   ↓
2. Emitir via WebSocket (tempo real)
   ↓
3. Enviar notificação Slack/Teams
   ↓
4. Agendar relatório se necessário
   ↓
5. Atualizar dashboard de estatísticas
   ↓
6. Enviar email com detalhes
```

### Exemplo Completo

```typescript
import { gerenciadorWebSocket } from './server/websocket-realtime';
import { gerenciadorSlackTeams } from './server/integracao-slack-teams';
import { gerenciadorAgendamentos } from './server/agendamento-relatorios';
import { gerenciadorNotificacoes } from './server/notificacoes-email';

async function processarNovoAlerta(alerta: any) {
  // 1. WebSocket
  gerenciadorWebSocket.emitirNovoAlerta({
    id: alerta.id,
    parlamentarId: alerta.parlamentarId,
    tipo: alerta.tipo,
    titulo: alerta.titulo,
    scoreRisco: alerta.scoreRisco,
    nivelRisco: alerta.nivelRisco,
    timestamp: new Date(),
  });

  // 2. Slack
  await gerenciadorSlackTeams.enviarSlack({
    canal: '#alertas-fiscalizacao',
    titulo: alerta.titulo,
    descricao: alerta.descricao,
    scoreRisco: alerta.scoreRisco,
    nivelRisco: alerta.nivelRisco,
    linkAnalise: `https://fiscalizaai.com.br/alertas/${alerta.id}`,
  });

  // 3. Email
  await gerenciadorNotificacoes.enviarAlerta({
    destinatario: 'admin@fiscalizaai.com.br',
    parlamentar: alerta.parlamentarNome,
    tipoAlerta: alerta.tipo,
    scoreRisco: alerta.scoreRisco,
    nivelRisco: alerta.nivelRisco,
    descricao: alerta.descricao,
    linkAnalise: `https://fiscalizaai.com.br/alertas/${alerta.id}`,
  });
}
```

---

## Testes

Todos os recursos avançados incluem testes unitários:

```bash
pnpm test
```

Resultado esperado:
```
✓ server/recursos-avancados.test.ts (28 tests)
✓ server/novos-recursos.test.ts (20 tests)
✓ server/fiscaliza.test.ts (20 tests)
✓ server/auth.logout.test.ts (1 test)

Test Files  4 passed (4)
Tests  69 passed (69)
```

---

## Performance

### Recomendações

1. **Agendamento**: Usar fila (Bull) para agendamentos em volume
2. **Slack/Teams**: Implementar retry automático com backoff exponencial
3. **Dashboard**: Cachear dados com Redis para melhor performance

### Escalabilidade

Para múltiplas instâncias:

```typescript
// Usar Redis para compartilhar estado
import Redis from 'ioredis';

const redis = new Redis();

// Sincronizar agendamentos entre instâncias
gerenciadorAgendamentos.sincronizar(redis);
```

---

## Troubleshooting

### Agendamento não executa

```bash
# Verificar logs
tail -f .manus-logs/devserver.log | grep "Agendamento"

# Verificar se horário está correto
# Formato: HH:mm (24h)
```

### Slack não recebe mensagens

```bash
# Verificar token
echo $SLACK_BOT_TOKEN

# Testar conexão
curl -X POST https://slack.com/api/auth.test \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"
```

### Teams não recebe mensagens

```bash
# Testar webhook
curl -X POST https://outlook.webhook.office.com/webhookb2/... \
  -H "Content-Type: application/json" \
  -d '{"text":"Teste"}'
```

### Dashboard não carrega dados

```typescript
// Verificar se dados mock estão corretos
console.log('Dados:', dadosTendenciaRisco);

// Verificar se Recharts está renderizando
// Abrir DevTools → Network → verificar requisições
```

---

## Roadmap Futuro

- [ ] Agendamento com recorrência customizada
- [ ] Notificações em Discord
- [ ] Alertas em tempo real com push notifications
- [ ] Exportação de gráficos em PNG/PDF
- [ ] Comparação de períodos no dashboard
- [ ] Previsão de tendências com ML

---

## Suporte

Para dúvidas ou problemas:

- [Issues do GitHub](https://github.com/oviteira/fiscaliza-ai/issues)
- Email: suporte@fiscalizaai.com.br
