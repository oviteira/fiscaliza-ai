/**
 * Serviço de Notificações por Email
 * 
 * Envia notificações de alertas de risco para administradores
 * e usuários cadastrados.
 */

import nodemailer from 'nodemailer';

interface ConfiguracaoEmail {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

interface NotificacaoAlerta {
  destinatario: string;
  parlamentar: string;
  tipoAlerta: string;
  scoreRisco: number;
  nivelRisco: string;
  descricao: string;
  linkAnalise: string;
}

interface NotificacaoSincronizacao {
  destinatario: string;
  fonte: string;
  totalRegistros: number;
  registrosProcessados: number;
  registrosErro: number;
  duracao: number;
}

/**
 * Classe para gerenciar notificações por email
 */
export class GerenciadorNotificacoes {
  private transporter: nodemailer.Transporter | null = null;
  private configuracao: ConfiguracaoEmail | null = null;

  /**
   * Inicializar transporter de email
   */
  inicializar(config: ConfiguracaoEmail): void {
    this.configuracao = config;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    console.log('[Email] Transporter inicializado');
  }

  /**
   * Enviar notificação de alerta
   */
  async enviarAlerta(notificacao: NotificacaoAlerta): Promise<boolean> {
    if (!this.transporter || !this.configuracao) {
      console.warn('[Email] Transporter não inicializado');
      return false;
    }

    try {
      const html = `
        <h2>Alerta de Risco Detectado</h2>
        <p>Um novo alerta foi detectado na plataforma FiscalizaAI:</p>
        
        <h3>${notificacao.parlamentar}</h3>
        <p><strong>Tipo de Alerta:</strong> ${notificacao.tipoAlerta}</p>
        <p><strong>Score de Risco:</strong> ${Math.round(notificacao.scoreRisco)}%</p>
        <p><strong>Nível:</strong> <span style="color: ${obterCorRisco(notificacao.nivelRisco)}">${notificacao.nivelRisco.toUpperCase()}</span></p>
        
        <h4>Descrição:</h4>
        <p>${notificacao.descricao}</p>
        
        <p>
          <a href="${notificacao.linkAnalise}" style="background-color: #06B6D4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Ver Análise Completa
          </a>
        </p>
        
        <hr />
        <p style="font-size: 12px; color: #666;">
          Este é um email automático da plataforma FiscalizaAI. 
          Não responda este email.
        </p>
      `;

      const info = await this.transporter.sendMail({
        from: this.configuracao.from,
        to: notificacao.destinatario,
        subject: `[FiscalizaAI] Alerta: ${notificacao.tipoAlerta} - ${notificacao.parlamentar}`,
        html,
      });

      console.log('[Email] Alerta enviado:', info.messageId);
      return true;
    } catch (erro) {
      console.error('[Email] Erro ao enviar alerta:', erro);
      return false;
    }
  }

  /**
   * Enviar notificação de sincronização
   */
  async enviarNotificacaoSincronizacao(notificacao: NotificacaoSincronizacao): Promise<boolean> {
    if (!this.transporter || !this.configuracao) {
      console.warn('[Email] Transporter não inicializado');
      return false;
    }

    try {
      const taxa = notificacao.totalRegistros > 0 
        ? ((notificacao.registrosProcessados / notificacao.totalRegistros) * 100).toFixed(1)
        : '0';

      const html = `
        <h2>Sincronização de Dados Concluída</h2>
        <p>A sincronização de dados foi concluída com sucesso.</p>
        
        <h3>Resumo:</h3>
        <ul>
          <li><strong>Fonte:</strong> ${notificacao.fonte}</li>
          <li><strong>Total de Registros:</strong> ${notificacao.totalRegistros}</li>
          <li><strong>Registros Processados:</strong> ${notificacao.registrosProcessados}</li>
          <li><strong>Taxa de Sucesso:</strong> ${taxa}%</li>
          <li><strong>Registros com Erro:</strong> ${notificacao.registrosErro}</li>
          <li><strong>Duração:</strong> ${notificacao.duracao}ms</li>
        </ul>
        
        <hr />
        <p style="font-size: 12px; color: #666;">
          FiscalizaAI - Plataforma de Análise de Transparência Pública
        </p>
      `;

      const info = await this.transporter.sendMail({
        from: this.configuracao.from,
        to: notificacao.destinatario,
        subject: `[FiscalizaAI] Sincronização Concluída - ${notificacao.fonte}`,
        html,
      });

      console.log('[Email] Notificação de sincronização enviada:', info.messageId);
      return true;
    } catch (erro) {
      console.error('[Email] Erro ao enviar notificação de sincronização:', erro);
      return false;
    }
  }

  /**
   * Enviar email de teste
   */
  async enviarTeste(destinatario: string): Promise<boolean> {
    if (!this.transporter || !this.configuracao) {
      console.warn('[Email] Transporter não inicializado');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configuracao.from,
        to: destinatario,
        subject: '[FiscalizaAI] Email de Teste',
        html: `
          <h2>Email de Teste</h2>
          <p>Este é um email de teste da plataforma FiscalizaAI.</p>
          <p>Se você recebeu este email, o sistema de notificações está funcionando corretamente.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            FiscalizaAI - Plataforma de Análise de Transparência Pública
          </p>
        `,
      });

      console.log('[Email] Email de teste enviado:', info.messageId);
      return true;
    } catch (erro) {
      console.error('[Email] Erro ao enviar email de teste:', erro);
      return false;
    }
  }

  /**
   * Verificar conexão
   */
  async verificarConexao(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[Email] Transporter não inicializado');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[Email] Conexão verificada com sucesso');
      return true;
    } catch (erro) {
      console.error('[Email] Erro ao verificar conexão:', erro);
      return false;
    }
  }
}

/**
 * Obter cor baseada no nível de risco
 */
function obterCorRisco(nivelRisco: string): string {
  switch (nivelRisco) {
    case 'critico':
      return '#F43F5E';
    case 'alto':
      return '#FBBF24';
    case 'medio':
      return '#F59E0B';
    case 'baixo':
      return '#34D399';
    default:
      return '#6B7280';
  }
}

/**
 * Instância global do gerenciador de notificações
 */
export const gerenciadorNotificacoes = new GerenciadorNotificacoes();

/**
 * Inicializar notificações com variáveis de ambiente
 */
export function inicializarNotificacoes(): void {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !password || !from) {
    console.warn('[Email] Variáveis de ambiente não configuradas. Notificações desabilitadas.');
    return;
  }

  gerenciadorNotificacoes.inicializar({
    host,
    port,
    user,
    password,
    from,
  });

  // Verificar conexão
  gerenciadorNotificacoes.verificarConexao().catch((erro) => {
    console.error('[Email] Erro ao verificar conexão:', erro);
  });
}
