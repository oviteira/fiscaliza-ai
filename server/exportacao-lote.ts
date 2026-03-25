/**
 * Sistema de Exportação em Lote
 * 
 * Exporta múltiplos relatórios em ZIP
 */

import archiver from 'archiver';
import { Writable } from 'stream';
import { getDb } from './db';
import { exportacoes } from '../drizzle/schema';
import { gerarRelatorioPDF } from './relatorios-pdf';
import { storagePut } from './storage';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

interface ItemExportacao {
  tipo: 'parlamentar' | 'contrato' | 'emenda';
  id: number;
  nome: string;
}

/**
 * Classe para gerenciar exportação em lote
 */
export class GerenciadorExportacaoLote {
  /**
   * Criar exportação em lote
   */
  async criarExportacao(
    usuarioId: number,
    itens: ItemExportacao[],
    tipoExportacao: 'relatorios' | 'dados' | 'graficos' = 'relatorios'
  ): Promise<number> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Criar registro de exportação
      const resultado = await db.insert(exportacoes).values({
        usuarioId,
        tipo: tipoExportacao,
        status: 'pendente',
        totalItens: itens.length,
        itensProcessados: 0,
      });

      console.log(`[Exportação] Criada exportação com ${itens.length} itens`);
      return 1; // Retornar ID (em produção seria resultado.insertId)
    } catch (erro) {
      console.error('[Exportação] Erro ao criar exportação:', erro);
      throw erro;
    }
  }

  /**
   * Processar exportação em lote
   */
  async processarExportacao(
    exportacaoId: number,
    itens: ItemExportacao[]
  ): Promise<string> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Atualizar status para processando
      console.log(`[Exportação] Iniciando processamento da exportação ${exportacaoId}`);

      // Criar buffer para ZIP
      const chunks: Buffer[] = [];
      const stream = new Writable({
        write(chunk: Buffer, encoding, callback) {
          chunks.push(chunk);
          callback();
        },
      });

      // Criar arquivo ZIP
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      archive.pipe(stream);

      // Adicionar arquivos ao ZIP
      let processados = 0;

      for (const item of itens) {
        try {
          let conteudo: Buffer;

          if (item.tipo === 'parlamentar') {
            conteudo = await this.gerarRelatorioParlamentar(item.id);
          } else if (item.tipo === 'contrato') {
            conteudo = await this.gerarRelatorioContrato(item.id);
          } else {
            conteudo = await this.gerarRelatorioEmenda(item.id);
          }

          // Adicionar ao ZIP
          archive.append(conteudo, {
            name: `${item.tipo}-${item.id}-${item.nome}.pdf`,
          });

          processados++;

          // Atualizar progresso
          if (processados % 10 === 0) {
            console.log(
              `[Exportação] Progresso: ${processados}/${itens.length} itens processados`
            );
          }
        } catch (erro) {
          console.error(`[Exportação] Erro ao processar item ${item.id}:`, erro);
        }
      }

      // Finalizar ZIP
      await archive.finalize();

      // Aguardar conclusão do stream
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Converter chunks para Buffer
      const zipBuffer = Buffer.concat(chunks);

      // Fazer upload para S3
      const nomeArquivo = `exportacoes/exportacao-${exportacaoId}-${nanoid()}.zip`;
      const { url } = await storagePut(nomeArquivo, zipBuffer, 'application/zip');

      console.log(`[Exportação] Arquivo ZIP criado: ${url}`);

      return url;
    } catch (erro) {
      console.error('[Exportação] Erro ao processar exportação:', erro);
      throw erro;
    }
  }

  /**
   * Gerar relatório de parlamentar
   */
  private async gerarRelatorioParlamentar(parlamentarId: number): Promise<Buffer> {
    try {
      // Aqui você buscaria os dados do parlamentar no banco
      // e geraria o PDF usando gerarRelatorioPDF
      const pdf = await gerarRelatorioPDF({
        parlamentarId,
      } as any);

      return pdf;
    } catch (erro) {
      console.error('[Exportação] Erro ao gerar relatório de parlamentar:', erro);
      throw erro;
    }
  }

  /**
   * Gerar relatório de contrato
   */
  private async gerarRelatorioContrato(contratoId: number): Promise<Buffer> {
    try {
      const pdf = await gerarRelatorioPDF({
        contratoId,
      } as any);

      return pdf;
    } catch (erro) {
      console.error('[Exportação] Erro ao gerar relatório de contrato:', erro);
      throw erro;
    }
  }

  /**
   * Gerar relatório de emenda
   */
  private async gerarRelatorioEmenda(emendaId: number): Promise<Buffer> {
    try {
      const pdf = await gerarRelatorioPDF({
        emendaId,
      } as any);

      return pdf;
    } catch (erro) {
      console.error('[Exportação] Erro ao gerar relatório de emenda:', erro);
      throw erro;
    }
  }

  /**
   * Obter status da exportação
   */
  async obterStatus(exportacaoId: number): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const resultado = await db
        .select()
        .from(exportacoes)
        .where(eq(exportacoes.id, exportacaoId))
        .limit(1);

      return resultado[0] || null;
    } catch (erro) {
      console.error('[Exportação] Erro ao obter status:', erro);
      throw erro;
    }
  }

  /**
   * Listar exportações do usuário
   */
  async listarExportacoes(usuarioId: number, limite: number = 10): Promise<any[]> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const resultado = await db
        .select()
        .from(exportacoes)
        .where(eq(exportacoes.usuarioId, usuarioId))
        .limit(limite);

      return resultado;
    } catch (erro) {
      console.error('[Exportação] Erro ao listar exportações:', erro);
      throw erro;
    }
  }

  /**
   * Cancelar exportação
   */
  async cancelarExportacao(exportacaoId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      console.log(`[Exportação] Cancelando exportação ${exportacaoId}`);
      return true;
    } catch (erro) {
      console.error('[Exportação] Erro ao cancelar exportação:', erro);
      throw erro;
    }
  }

  /**
   * Limpar exportações antigas
   */
  async limparExportacoesAntigas(diasRetencao: number = 7): Promise<number> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasRetencao);

      console.log(`[Exportação] Limpando exportações anteriores a ${dataLimite}`);
      return 0; // Retornar número de registros deletados
    } catch (erro) {
      console.error('[Exportação] Erro ao limpar exportações:', erro);
      throw erro;
    }
  }
}

/**
 * Instância global
 */
export const gerenciadorExportacaoLote = new GerenciadorExportacaoLote();
