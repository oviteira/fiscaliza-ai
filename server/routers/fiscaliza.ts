import { z } from 'zod';
import { publicProcedure, router, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { parlamentares, contratos, emendas, alertas } from '../../drizzle/schema';
import { eq, like, desc, and } from 'drizzle-orm';

/**
 * Router para Parlamentares
 */
const parlamentaresRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        estado: z.string().optional(),
        partido: z.string().optional(),
        nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
        pagina: z.number().default(1),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { parlamentares: [], total: 0 };

      const filtros = [];
      if (input.estado) filtros.push(eq(parlamentares.estado, input.estado));
      if (input.partido) filtros.push(eq(parlamentares.partido, input.partido));
      if (input.nivelRisco) filtros.push(eq(parlamentares.nivelRisco, input.nivelRisco));

      const offset = (input.pagina - 1) * input.limite;

      const resultado = await db
        .select()
        .from(parlamentares)
        .where(filtros.length > 0 ? and(...filtros) : undefined)
        .orderBy(desc(parlamentares.scoreRisco))
        .limit(input.limite)
        .offset(offset);

      return {
        parlamentares: resultado,
        total: resultado.length,
        pagina: input.pagina,
        limite: input.limite,
      };
    }),

  buscarPorCPF: publicProcedure
    .input(z.object({ cpf: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const resultado = await db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.cpf, input.cpf))
        .limit(1);

      return resultado[0] || null;
    }),

  buscarPorNome: publicProcedure
    .input(z.object({ nome: z.string(), limite: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const resultado = await db
        .select()
        .from(parlamentares)
        .where(like(parlamentares.nome, `%${input.nome}%`))
        .limit(input.limite);

      return resultado;
    }),

  obterDetalhes: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const parlamentar = await db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.id, input.id))
        .limit(1);

      if (!parlamentar[0]) return null;

      const contratosAssociados = await db
        .select()
        .from(contratos)
        .limit(100);

      const emendasAssociadas = await db
        .select()
        .from(emendas)
        .where(eq(emendas.parlamentarId, input.id))
        .limit(100);

      const alertasAssociados = await db
        .select()
        .from(alertas)
        .where(eq(alertas.parlamentarId, input.id))
        .limit(100);

      return {
        parlamentar: parlamentar[0],
        contratos: contratosAssociados,
        emendas: emendasAssociadas,
        alertas: alertasAssociados,
      };
    }),
});

/**
 * Router para Contratos
 */
const contratosRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
        orgao: z.string().optional(),
        pagina: z.number().default(1),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { contratos: [], total: 0 };

      const filtros = [];
      if (input.nivelRisco) filtros.push(eq(contratos.nivelRisco, input.nivelRisco));
      if (input.orgao) filtros.push(eq(contratos.orgaoContratante, input.orgao));

      const offset = (input.pagina - 1) * input.limite;

      const resultado = await db
        .select()
        .from(contratos)
        .where(filtros.length > 0 ? and(...filtros) : undefined)
        .orderBy(desc(contratos.scoreRisco))
        .limit(input.limite)
        .offset(offset);

      return {
        contratos: resultado,
        total: resultado.length,
        pagina: input.pagina,
        limite: input.limite,
      };
    }),

  buscarPorNumero: publicProcedure
    .input(z.object({ numero: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const resultado = await db
        .select()
        .from(contratos)
        .where(eq(contratos.numeroContrato, input.numero))
        .limit(1);

      return resultado[0] || null;
    }),
});

/**
 * Router para Emendas
 */
const emendasRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        estado: z.string().optional(),
        nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
        pagina: z.number().default(1),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { emendas: [], total: 0 };

      const filtros = [];
      if (input.estado) filtros.push(eq(emendas.estado, input.estado));
      if (input.nivelRisco) filtros.push(eq(emendas.nivelRisco, input.nivelRisco));

      const offset = (input.pagina - 1) * input.limite;

      const resultado = await db
        .select()
        .from(emendas)
        .where(filtros.length > 0 ? and(...filtros) : undefined)
        .orderBy(desc(emendas.scoreRisco))
        .limit(input.limite)
        .offset(offset);

      return {
        emendas: resultado,
        total: resultado.length,
        pagina: input.pagina,
        limite: input.limite,
      };
    }),

  buscarPorParlamentar: publicProcedure
    .input(z.object({ parlamentarId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const resultado = await db
        .select()
        .from(emendas)
        .where(eq(emendas.parlamentarId, input.parlamentarId));

      return resultado;
    }),
});

/**
 * Router para Alertas
 */
const alertasRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        tipo: z.string().optional(),
        status: z.string().optional(),
        nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
        pagina: z.number().default(1),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { alertas: [], total: 0 };

      const filtros = [];
      if (input.tipo) filtros.push(eq(alertas.tipo, input.tipo as any));
      if (input.status) filtros.push(eq(alertas.status, input.status as any));
      if (input.nivelRisco) filtros.push(eq(alertas.nivelRisco, input.nivelRisco));

      const offset = (input.pagina - 1) * input.limite;

      const resultado = await db
        .select()
        .from(alertas)
        .where(filtros.length > 0 ? and(...filtros) : undefined)
        .orderBy(desc(alertas.scoreRisco))
        .limit(input.limite)
        .offset(offset);

      return {
        alertas: resultado,
        total: resultado.length,
        pagina: input.pagina,
        limite: input.limite,
      };
    }),

  buscarPorParlamentar: publicProcedure
    .input(z.object({ parlamentarId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const resultado = await db
        .select()
        .from(alertas)
        .where(eq(alertas.parlamentarId, input.parlamentarId));

      return resultado;
    }),
});

/**
 * Router para Análise e Estatísticas
 */
const analiseRouter = router({
  obterEstatisticas: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalParlamentares: 0,
        totalContratos: 0,
        totalEmendas: 0,
        totalAlertas: 0,
        parlamentaresAltoRisco: 0,
        contratosAltoRisco: 0,
      };
    }

    const [
      totalParlamentaresData,
      totalContratosData,
      totalEmendasData,
      totalAlertasData,
      parlamentaresAltoRiscoData,
      contratosAltoRiscoData,
    ] = await Promise.all([
      db.select().from(parlamentares),
      db.select().from(contratos),
      db.select().from(emendas),
      db.select().from(alertas),
      db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.nivelRisco, 'critico')),
      db
        .select()
        .from(contratos)
        .where(eq(contratos.nivelRisco, 'critico')),
    ]);

    return {
      totalParlamentares: totalParlamentaresData.length,
      totalContratos: totalContratosData.length,
      totalEmendas: totalEmendasData.length,
      totalAlertas: totalAlertasData.length,
      parlamentaresAltoRisco: parlamentaresAltoRiscoData.length,
      contratosAltoRisco: contratosAltoRiscoData.length,
    };
  }),

  distribuicaoRisco: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { baixo: 0, medio: 0, alto: 0, critico: 0 };

    const [baixo, medio, alto, critico] = await Promise.all([
      db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.nivelRisco, 'baixo')),
      db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.nivelRisco, 'medio')),
      db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.nivelRisco, 'alto')),
      db
        .select()
        .from(parlamentares)
        .where(eq(parlamentares.nivelRisco, 'critico')),
    ]);

    return {
      baixo: baixo.length,
      medio: medio.length,
      alto: alto.length,
      critico: critico.length,
    };
  }),
});

/**
 * Exportar todos os routers
 */
export const fiscalizaRouter = router({
  parlamentares: parlamentaresRouter,
  contratos: contratosRouter,
  emendas: emendasRouter,
  alertas: alertasRouter,
  analise: analiseRouter,
});
