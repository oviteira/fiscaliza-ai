/**
 * Router tRPC para Relatórios
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { gerarRelatorioPDF, gerarRelatorioSimplificadoPDF } from '../relatorios-pdf';
import { getDb } from '../db';
import { parlamentares, contratos, emendas, alertas } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const relatoriosRouter = router({
  /**
   * Gerar relatório completo de um parlamentar
   */
  gerarRelatorioParlamentar: publicProcedure
    .input(z.object({ parlamentarId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar parlamentar
      const parlamentarData = await db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.id, input.parlamentarId))
        .limit(1);

      if (!parlamentarData[0]) {
        throw new Error('Parlamentar não encontrado');
      }

      const parlamentar = parlamentarData[0];

      // Buscar contratos
      const contratosData = await db
        .select()
        .from(contratos)
        .limit(100);

      // Buscar emendas
      const emendasData = await db
        .select()
        .from(emendas)
        .where(eq(emendas.parlamentarId, input.parlamentarId))
        .limit(100);

      // Buscar alertas
      const alertasData = await db
        .select()
        .from(alertas)
        .where(eq(alertas.parlamentarId, input.parlamentarId))
        .limit(100);

      // Gerar PDF
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
        contratos: contratosData.map((c) => ({
          numeroContrato: c.numeroContrato || '',
          orgaoContratante: c.orgaoContratante || '',
          empresaContratada: c.empresaContratada || '',
          valorContrato: parseFloat(c.valorContrato || '0'),
          scoreRisco: parseFloat(c.scoreRisco || '0'),
          temSobrepreco: c.temSobrepreco === 1,
          percentualSobrepreco: c.percentualSobrepreco ? parseFloat(c.percentualSobrepreco) : undefined,
        })),
        emendas: emendasData.map((e) => ({
          numeroEmenda: e.numeroEmenda || '',
          municipio: e.municipio || '',
          estado: e.estado || '',
          valorEmenda: parseFloat(e.valorEmenda || '0'),
          scoreRisco: parseFloat(e.scoreRisco || '0'),
        })),
        alertas: alertasData.map((a) => ({
          tipo: a.tipo || '',
          titulo: a.titulo || '',
          descricao: a.descricao || '',
          scoreRisco: parseFloat(a.scoreRisco || '0'),
          nivelRisco: a.nivelRisco || 'baixo',
        })),
      });

      return {
        sucesso: true,
        tamanho: pdfBuffer.length,
        base64: pdfBuffer.toString('base64'),
        nomeArquivo: `relatorio_${parlamentar.nome?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    }),

  /**
   * Gerar relatório simplificado
   */
  gerarRelatorioSimplificado: publicProcedure
    .input(z.object({ parlamentarId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Buscar parlamentar
      const parlamentarData = await db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.id, input.parlamentarId))
        .limit(1);

      if (!parlamentarData[0]) {
        throw new Error('Parlamentar não encontrado');
      }

      const parlamentar = parlamentarData[0];

      // Gerar PDF
      const pdfBuffer = await gerarRelatorioSimplificadoPDF({
        nome: parlamentar.nome || '',
        cpf: parlamentar.cpf || '',
        partido: parlamentar.partido || '',
        estado: parlamentar.estado || '',
        scoreRisco: parseFloat(parlamentar.scoreRisco || '0'),
        nivelRisco: parlamentar.nivelRisco || 'baixo',
        totalContratos: parlamentar.totalContratos || 0,
        totalEmendas: parlamentar.totalEmendas || 0,
      });

      return {
        sucesso: true,
        tamanho: pdfBuffer.length,
        base64: pdfBuffer.toString('base64'),
        nomeArquivo: `relatorio_simplificado_${parlamentar.nome?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    }),
});
