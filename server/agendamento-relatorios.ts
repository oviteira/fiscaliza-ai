/**
 * Serviço de Agendamento de Relatórios
 * 
 * Gera e envia relatórios automaticamente em horários agendados
 */

import cron from 'node-cron';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { parlamentares, relatoriosAgendados } from '../drizzle/schema';
import { gerarRelatorioPDF } from './relatorios-pdf';
import { gerenciadorNotificacoes } from './notificacoes-email';
import { storagePut } from './storage';

interface AgendamentoRelatorio {
  id: number;
  parlamentarId: number;
  frequencia: 'diaria' | 'semanal' | 'mensal';
  horario: string; // "14:30" formato HH:mm
  destinatarios: string[];
  ativo: boolean;
  ultimaExecucao?: Date;
  proximaExecucao?: Date;
}

/**
 * Classe para gerenciar agendamentos
 */
export class GerenciadorAgendamentos {
  private tarefas: Map<number, any> = new Map();

  /**
   * Inicializar agendamentos do banco de dados
   */
  async inicializar(): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.warn('[Agendamento] Banco de dados não disponível');
      return;
    }

    try {
      const agendamentos = await db.select().from(relatoriosAgendados);

      for (const agendamento of agendamentos) {
        if (agendamento.ativo) {
          this.agendar(agendamento as unknown as AgendamentoRelatorio);
        }
      }

      console.log(`[Agendamento] ${agendamentos.length} agendamentos carregados`);
    } catch (erro) {
      console.error('[Agendamento] Erro ao carregar agendamentos:', erro);
    }
  }

  /**
   * Agendar novo relatório
   */
  agendar(agendamento: AgendamentoRelatorio): void {
    const expressaoCron = this.gerarExpressaoCron(agendamento.frequencia, agendamento.horario);

    const tarefa = cron.schedule(expressaoCron, async () => {
      console.log(`[Agendamento] Executando agendamento ${agendamento.id}`);
      await this.executarAgendamento(agendamento);
    });

    this.tarefas.set(agendamento.id, tarefa);
    console.log(`[Agendamento] Agendamento ${agendamento.id} criado: ${expressaoCron}`);
  }

  /**
   * Cancelar agendamento
   */
  cancelar(id: number): void {
    const tarefa = this.tarefas.get(id);
    if (tarefa) {
      tarefa.stop();
      this.tarefas.delete(id);
      console.log(`[Agendamento] Agendamento ${id} cancelado`);
    }
  }

  /**
   * Executar agendamento
   */
  private async executarAgendamento(agendamento: AgendamentoRelatorio): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('[Agendamento] Banco de dados não disponível');
        return;
      }

      // Buscar parlamentar
      const parlamentarData = await db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.id, agendamento.parlamentarId))
        .limit(1);

      if (!parlamentarData[0]) {
        console.error(`[Agendamento] Parlamentar ${agendamento.parlamentarId} não encontrado`);
        return;
      }

      const parlamentar = parlamentarData[0];

      // Gerar PDF (usando dados mock por enquanto)
      const pdfBuffer = await gerarRelatorioPDF({
        parlamentar: {
          nome: parlamentar.nome || '',
          cpf: parlamentar.cpf || '',
          partido: parlamentar.partido || '',
          estado: parlamentar.estado || '',
          scoreRisco: parseFloat(parlamentar.scoreRisco || '0'),
          nivelRisco: parlamentar.nivelRisco || 'baixo',
          totalContratos: parlamentar.totalContratos || 0,
          totalEmendas: parlamentar.totalEmendas || 0,
        },
        contratos: [],
        emendas: [],
        alertas: [],
      });

      // Salvar em S3
      const nomeArquivo = `relatorios/${parlamentar.nome?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const { url } = await storagePut(nomeArquivo, pdfBuffer, 'application/pdf');

      // Enviar email para todos os destinatários
      for (const destinatario of agendamento.destinatarios) {
        await gerenciadorNotificacoes.enviarAlerta({
          destinatario,
          parlamentar: parlamentar.nome || 'Desconhecido',
          tipoAlerta: 'Relatório Agendado',
          scoreRisco: parseFloat(parlamentar.scoreRisco || '0'),
          nivelRisco: parlamentar.nivelRisco || 'baixo',
          descricao: `Relatório automático gerado em ${new Date().toLocaleDateString('pt-BR')}. Acesse o link abaixo para download.`,
          linkAnalise: url,
        });
      }

      console.log(`[Agendamento] Agendamento ${agendamento.id} executado com sucesso`);
    } catch (erro) {
      console.error(`[Agendamento] Erro ao executar agendamento ${agendamento.id}:`, erro);
    }
  }

  /**
   * Gerar expressão cron
   */
  private gerarExpressaoCron(frequencia: string, horario: string): string {
    const [hora, minuto] = horario.split(':').map(Number);

    switch (frequencia) {
      case 'diaria':
        // Todos os dias no horário especificado
        return `${minuto} ${hora} * * *`;

      case 'semanal':
        // Toda segunda-feira no horário especificado
        return `${minuto} ${hora} * * 1`;

      case 'mensal':
        // Primeiro dia do mês no horário especificado
        return `${minuto} ${hora} 1 * *`;

      default:
        return `${minuto} ${hora} * * *`;
    }
  }

  /**
   * Obter agendamentos ativos
   */
  obterAgendamentos(): number {
    return this.tarefas.size;
  }

  /**
   * Parar todos os agendamentos
   */
  pararTodos(): void {
    this.tarefas.forEach((tarefa) => {
      tarefa.stop();
    });
    this.tarefas.clear();
    console.log('[Agendamento] Todos os agendamentos foram parados');
  }
}

/**
 * Instância global
 */
export const gerenciadorAgendamentos = new GerenciadorAgendamentos();

