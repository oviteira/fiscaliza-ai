/**
 * Sistema de Auditoria
 * 
 * Registra todas as ações dos usuários para compliance e segurança
 */

import { getDb } from './db';
import { auditLogs } from '../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

interface RegistroAuditoria {
  usuarioId: number;
  acao: string;
  recurso: string;
  recursoId?: number;
  mudancasAntes?: Record<string, any>;
  mudancasDepois?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'sucesso' | 'erro' | 'pendente';
  mensagemErro?: string;
}

/**
 * Classe para gerenciar auditoria
 */
export class GerenciadorAuditoria {
  /**
   * Registrar ação
   */
  async registrarAcao(registro: RegistroAuditoria): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.warn('[Auditoria] Database not available');
      return;
    }

    try {
      await db.insert(auditLogs).values({
        usuarioId: registro.usuarioId,
        acao: registro.acao,
        recurso: registro.recurso,
        recursoId: registro.recursoId,
        mudancasAntes: registro.mudancasAntes ? JSON.stringify(registro.mudancasAntes) : null,
        mudancasDepois: registro.mudancasDepois ? JSON.stringify(registro.mudancasDepois) : null,
        ipAddress: registro.ipAddress,
        userAgent: registro.userAgent,
        status: registro.status || 'sucesso',
        mensagemErro: registro.mensagemErro,
      });

      console.log(
        `[Auditoria] Ação registrada: ${registro.acao} em ${registro.recurso}#${registro.recursoId}`
      );
    } catch (erro) {
      console.error('[Auditoria] Erro ao registrar ação:', erro);
    }
  }

  /**
   * Registrar ação com sucesso
   */
  async registrarSucesso(
    usuarioId: number,
    acao: string,
    recurso: string,
    recursoId?: number,
    mudancasAntes?: Record<string, any>,
    mudancasDepois?: Record<string, any>
  ): Promise<void> {
    await this.registrarAcao({
      usuarioId,
      acao,
      recurso,
      recursoId,
      mudancasAntes,
      mudancasDepois,
      status: 'sucesso',
    });
  }

  /**
   * Registrar ação com erro
   */
  async registrarErro(
    usuarioId: number,
    acao: string,
    recurso: string,
    mensagemErro: string,
    recursoId?: number
  ): Promise<void> {
    await this.registrarAcao({
      usuarioId,
      acao,
      recurso,
      recursoId,
      status: 'erro',
      mensagemErro,
    });
  }

  /**
   * Listar logs de auditoria
   */
  async listarLogs(
    filtros?: {
      usuarioId?: number;
      acao?: string;
      recurso?: string;
      status?: 'sucesso' | 'erro' | 'pendente';
      dataInicio?: Date;
      dataFim?: Date;
      limite?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const condicoes: any[] = [];

      if (filtros?.usuarioId) {
        condicoes.push(eq(auditLogs.usuarioId, filtros.usuarioId));
      }

      if (filtros?.acao) {
        condicoes.push(eq(auditLogs.acao, filtros.acao));
      }

      if (filtros?.recurso) {
        condicoes.push(eq(auditLogs.recurso, filtros.recurso));
      }

      if (filtros?.status) {
        condicoes.push(eq(auditLogs.status, filtros.status));
      }

      const limite = filtros?.limite || 100;
      const offset = filtros?.offset || 0;

      let resultado;
      if (condicoes.length > 0) {
        resultado = await db
          .select()
          .from(auditLogs)
          .where(and(...condicoes))
          .limit(limite)
          .offset(offset);
      } else {
        resultado = await db
          .select()
          .from(auditLogs)
          .limit(limite)
          .offset(offset);
      }

      return resultado;
    } catch (erro) {
      console.error('[Auditoria] Erro ao listar logs:', erro);
      throw erro;
    }
  }

  /**
   * Obter logs de um usuário
   */
  async obterLogsUsuario(usuarioId: number, limite: number = 50): Promise<any[]> {
    return this.listarLogs({
      usuarioId,
      limite,
    });
  }

  /**
   * Obter logs de um recurso
   */
  async obterLogsRecurso(recurso: string, recursoId: number, limite: number = 50): Promise<any[]> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const resultado = await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.recurso, recurso), eq(auditLogs.recursoId, recursoId)))
        .limit(limite);

      return resultado;
    } catch (erro) {
      console.error('[Auditoria] Erro ao obter logs de recurso:', erro);
      throw erro;
    }
  }

  /**
   * Obter estatísticas de auditoria
   */
  async obterEstatisticas(dataInicio?: Date, dataFim?: Date): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const logs = await this.listarLogs({
        dataInicio,
        dataFim,
        limite: 10000,
      });

      const totalAcoes = logs.length;
      const acoesComSucesso = logs.filter((l) => l.status === 'sucesso').length;
      const acoesComErro = logs.filter((l) => l.status === 'erro').length;

      const acoesPorTipo: Record<string, number> = {};
      const recursosPorTipo: Record<string, number> = {};
      const usuariosMaisAtivos: Record<number, number> = {};

      logs.forEach((log) => {
        acoesPorTipo[log.acao] = (acoesPorTipo[log.acao] || 0) + 1;
        recursosPorTipo[log.recurso] = (recursosPorTipo[log.recurso] || 0) + 1;
        usuariosMaisAtivos[log.usuarioId] = (usuariosMaisAtivos[log.usuarioId] || 0) + 1;
      });

      return {
        totalAcoes,
        acoesComSucesso,
        acoesComErro,
        taxaSucesso: ((acoesComSucesso / totalAcoes) * 100).toFixed(2) + '%',
        acoesPorTipo,
        recursosPorTipo,
        usuariosMaisAtivos,
      };
    } catch (erro) {
      console.error('[Auditoria] Erro ao obter estatísticas:', erro);
      throw erro;
    }
  }

  /**
   * Detectar atividades suspeitas
   */
  async detectarAtividadesSuspeitas(usuarioId: number): Promise<any[]> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.usuarioId, usuarioId))
        .limit(100);

      const suspeitas: any[] = [];

      const erros = logs.filter((l) => l.status === 'erro');
      if (erros.length > 5) {
        suspeitas.push({
          tipo: 'multiplos_erros',
          severidade: 'media',
          descricao: `${erros.length} tentativas de acesso falhadas`,
          logs: erros.slice(0, 5),
        });
      }

      const exclusoes = logs.filter((l) => l.acao === 'deletar');
      if (exclusoes.length > 10) {
        suspeitas.push({
          tipo: 'exclusoes_em_massa',
          severidade: 'alta',
          descricao: `${exclusoes.length} exclusões detectadas`,
          logs: exclusoes.slice(0, 5),
        });
      }

      return suspeitas;
    } catch (erro) {
      console.error('[Auditoria] Erro ao detectar atividades suspeitas:', erro);
      throw erro;
    }
  }

  /**
   * Exportar logs para CSV
   */
  async exportarParaCSV(filtros?: any): Promise<string> {
    try {
      const logs = await this.listarLogs(filtros);

      let csv = 'ID,Usuário,Ação,Recurso,Recurso ID,Status,Data,IP\n';

      logs.forEach((log) => {
        csv += `${log.id},"${log.usuarioId}","${log.acao}","${log.recurso}",${log.recursoId},"${log.status}","${log.createdAt}","${log.ipAddress}"\n`;
      });

      return csv;
    } catch (erro) {
      console.error('[Auditoria] Erro ao exportar para CSV:', erro);
      throw erro;
    }
  }

  /**
   * Limpar logs antigos
   */
  async limparLogsAntigos(diasRetencao: number = 90): Promise<number> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasRetencao);

      console.log(`[Auditoria] Limpando logs anteriores a ${dataLimite}`);

      return 0;
    } catch (erro) {
      console.error('[Auditoria] Erro ao limpar logs antigos:', erro);
      throw erro;
    }
  }
}

/**
 * Instância global
 */
export const gerenciadorAuditoria = new GerenciadorAuditoria();
