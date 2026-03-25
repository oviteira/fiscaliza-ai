/**
 * Integração com Jira e Linear
 * 
 * Cria tickets automaticamente quando alertas críticos são detectados
 */

import axios from 'axios';

interface ConfiguracaoJira {
  baseUrl: string;
  username: string;
  apiToken: string;
  projectKey: string;
}

interface ConfiguracaoLinear {
  apiKey: string;
  teamId: string;
}

interface AlertaParaTicket {
  titulo: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  parlamentarId?: number;
  parlamentarNome?: string;
  contratoId?: number;
  contratoNome?: string;
  scoreRisco: number;
  indicadores: Record<string, any>;
}

/**
 * Gerenciador de Jira
 */
export class GerenciadorJira {
  private config: ConfiguracaoJira;

  constructor(config: ConfiguracaoJira) {
    this.config = config;
  }

  /**
   * Criar ticket no Jira
   */
  async criarTicket(alerta: AlertaParaTicket): Promise<any> {
    try {
      const auth = Buffer.from(
        `${this.config.username}:${this.config.apiToken}`
      ).toString('base64');

      const prioridade = this.mapearSeveridadeParaPrioridade(alerta.severidade);

      const descricaoFormatada = this.formatarDescricao(alerta);

      const response = await axios.post(
        `${this.config.baseUrl}/rest/api/3/issues`,
        {
          fields: {
            project: { key: this.config.projectKey },
            summary: alerta.titulo,
            description: {
              version: 1,
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: descricaoFormatada,
                    },
                  ],
                },
              ],
            },
            issuetype: { name: 'Bug' },
            priority: { name: prioridade },
            labels: ['fiscaliza-ai', `severidade-${alerta.severidade}`],
            customfield_10000: alerta.scoreRisco.toString(),
          },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[Jira] Ticket criado: ${response.data.key}`);
      return response.data;
    } catch (erro) {
      console.error('[Jira] Erro ao criar ticket:', erro);
      throw erro;
    }
  }

  /**
   * Atualizar ticket no Jira
   */
  async atualizarTicket(issueKey: string, alerta: AlertaParaTicket): Promise<any> {
    try {
      const auth = Buffer.from(
        `${this.config.username}:${this.config.apiToken}`
      ).toString('base64');

      const descricaoFormatada = this.formatarDescricao(alerta);

      const response = await axios.put(
        `${this.config.baseUrl}/rest/api/3/issues/${issueKey}`,
        {
          fields: {
            summary: alerta.titulo,
            description: {
              version: 1,
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: descricaoFormatada,
                    },
                  ],
                },
              ],
            },
            customfield_10000: alerta.scoreRisco.toString(),
          },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[Jira] Ticket atualizado: ${issueKey}`);
      return response.data;
    } catch (erro) {
      console.error('[Jira] Erro ao atualizar ticket:', erro);
      throw erro;
    }
  }

  /**
   * Fechar ticket no Jira
   */
  async fecharTicket(issueKey: string): Promise<any> {
    try {
      const auth = Buffer.from(
        `${this.config.username}:${this.config.apiToken}`
      ).toString('base64');

      const response = await axios.post(
        `${this.config.baseUrl}/rest/api/3/issues/${issueKey}/transitions`,
        {
          transition: { name: 'Done' },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[Jira] Ticket fechado: ${issueKey}`);
      return response.data;
    } catch (erro) {
      console.error('[Jira] Erro ao fechar ticket:', erro);
      throw erro;
    }
  }

  private mapearSeveridadeParaPrioridade(severidade: string): string {
    const mapa: Record<string, string> = {
      baixa: 'Low',
      media: 'Medium',
      alta: 'High',
      critica: 'Highest',
    };

    return mapa[severidade] || 'Medium';
  }

  private formatarDescricao(alerta: AlertaParaTicket): string {
    let descricao = `${alerta.descricao}\n\n`;
    descricao += `Score de Risco: ${alerta.scoreRisco}%\n`;

    if (alerta.parlamentarNome) {
      descricao += `Parlamentar: ${alerta.parlamentarNome}\n`;
    }

    if (alerta.contratoNome) {
      descricao += `Contrato: ${alerta.contratoNome}\n`;
    }

    descricao += `\nIndicadores:\n`;
    Object.entries(alerta.indicadores).forEach(([chave, valor]) => {
      descricao += `- ${chave}: ${valor}\n`;
    });

    return descricao;
  }
}

/**
 * Gerenciador de Linear
 */
export class GerenciadorLinear {
  private apiKey: string;
  private teamId: string;

  constructor(config: ConfiguracaoLinear) {
    this.apiKey = config.apiKey;
    this.teamId = config.teamId;
  }

  /**
   * Criar issue no Linear
   */
  async criarIssue(alerta: AlertaParaTicket): Promise<any> {
    try {
      const prioridade = this.mapearSeveridadeParaPrioridade(alerta.severidade);

      const descricaoFormatada = this.formatarDescricao(alerta);

      const response = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: `
            mutation CreateIssue($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                issue {
                  id
                  identifier
                  title
                  url
                }
              }
            }
          `,
          variables: {
            input: {
              teamId: this.teamId,
              title: alerta.titulo,
              description: descricaoFormatada,
              priority: prioridade,
              labelIds: ['fiscaliza-ai'],
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const issue = response.data.data.issueCreate.issue;
      console.log(`[Linear] Issue criada: ${issue.identifier}`);
      return issue;
    } catch (erro) {
      console.error('[Linear] Erro ao criar issue:', erro);
      throw erro;
    }
  }

  /**
   * Atualizar issue no Linear
   */
  async atualizarIssue(issueId: string, alerta: AlertaParaTicket): Promise<any> {
    try {
      const prioridade = this.mapearSeveridadeParaPrioridade(alerta.severidade);

      const descricaoFormatada = this.formatarDescricao(alerta);

      const response = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: `
            mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) {
                issue {
                  id
                  identifier
                  title
                }
              }
            }
          `,
          variables: {
            id: issueId,
            input: {
              title: alerta.titulo,
              description: descricaoFormatada,
              priority: prioridade,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const issue = response.data.data.issueUpdate.issue;
      console.log(`[Linear] Issue atualizada: ${issue.identifier}`);
      return issue;
    } catch (erro) {
      console.error('[Linear] Erro ao atualizar issue:', erro);
      throw erro;
    }
  }

  /**
   * Fechar issue no Linear
   */
  async fecharIssue(issueId: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: `
            mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
              issueUpdate(id: $id, input: $input) {
                issue {
                  id
                  identifier
                  state {
                    name
                  }
                }
              }
            }
          `,
          variables: {
            id: issueId,
            input: {
              stateId: 'done',
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const issue = response.data.data.issueUpdate.issue;
      console.log(`[Linear] Issue fechada: ${issue.identifier}`);
      return issue;
    } catch (erro) {
      console.error('[Linear] Erro ao fechar issue:', erro);
      throw erro;
    }
  }

  private mapearSeveridadeParaPrioridade(severidade: string): number {
    const mapa: Record<string, number> = {
      baixa: 0,
      media: 1,
      alta: 2,
      critica: 3,
    };

    return mapa[severidade] || 1;
  }

  private formatarDescricao(alerta: AlertaParaTicket): string {
    let descricao = `${alerta.descricao}\n\n`;
    descricao += `**Score de Risco:** ${alerta.scoreRisco}%\n`;

    if (alerta.parlamentarNome) {
      descricao += `**Parlamentar:** ${alerta.parlamentarNome}\n`;
    }

    if (alerta.contratoNome) {
      descricao += `**Contrato:** ${alerta.contratoNome}\n`;
    }

    descricao += `\n**Indicadores:**\n`;
    Object.entries(alerta.indicadores).forEach(([chave, valor]) => {
      descricao += `- ${chave}: ${valor}\n`;
    });

    return descricao;
  }
}

/**
 * Gerenciador de integração
 */
export class GerenciadorIntegracaoTickets {
  private jira?: GerenciadorJira;
  private linear?: GerenciadorLinear;

  constructor(
    configJira?: ConfiguracaoJira,
    configLinear?: ConfiguracaoLinear
  ) {
    if (configJira) {
      this.jira = new GerenciadorJira(configJira);
    }

    if (configLinear) {
      this.linear = new GerenciadorLinear(configLinear);
    }
  }

  /**
   * Criar ticket/issue em ambas as plataformas
   */
  async criarTicketEmAmbas(alerta: AlertaParaTicket): Promise<any> {
    const resultados: any = {};

    if (this.jira) {
      try {
        resultados.jira = await this.jira.criarTicket(alerta);
      } catch (erro) {
        console.error('[Integração] Erro ao criar ticket Jira:', erro);
        resultados.jiraErro = erro;
      }
    }

    if (this.linear) {
      try {
        resultados.linear = await this.linear.criarIssue(alerta);
      } catch (erro) {
        console.error('[Integração] Erro ao criar issue Linear:', erro);
        resultados.linearErro = erro;
      }
    }

    return resultados;
  }

  /**
   * Criar ticket/issue em Jira
   */
  async criarTicketJira(alerta: AlertaParaTicket): Promise<any> {
    if (!this.jira) {
      throw new Error('Jira não configurado');
    }

    return this.jira.criarTicket(alerta);
  }

  /**
   * Criar issue em Linear
   */
  async criarIssueLinear(alerta: AlertaParaTicket): Promise<any> {
    if (!this.linear) {
      throw new Error('Linear não configurado');
    }

    return this.linear.criarIssue(alerta);
  }
}

/**
 * Instâncias globais
 */
export const jira = process.env.JIRA_BASE_URL
  ? new GerenciadorJira({
      baseUrl: process.env.JIRA_BASE_URL,
      username: process.env.JIRA_USERNAME || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
      projectKey: process.env.JIRA_PROJECT_KEY || '',
    })
  : null;

export const linear = process.env.LINEAR_API_KEY
  ? new GerenciadorLinear({
      apiKey: process.env.LINEAR_API_KEY,
      teamId: process.env.LINEAR_TEAM_ID || '',
    })
  : null;

export const gerenciadorIntegracaoTickets = new GerenciadorIntegracaoTickets(
  process.env.JIRA_BASE_URL
    ? {
        baseUrl: process.env.JIRA_BASE_URL,
        username: process.env.JIRA_USERNAME || '',
        apiToken: process.env.JIRA_API_TOKEN || '',
        projectKey: process.env.JIRA_PROJECT_KEY || '',
      }
    : undefined,
  process.env.LINEAR_API_KEY
    ? {
        apiKey: process.env.LINEAR_API_KEY,
        teamId: process.env.LINEAR_TEAM_ID || '',
      }
    : undefined
);
