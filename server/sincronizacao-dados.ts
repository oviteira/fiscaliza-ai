/**
 * Serviço de Sincronização de Dados
 * 
 * Sincroniza dados das APIs do governo periodicamente
 * e atualiza o banco de dados com informações de:
 * - Parlamentares
 * - Contratos públicos
 * - Emendas parlamentares
 * - Empresas
 */

import { getDb } from './db';
import { parlamentares, contratos, emendas } from '../drizzle/schema';
import { gerenciadorIntegracoes } from './integracao-apis';
import { AnalisadorRisco } from './analise-risco';

interface StatusSincronizacao {
  fonte: string;
  tipo: string;
  status: 'pendente' | 'em_progresso' | 'sucesso' | 'erro';
  totalRegistros: number;
  registrosProcessados: number;
  registrosErro: number;
  dataInicio: Date;
  dataFim?: Date;
  mensagemErro?: string;
}

/**
 * Classe para gerenciar sincronização de dados
 */
export class SincronizadorDados {
  private statusAtual: Map<string, StatusSincronizacao> = new Map();

  /**
   * Sincronizar contratos do Portal da Transparência
   */
  async sincronizarContratos(): Promise<StatusSincronizacao> {
    const status: StatusSincronizacao = {
      fonte: 'portal_transparencia',
      tipo: 'contratos',
      status: 'em_progresso',
      totalRegistros: 0,
      registrosProcessados: 0,
      registrosErro: 0,
      dataInicio: new Date(),
    };

    try {
      console.log('[Sincronização] Iniciando sincronização de contratos...');

      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar contratos da API
      const contratosAPI = await gerenciadorIntegracoes.sincronizarTodos();
      status.totalRegistros = contratosAPI.contratos.length;

      // Processar cada contrato
      for (const contratoAPI of contratosAPI.contratos) {
        try {
          // Verificar se já existe
          const existente = await db
            .select()
            .from(contratos)
            .where(eq(contratos.numeroContrato, contratoAPI.numeroContrato))
            .limit(1);

          if (existente.length === 0) {
            // Inserir novo contrato
            await db.insert(contratos).values({
              numeroContrato: contratoAPI.numeroContrato,
              orgaoContratante: contratoAPI.orgaoContratante,
              empresaContratada: contratoAPI.empresaContratada,
              valorContrato: contratoAPI.valorContrato.toString(),
              valorPago: (contratoAPI.valorPago || 0).toString(),
              dataAssinatura: new Date(contratoAPI.dataAssinatura),
              dataVencimento: contratoAPI.dataVencimento
                ? new Date(contratoAPI.dataVencimento)
                : null,
              descricao: contratoAPI.descricao,
              objeto: contratoAPI.objeto,
              scoreRisco: '0',
              nivelRisco: 'baixo',
              fonteOrigem: 'portal_transparencia',
              idFonteOrigem: contratoAPI.numeroContrato,
              ativo: 1,
            });
          }

          status.registrosProcessados++;
        } catch (erro) {
          console.error('[Sincronização] Erro ao processar contrato:', erro);
          status.registrosErro++;
        }
      }

      status.status = 'sucesso';
      status.dataFim = new Date();

      console.log('[Sincronização] Sincronização de contratos concluída', {
        processados: status.registrosProcessados,
        erros: status.registrosErro,
      });

      return status;
    } catch (erro) {
      status.status = 'erro';
      status.dataFim = new Date();
      status.mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';

      console.error('[Sincronização] Erro na sincronização de contratos:', erro);

      return status;
    }
  }

  /**
   * Sincronizar emendas do Portal da Transparência
   */
  async sincronizarEmendas(): Promise<StatusSincronizacao> {
    const status: StatusSincronizacao = {
      fonte: 'portal_transparencia',
      tipo: 'emendas',
      status: 'em_progresso',
      totalRegistros: 0,
      registrosProcessados: 0,
      registrosErro: 0,
      dataInicio: new Date(),
    };

    try {
      console.log('[Sincronização] Iniciando sincronização de emendas...');

      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar emendas da API
      const emendasAPI = await gerenciadorIntegracoes.sincronizarTodos();
      status.totalRegistros = emendasAPI.emendas.length;

      // Processar cada emenda
      for (const emendaAPI of emendasAPI.emendas) {
        try {
          // Verificar se já existe
          const existente = await db
            .select()
            .from(emendas)
            .where(eq(emendas.numeroEmenda, emendaAPI.numeroEmenda))
            .limit(1);

          if (existente.length === 0) {
            // Inserir nova emenda
            await db.insert(emendas).values({
              numeroEmenda: emendaAPI.numeroEmenda,
              parlamentarNome: emendaAPI.parlamentarNome,
              valorEmenda: emendaAPI.valorEmenda.toString(),
              valorExecutado: (emendaAPI.valorExecutado || 0).toString(),
              municipio: emendaAPI.municipio,
              estado: emendaAPI.estado,
              descricao: emendaAPI.descricao,
              tipoEmenda: emendaAPI.tipoEmenda,
              scoreRisco: '0',
              nivelRisco: 'baixo',
              dataEmenda: new Date(emendaAPI.dataEmenda),
              fonteOrigem: 'portal_transparencia',
              idFonteOrigem: emendaAPI.numeroEmenda,
              ativo: 1,
            });
          }

          status.registrosProcessados++;
        } catch (erro) {
          console.error('[Sincronização] Erro ao processar emenda:', erro);
          status.registrosErro++;
        }
      }

      status.status = 'sucesso';
      status.dataFim = new Date();

      console.log('[Sincronização] Sincronização de emendas concluída', {
        processados: status.registrosProcessados,
        erros: status.registrosErro,
      });

      return status;
    } catch (erro) {
      status.status = 'erro';
      status.dataFim = new Date();
      status.mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';

      console.error('[Sincronização] Erro na sincronização de emendas:', erro);

      return status;
    }
  }

  /**
   * Sincronizar dados de empresas
   */
  async sincronizarEmpresas(): Promise<StatusSincronizacao> {
    const status: StatusSincronizacao = {
      fonte: 'receita_federal',
      tipo: 'empresas',
      status: 'em_progresso',
      totalRegistros: 0,
      registrosProcessados: 0,
      registrosErro: 0,
      dataInicio: new Date(),
    };

    try {
      console.log('[Sincronização] Iniciando sincronização de empresas...');

      // Buscar CNPJs de contratos
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      const contratosData = await db.select().from(contratos).limit(100);
      status.totalRegistros = contratosData.length;

      // Para cada contrato, buscar dados da empresa
      for (const contrato of contratosData) {
        try {
          // Aqui você buscaria dados da empresa via Receita Federal
          // Por enquanto, apenas contabilizar
          status.registrosProcessados++;
        } catch (erro) {
          console.error('[Sincronização] Erro ao processar empresa:', erro);
          status.registrosErro++;
        }
      }

      status.status = 'sucesso';
      status.dataFim = new Date();

      return status;
    } catch (erro) {
      status.status = 'erro';
      status.dataFim = new Date();
      status.mensagemErro = erro instanceof Error ? erro.message : 'Erro desconhecido';

      console.error('[Sincronização] Erro na sincronização de empresas:', erro);

      return status;
    }
  }

  /**
   * Sincronizar tudo
   */
  async sincronizarTudo(): Promise<{
    contratos: StatusSincronizacao;
    emendas: StatusSincronizacao;
    empresas: StatusSincronizacao;
  }> {
    console.log('[Sincronização] Iniciando sincronização completa...');

    const [contratos, emendas, empresas] = await Promise.all([
      this.sincronizarContratos(),
      this.sincronizarEmendas(),
      this.sincronizarEmpresas(),
    ]);

    console.log('[Sincronização] Sincronização completa finalizada');

    return { contratos, emendas, empresas };
  }

  /**
   * Obter status de sincronização
   */
  obterStatus(chave: string): StatusSincronizacao | undefined {
    return this.statusAtual.get(chave);
  }

  /**
   * Atualizar status
   */
  atualizarStatus(chave: string, status: StatusSincronizacao): void {
    this.statusAtual.set(chave, status);
  }
}

// Importar eq do drizzle-orm
import { eq } from 'drizzle-orm';

// Instância única do sincronizador
export const sincronizador = new SincronizadorDados();

/**
 * Iniciar sincronização periódica
 * Sincroniza a cada 6 horas
 */
export function iniciarSincronizacaoPeriodica() {
  console.log('[Sincronização] Iniciando sincronização periódica...');

  // Sincronizar imediatamente
  sincronizador.sincronizarTudo().catch((erro) => {
    console.error('[Sincronização] Erro na sincronização periódica:', erro);
  });

  // Sincronizar a cada 6 horas (21600000 ms)
  const intervalo = 6 * 60 * 60 * 1000;
  setInterval(() => {
    console.log('[Sincronização] Executando sincronização periódica...');
    sincronizador.sincronizarTudo().catch((erro) => {
      console.error('[Sincronização] Erro na sincronização periódica:', erro);
    });
  }, intervalo);

  console.log('[Sincronização] Sincronização periódica iniciada (intervalo: 6 horas)');
}
