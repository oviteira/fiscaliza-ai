import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // OAuth Social
  githubId: varchar("githubId", { length: 50 }).unique(),
  googleId: varchar("googleId", { length: 50 }).unique(),
  avatar: text("avatar"),
  
  // RBAC - Role-Based Access Control
  role: mysqlEnum("role", ["visualizador", "analista", "admin"]).default("visualizador").notNull(),
  permissoes: text("permissoes").default("[]"),
  ativo: int("ativo").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// Tabelas para Parlamentares
// ============================================================

export const parlamentares = mysqlTable(
  "parlamentares",
  {
    id: int("id").autoincrement().primaryKey(),
    cpf: varchar("cpf", { length: 14 }).notNull().unique(),
    nome: varchar("nome", { length: 255 }).notNull(),
    partido: varchar("partido", { length: 50 }).notNull(),
    estado: varchar("estado", { length: 2 }).notNull(),
    cargo: varchar("cargo", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    telefone: varchar("telefone", { length: 20 }),
    dataPosse: timestamp("dataPosse"),
    dataFim: timestamp("dataFim"),
    
    // Dados TSE
    idTSE: varchar("idTSE", { length: 50 }).unique(),
    numeroInscricao: varchar("numeroInscricao", { length: 20 }),
    
    // Score de risco
    scoreRisco: varchar("scoreRisco", { length: 10 }).default("0"),
    nivelRisco: mysqlEnum("nivelRisco", ["baixo", "medio", "alto", "critico"]).default("baixo"),
    
    // Análise
    totalContratos: int("totalContratos").default(0),
    totalEmendas: int("totalEmendas").default(0),
    totalValorContratos: varchar("totalValorContratos", { length: 30 }).default("0"),
    totalValorEmendas: varchar("totalValorEmendas", { length: 30 }).default("0"),
    
    // Metadados
    dataAtualizacao: timestamp("dataAtualizacao").defaultNow().onUpdateNow(),
    ativo: int("ativo").default(1),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Parlamentar = typeof parlamentares.$inferSelect;
export type InsertParlamentar = typeof parlamentares.$inferInsert;

// ============================================================
// Tabelas para Contratos Públicos
// ============================================================

export const contratos = mysqlTable(
  "contratos",
  {
    id: int("id").autoincrement().primaryKey(),
    numeroContrato: varchar("numeroContrato", { length: 50 }).notNull().unique(),
    orgaoContratante: varchar("orgaoContratante", { length: 255 }).notNull(),
    empresaContratada: varchar("empresaContratada", { length: 255 }).notNull(),
    
    // Valores
    valorContrato: varchar("valorContrato", { length: 30 }).notNull(),
    valorPago: varchar("valorPago", { length: 30 }).default("0"),
    
    // Datas
    dataAssinatura: timestamp("dataAssinatura").notNull(),
    dataVencimento: timestamp("dataVencimento"),
    
    // Descrição
    descricao: text("descricao"),
    objeto: varchar("objeto", { length: 500 }),
    
    // Análise de risco
    scoreRisco: varchar("scoreRisco", { length: 10 }).default("0"),
    nivelRisco: mysqlEnum("nivelRisco_contrato", ["baixo", "medio", "alto", "critico"]).default("baixo"),
    
    // Indicadores de risco
    temSobrepreco: int("temSobrepreco").default(0),
    percentualSobrepreco: varchar("percentualSobrepreco", { length: 10 }).default("0"),
    temVinculoFamiliar: int("temVinculoFamiliar").default(0),
    
    // Metadados
    fonteOrigem: varchar("fonteOrigem", { length: 100 }),
    idFonteOrigem: varchar("idFonteOrigem", { length: 100 }),
    dataAtualizacao: timestamp("dataAtualizacao").defaultNow().onUpdateNow(),
    ativo: int("ativo").default(1),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;

// ============================================================
// Tabelas para Emendas Parlamentares
// ============================================================

export const emendas = mysqlTable(
  "emendas",
  {
    id: int("id").autoincrement().primaryKey(),
    numeroEmenda: varchar("numeroEmenda", { length: 50 }).notNull().unique(),
    parlamentarId: int("parlamentarId"),
    parlamentarNome: varchar("parlamentarNome", { length: 255 }),
    
    // Valores
    valorEmenda: varchar("valorEmenda", { length: 30 }).notNull(),
    valorExecutado: varchar("valorExecutado", { length: 30 }).default("0"),
    
    // Localização
    municipio: varchar("municipio", { length: 100 }),
    estado: varchar("estado", { length: 2 }),
    
    // Descrição
    descricao: text("descricao"),
    tipoEmenda: varchar("tipoEmenda", { length: 100 }),
    
    // Análise de risco
    scoreRisco: varchar("scoreRisco", { length: 10 }).default("0"),
    nivelRisco: mysqlEnum("nivelRisco_emenda", ["baixo", "medio", "alto", "critico"]).default("baixo"),
    
    // Datas
    dataEmenda: timestamp("dataEmenda"),
    dataExecucao: timestamp("dataExecucao"),
    
    // Metadados
    fonteOrigem: varchar("fonteOrigem", { length: 100 }),
    idFonteOrigem: varchar("idFonteOrigem", { length: 100 }),
    dataAtualizacao: timestamp("dataAtualizacao").defaultNow().onUpdateNow(),
    ativo: int("ativo").default(1),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Emenda = typeof emendas.$inferSelect;
export type InsertEmenda = typeof emendas.$inferInsert;

// ============================================================
// Tabelas para Alertas de Risco
// ============================================================

export const alertas = mysqlTable(
  "alertas",
  {
    id: int("id").autoincrement().primaryKey(),
    tipo: mysqlEnum("tipo_alerta", [
      "sobrepreco",
      "vinculo_familiar",
      "concentracao_fornecedor",
      "desvio_geografico",
      "funcionario_fantasma",
      "inconsistencia_patrimonial",
      "padrão_suspeito",
      "outro",
    ]).notNull(),
    
    // Entidades relacionadas
    parlamentarId: int("parlamentarId"),
    contratoId: int("contratoId"),
    emendaId: int("emendaId"),
    
    // Descrição
    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao"),
    
    // Valores
    valorEnvolvido: varchar("valorEnvolvido", { length: 30 }).default("0"),
    scoreRisco: varchar("scoreRisco", { length: 10 }).notNull(),
    nivelRisco: mysqlEnum("nivelRisco_alerta", ["baixo", "medio", "alto", "critico"]).notNull(),
    
    // Status
    status: mysqlEnum("status_alerta", ["novo", "analisando", "confirmado", "descartado", "investigando"]).default("novo"),
    
    // Metadados
    fonteOrigem: varchar("fonteOrigem", { length: 100 }),
    dataDeteccao: timestamp("dataDeteccao").defaultNow(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type Alerta = typeof alertas.$inferSelect;
export type InsertAlerta = typeof alertas.$inferInsert;
// ============================================================
// Tabelas para Agendamentos de Relatórios
// ============================================================

export const relatoriosAgendados = mysqlTable(
  "relatorios_agendados",
  {
    id: int("id").autoincrement().primaryKey(),
    parlamentarId: int("parlamentarId").notNull(),
    frequencia: mysqlEnum("frequencia", ["diaria", "semanal", "mensal"]).notNull(),
    horario: varchar("horario", { length: 5 }).notNull(),
    destinatarios: text("destinatarios").notNull(),
    ativo: int("ativo").default(1),
    ultimaExecucao: timestamp("ultimaExecucao"),
    proximaExecucao: timestamp("proximaExecucao"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

export type RelatorioAgendado = typeof relatoriosAgendados.$inferSelect;
export type InsertRelatorioAgendado = typeof relatoriosAgendados.$inferInsert;

// ============================================================
// Tabelas para Sincronizações de Dados
// ============================================================

export const sincronizacoes = mysqlTable(
  "sincronizacoes",
  {
    id: int("id").autoincrement().primaryKey(),
    fonte: varchar("fonte", { length: 100 }).notNull(),
    status: mysqlEnum("status_sinc", ["iniciada", "em_progresso", "concluida", "erro"]).notNull(),
    totalRegistros: int("totalRegistros").default(0),
    registrosProcessados: int("registrosProcessados").default(0),
    registrosErro: int("registrosErro").default(0),
    mensagem: text("mensagem"),
    duracao: int("duracao"),
    dataInicio: timestamp("dataInicio").defaultNow(),
    dataFim: timestamp("dataFim"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Sincronizacao = typeof sincronizacoes.$inferSelect;
export type InsertSincronizacao = typeof sincronizacoes.$inferInsert;

// ============================================================
// Tabelas para Controle de Acesso (RBAC)
// ============================================================

export const permissoes = mysqlTable(
  "permissoes",
  {
    id: int("id").autoincrement().primaryKey(),
    nome: varchar("nome", { length: 100 }).notNull().unique(),
    descricao: text("descricao"),
    recurso: varchar("recurso", { length: 100 }).notNull(),
    acao: varchar("acao", { length: 50 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Permissao = typeof permissoes.$inferSelect;
export type InsertPermissao = typeof permissoes.$inferInsert;

export const rolesPermissoes = mysqlTable(
  "roles_permissoes",
  {
    id: int("id").autoincrement().primaryKey(),
    role: varchar("role", { length: 50 }).notNull(),
    permissaoId: int("permissaoId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type RolePermissao = typeof rolesPermissoes.$inferSelect;
export type InsertRolePermissao = typeof rolesPermissoes.$inferInsert;

// ============================================================
// Tabelas para Exportação em Lote
// ============================================================

export const exportacoes = mysqlTable(
  "exportacoes",
  {
    id: int("id").autoincrement().primaryKey(),
    usuarioId: int("usuarioId").notNull(),
    tipo: mysqlEnum("tipo_export", ["relatorios", "dados", "graficos"]).notNull(),
    status: mysqlEnum("status_export", ["pendente", "processando", "concluida", "erro"]).default("pendente"),
    totalItens: int("totalItens").default(0),
    itensProcessados: int("itensProcessados").default(0),
    urlArquivo: text("urlArquivo"),
    mensagemErro: text("mensagemErro"),
    dataInicio: timestamp("dataInicio").defaultNow(),
    dataFim: timestamp("dataFim"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type Exportacao = typeof exportacoes.$inferSelect;
export type InsertExportacao = typeof exportacoes.$inferInsert;

// ============================================================
// Tabela de Auditoria
// ============================================================

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    usuarioId: int("usuarioId").notNull(),
    acao: varchar("acao", { length: 100 }).notNull(),
    recurso: varchar("recurso", { length: 100 }).notNull(),
    recursoId: int("recursoId"),
    mudancasAntes: text("mudancasAntes"),
    mudancasDepois: text("mudancasDepois"),
    ipAddress: varchar("ipAddress", { length: 50 }),
    userAgent: text("userAgent"),
    status: mysqlEnum("status", ["sucesso", "erro", "pendente"]).default("sucesso"),
    mensagemErro: text("mensagemErro"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
