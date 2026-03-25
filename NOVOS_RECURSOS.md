# Novos Recursos - FiscalizaAI v1.1.0

## Visão Geral

Esta documentação descreve os três novos recursos implementados na versão 1.1.0 do FiscalizaAI:

1. **Exportação de Relatórios em PDF**
2. **Dashboard em Tempo Real com WebSocket**
3. **Sistema de Notificações por Email**

---

## 1. Exportação de Relatórios em PDF

### Descrição

Permite gerar relatórios detalhados em PDF com análises completas de risco, incluindo dados do parlamentar, contratos, emendas e alertas detectados.

### Arquivos

- `server/relatorios-pdf.ts` - Serviço de geração de PDF
- `server/routers/relatorios.ts` - Endpoints tRPC para relatórios

### Endpoints tRPC

#### `relatorios.gerarRelatorioParlamentar`

Gera um relatório completo em PDF para um parlamentar.

**Tipo**: Mutation

**Parâmetros**:
```typescript
{
  parlamentarId: number;  // ID do parlamentar
}
```

**Resposta**:
```typescript
{
  sucesso: boolean;
  tamanho: number;           // Tamanho do arquivo em bytes
  base64: string;            // Conteúdo do PDF em base64
  nomeArquivo: string;       // Nome sugerido para download
}
```

**Exemplo (Frontend)**:
```typescript
const { mutate } = trpc.relatorios.gerarRelatorioParlamentar.useMutation();

const baixarRelatorio = async (parlamentarId: number) => {
  const resultado = await mutate({ parlamentarId });
  
  // Converter base64 para blob
  const binaryString = atob(resultado.base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  
  // Fazer download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = resultado.nomeArquivo;
  a.click();
};
```

#### `relatorios.gerarRelatorioSimplificado`

Gera um relatório simplificado com apenas informações essenciais.

**Tipo**: Mutation

**Parâmetros**:
```typescript
{
  parlamentarId: number;
}
```

**Resposta**: Mesma estrutura que `gerarRelatorioParlamentar`

### Conteúdo do Relatório

O relatório completo inclui:

1. **Cabeçalho** - Logo e data de geração
2. **Dados do Parlamentar** - Nome, CPF, partido, estado
3. **Score de Risco** - Percentual e classificação
4. **Resumo Executivo** - Totais de contratos, emendas e alertas
5. **Contratos Analisados** - Lista com valores e scores
6. **Emendas Parlamentares** - Detalhes de emendas
7. **Alertas de Risco** - Lista de alertas detectados
8. **Rodapé** - Link para mais informações

### Configuração

Nenhuma configuração adicional necessária. O serviço usa a biblioteca `pdfkit` que já está instalada.

---

## 2. Dashboard em Tempo Real com WebSocket

### Descrição

Implementa conexões WebSocket para atualizar o dashboard em tempo real com:

- Atualizações de scores de risco
- Novos alertas detectados
- Status de sincronizações
- Estatísticas de clientes conectados

### Arquivos

- `server/websocket-realtime.ts` - Gerenciador de WebSocket
- `client/src/hooks/useRealtime.ts` - Hooks React para WebSocket

### Inicialização

O servidor WebSocket é inicializado automaticamente quando o servidor Express inicia.

### Hooks React

#### `useRealtime()`

Hook principal para conexão WebSocket.

**Retorno**:
```typescript
{
  conectado: boolean;                    // Status da conexão
  atualizacoesRisco: AtualizacaoRisco[]; // Últimas atualizações de risco
  alertas: AtualizacaoAlerta[];          // Últimos alertas
  sincronizacoes: AtualizacaoSincronizacao[]; // Últimas sincronizações
  estatisticas: EstatisticasWebSocket | null; // Estatísticas do servidor
  entrarSala: (sala: string) => void;    // Entrar em uma sala
  sairSala: (sala: string) => void;      // Sair de uma sala
  enviarPing: () => void;                // Enviar ping
  limparAtualizacoes: () => void;        // Limpar histórico
  socket: Socket | null;                 // Socket.io bruto
}
```

**Exemplo**:
```typescript
import { useRealtime } from '@/hooks/useRealtime';

export function DashboardRealtime() {
  const { conectado, alertas, atualizacoesRisco } = useRealtime();

  return (
    <div>
      <p>Status: {conectado ? '🟢 Conectado' : '🔴 Desconectado'}</p>
      
      <h3>Últimos Alertas ({alertas.length})</h3>
      {alertas.map(alerta => (
        <div key={alerta.id}>
          <strong>{alerta.titulo}</strong>
          <p>{alerta.descricao}</p>
          <small>{new Date(alerta.timestamp).toLocaleString('pt-BR')}</small>
        </div>
      ))}
      
      <h3>Atualizações de Risco</h3>
      {atualizacoesRisco.map(atualizacao => (
        <div key={atualizacao.parlamentarId}>
          <p>{atualizacao.nome}: {atualizacao.scoreRisco}%</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useAlertas()`

Hook especializado para monitorar apenas alertas.

**Retorno**:
```typescript
{
  alertas: AtualizacaoAlerta[];
  conectado: boolean;
}
```

#### `useSincronizacoes()`

Hook especializado para monitorar sincronizações.

**Retorno**:
```typescript
{
  sincronizacoes: AtualizacaoSincronizacao[];
  conectado: boolean;
}
```

### Eventos WebSocket

**Servidor → Cliente**:

- `conectado` - Confirmação de conexão com ID do cliente
- `atualizacao-risco` - Nova atualização de score de risco
- `novo-alerta` - Novo alerta detectado
- `alerta-parlamentar` - Alerta específico de um parlamentar
- `atualizacao-sincronizacao` - Atualização de sincronização
- `estatisticas` - Estatísticas do servidor
- `pong` - Resposta a ping

**Cliente → Servidor**:

- `entrar-sala` - Entrar em uma sala de eventos
- `sair-sala` - Sair de uma sala
- `ping` - Verificar conexão

### Salas

O sistema suporta salas para filtrar eventos:

- `alertas` - Receber apenas alertas
- `sincronizacoes` - Receber apenas sincronizações
- `parlamentar-{id}` - Receber eventos de um parlamentar específico

### Exemplo Completo

```typescript
import { useRealtime } from '@/hooks/useRealtime';
import { useEffect } from 'react';

export function MonitorAlertas() {
  const { conectado, alertas, entrarSala, sairSala } = useRealtime();

  useEffect(() => {
    if (conectado) {
      entrarSala('alertas');
      return () => sairSala('alertas');
    }
  }, [conectado, entrarSala, sairSala]);

  return (
    <div>
      <h2>Monitor de Alertas em Tempo Real</h2>
      <p>Conexão: {conectado ? '✅' : '❌'}</p>
      
      <ul>
        {alertas.map(alerta => (
          <li key={alerta.id}>
            <strong>[{alerta.nivelRisco.toUpperCase()}]</strong> {alerta.titulo}
            <br />
            <small>{alerta.descricao}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 3. Sistema de Notificações por Email

### Descrição

Envia notificações por email para administradores e usuários cadastrados quando:

- Novos alertas de risco são detectados
- Sincronizações de dados são concluídas
- Eventos importantes ocorrem na plataforma

### Arquivos

- `server/notificacoes-email.ts` - Gerenciador de notificações
- `server/routers/notificacoes.ts` - Endpoints tRPC (opcional)

### Configuração

Configure as variáveis de ambiente para SMTP:

```bash
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu-email@seu-dominio.com
SMTP_PASSWORD=sua-senha-smtp
SMTP_FROM=noreply@fiscalizaai.com.br
```

### Inicialização

```typescript
import { inicializarNotificacoes } from './server/notificacoes-email';

// No servidor, após iniciar Express
inicializarNotificacoes();
```

### Uso

#### Enviar Alerta

```typescript
import { gerenciadorNotificacoes } from './server/notificacoes-email';

await gerenciadorNotificacoes.enviarAlerta({
  destinatario: 'admin@fiscalizaai.com.br',
  parlamentar: 'João Silva',
  tipoAlerta: 'Sobrepreço',
  scoreRisco: 85,
  nivelRisco: 'alto',
  descricao: 'Contrato com sobrepreço detectado em 25%',
  linkAnalise: 'https://fiscalizaai.com.br/parlamentares/123',
});
```

#### Enviar Notificação de Sincronização

```typescript
await gerenciadorNotificacoes.enviarNotificacaoSincronizacao({
  destinatario: 'admin@fiscalizaai.com.br',
  fonte: 'portal_transparencia',
  totalRegistros: 1000,
  registrosProcessados: 950,
  registrosErro: 50,
  duracao: 45000, // em ms
});
```

#### Enviar Email de Teste

```typescript
await gerenciadorNotificacoes.enviarTeste('seu-email@exemplo.com');
```

#### Verificar Conexão

```typescript
const conectado = await gerenciadorNotificacoes.verificarConexao();
console.log('Email conectado:', conectado);
```

### Provedores SMTP Recomendados

| Provedor | Host | Porta | Autenticação |
|----------|------|-------|--------------|
| Gmail | smtp.gmail.com | 587 | Email + Senha de App |
| SendGrid | smtp.sendgrid.net | 587 | `apikey` + Chave API |
| Mailgun | smtp.mailgun.org | 587 | Email + Chave |
| AWS SES | email-smtp.{region}.amazonaws.com | 587 | Credenciais AWS |

### Exemplo com Gmail

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app  # Não use senha comum
SMTP_FROM=seu-email@gmail.com
```

**Nota**: Gmail requer [Senha de App](https://support.google.com/accounts/answer/185833) em vez de senha comum.

### Templates de Email

Os emails são gerados com HTML formatado incluindo:

- Cabeçalho com logo
- Conteúdo principal
- Links para ação
- Rodapé com informações

### Tratamento de Erros

```typescript
try {
  const sucesso = await gerenciadorNotificacoes.enviarAlerta({...});
  if (!sucesso) {
    console.error('Falha ao enviar email');
  }
} catch (erro) {
  console.error('Erro ao enviar notificação:', erro);
}
```

---

## Integração Completa

### Fluxo de Alerta Completo

```
1. Novo alerta detectado na análise de risco
   ↓
2. Emitir via WebSocket (tempo real)
   ↓
3. Gerar PDF do relatório
   ↓
4. Enviar email para admin
   ↓
5. Armazenar no banco de dados
   ↓
6. Atualizar dashboard em tempo real
```

### Exemplo de Implementação

```typescript
import { gerenciadorWebSocket } from './server/websocket-realtime';
import { gerenciadorNotificacoes } from './server/notificacoes-email';
import { gerarRelatorioPDF } from './server/relatorios-pdf';

async function processarNovoAlerta(alerta: any) {
  // 1. Emitir via WebSocket
  gerenciadorWebSocket.emitirNovoAlerta({
    id: alerta.id,
    parlamentarId: alerta.parlamentarId,
    tipo: alerta.tipo,
    titulo: alerta.titulo,
    scoreRisco: alerta.scoreRisco,
    nivelRisco: alerta.nivelRisco,
    timestamp: new Date(),
  });

  // 2. Enviar email
  await gerenciadorNotificacoes.enviarAlerta({
    destinatario: 'admin@fiscalizaai.com.br',
    parlamentar: alerta.parlamentarNome,
    tipoAlerta: alerta.tipo,
    scoreRisco: alerta.scoreRisco,
    nivelRisco: alerta.nivelRisco,
    descricao: alerta.descricao,
    linkAnalise: `https://fiscalizaai.com.br/parlamentares/${alerta.parlamentarId}`,
  });
}
```

---

## Testes

Todos os novos recursos incluem testes unitários:

```bash
pnpm test
```

Resultado esperado:
```
✓ server/novos-recursos.test.ts (20 tests)
✓ server/fiscaliza.test.ts (20 tests)
✓ server/auth.logout.test.ts (1 test)

Test Files  3 passed (3)
Tests  41 passed (41)
```

---

## Performance

### Recomendações

1. **PDF**: Gerar sob demanda, não em background
2. **Email**: Usar fila (Bull/RabbitMQ) para emails em volume
3. **WebSocket**: Limitar histórico a 50 últimos eventos

### Escalabilidade

Para múltiplas instâncias, usar:

- **Redis** para compartilhar estado WebSocket
- **Bull** para fila de emails
- **S3** para armazenar PDFs gerados

---

## Troubleshooting

### Email não é enviado

```bash
# Verificar configuração
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER

# Testar conexão
telnet smtp.seu-provedor.com 587
```

### WebSocket não conecta

```typescript
// Verificar logs do navegador
console.log('Socket conectado:', socket.connected);
console.log('Socket ID:', socket.id);
```

### PDF vazio ou corrompido

```typescript
// Verificar tamanho
if (pdfBuffer.length === 0) {
  console.error('PDF vazio');
}

// Verificar magic number
const magic = pdfBuffer.toString('utf8', 0, 4);
console.log('Magic:', magic); // Deve ser "%PDF"
```

---

## Roadmap Futuro

- [ ] Agendamento de relatórios (diários, semanais)
- [ ] Múltiplos idiomas em emails
- [ ] Webhooks customizados
- [ ] Integração com Slack/Teams
- [ ] Fila de emails com retry automático
- [ ] Análise de abertura de emails

---

## Suporte

Para dúvidas ou problemas:

- [Issues do GitHub](https://github.com/oviteira/fiscaliza-ai/issues)
- Email: suporte@fiscalizaai.com.br
