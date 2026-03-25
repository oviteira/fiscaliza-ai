/**
 * Serviço de Integração com Slack e Microsoft Teams
 * 
 * Envia notificações para canais do Slack e Teams
 */

import axios from 'axios';
import { WebClient } from '@slack/web-api';

interface NotificacaoSlack {
  canal: string;
  titulo: string;
  descricao: string;
  scoreRisco: number;
  nivelRisco: string;
  linkAnalise?: string;
  campos?: Array<{
    titulo: string;
    valor: string;
    curto?: boolean;
  }>;
}

interface NotificacaoTeams {
  webhook: string;
  titulo: string;
  descricao: string;
  scoreRisco: number;
  nivelRisco: string;
  linkAnalise?: string;
  cor?: string;
}

/**
 * Classe para gerenciar integrações Slack e Teams
 */
export class GerenciadorNotificacoesSlackTeams {
  private slackClient: WebClient | null = null;

  /**
   * Inicializar cliente Slack
   */
  inicializarSlack(token: string): void {
    this.slackClient = new WebClient(token);
    console.log('[Slack] Cliente inicializado');
  }

  /**
   * Enviar mensagem para Slack
   */
  async enviarSlack(notificacao: NotificacaoSlack): Promise<boolean> {
    if (!this.slackClient) {
      console.warn('[Slack] Cliente não inicializado');
      return false;
    }

    try {
      const corRisco = this.obterCorRisco(notificacao.nivelRisco);

      const campos: any[] = [
        {
          title: 'Score de Risco',
          value: `${Math.round(notificacao.scoreRisco)}%`,
          short: true,
        },
        {
          title: 'Nível',
          value: notificacao.nivelRisco.toUpperCase(),
          short: true,
        },
      ];

      if (notificacao.campos) {
        campos.push(...notificacao.campos.map((c) => ({
          title: c.titulo,
          value: c.valor,
          short: c.curto ?? false,
        })));
      }

      const resultado = await this.slackClient.chat.postMessage({
        channel: notificacao.canal,
        attachments: [
          {
            color: corRisco,
            title: notificacao.titulo,
            text: notificacao.descricao,
            fields: campos,
            actions: notificacao.linkAnalise
              ? [
                  {
                    type: 'button',
                    text: 'Ver Análise Completa',
                    url: notificacao.linkAnalise,
                  },
                ]
              : undefined,
            footer: 'FiscalizaAI',
          },
        ],
      });

      console.log('[Slack] Mensagem enviada:', resultado.ts);
      return true;
    } catch (erro) {
      console.error('[Slack] Erro ao enviar mensagem:', erro);
      return false;
    }
  }

  /**
   * Enviar mensagem para Microsoft Teams
   */
  async enviarTeams(notificacao: NotificacaoTeams): Promise<boolean> {
    try {
      const corRisco = notificacao.cor || this.obterCorRiscoHex(notificacao.nivelRisco);

      const payload = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: notificacao.titulo,
        themeColor: corRisco,
        sections: [
          {
            activityTitle: notificacao.titulo,
            activitySubtitle: `Nível: ${notificacao.nivelRisco.toUpperCase()}`,
            text: notificacao.descricao,
            facts: [
              {
                name: 'Score de Risco',
                value: `${Math.round(notificacao.scoreRisco)}%`,
              },
              {
                name: 'Nível',
                value: notificacao.nivelRisco.toUpperCase(),
              },
            ],
            potentialAction: notificacao.linkAnalise
              ? [
                  {
                    '@type': 'OpenUri',
                    name: 'Ver Análise Completa',
                    targets: [
                      {
                        os: 'default',
                        uri: notificacao.linkAnalise,
                      },
                    ],
                  },
                ]
              : undefined,
          },
        ],
        footer: {
          image: 'https://fiscalizaai.com.br/logo.png',
          text: 'FiscalizaAI - Transparência Pública',
        },
      };

      const resposta = await axios.post(notificacao.webhook, payload);

      console.log('[Teams] Mensagem enviada:', resposta.status);
      return resposta.status === 200;
    } catch (erro) {
      console.error('[Teams] Erro ao enviar mensagem:', erro);
      return false;
    }
  }

  /**
   * Enviar para múltiplos canais Slack
   */
  async enviarSlackMultiplo(
    canais: string[],
    notificacao: Omit<NotificacaoSlack, 'canal'>
  ): Promise<number> {
    let enviadas = 0;

    for (const canal of canais) {
      const sucesso = await this.enviarSlack({
        ...notificacao,
        canal,
      });

      if (sucesso) {
        enviadas++;
      }
    }

    return enviadas;
  }

  /**
   * Enviar para múltiplos webhooks Teams
   */
  async enviarTeamsMultiplo(
    webhooks: string[],
    notificacao: Omit<NotificacaoTeams, 'webhook'>
  ): Promise<number> {
    let enviadas = 0;

    for (const webhook of webhooks) {
      const sucesso = await this.enviarTeams({
        ...notificacao,
        webhook,
      });

      if (sucesso) {
        enviadas++;
      }
    }

    return enviadas;
  }

  /**
   * Obter cor para Slack (hexadecimal)
   */
  private obterCorRiscoHex(nivelRisco: string): string {
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
   * Obter cor para Slack (nome)
   */
  private obterCorRisco(nivelRisco: string): string {
    switch (nivelRisco) {
      case 'critico':
        return 'danger';
      case 'alto':
        return 'warning';
      case 'medio':
        return 'warning';
      case 'baixo':
        return 'good';
      default:
        return 'default';
    }
  }

  /**
   * Testar conexão Slack
   */
  async testarSlack(): Promise<boolean> {
    if (!this.slackClient) {
      console.warn('[Slack] Cliente não inicializado');
      return false;
    }

    try {
      const resultado = await this.slackClient.auth.test();
      console.log('[Slack] Conexão testada:', resultado.user_id);
      return true;
    } catch (erro) {
      console.error('[Slack] Erro ao testar conexão:', erro);
      return false;
    }
  }

  /**
   * Testar conexão Teams
   */
  async testarTeams(webhook: string): Promise<boolean> {
    try {
      const resposta = await axios.post(webhook, {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: 'Teste de Conexão',
        sections: [
          {
            activityTitle: 'Teste de Conexão FiscalizaAI',
            text: 'Se você recebeu esta mensagem, a integração com Teams está funcionando corretamente.',
          },
        ],
      });

      console.log('[Teams] Conexão testada:', resposta.status);
      return resposta.status === 200;
    } catch (erro) {
      console.error('[Teams] Erro ao testar conexão:', erro);
      return false;
    }
  }
}

/**
 * Instância global
 */
export const gerenciadorSlackTeams = new GerenciadorNotificacoesSlackTeams();

/**
 * Inicializar integrações com variáveis de ambiente
 */
export function inicializarIntegracoes(): void {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  if (slackToken) {
    gerenciadorSlackTeams.inicializarSlack(slackToken);
  }

  console.log('[Integrações] Inicializadas');
}
