/**
 * Role-Based Access Control (RBAC)
 * 
 * Sistema de permissões e controle de acesso
 */

type Role = 'visualizador' | 'analista' | 'admin';

interface Permissao {
  recurso: string;
  acao: string;
}

/**
 * Definição de permissões por role
 */
const permissoesPorRole: Record<Role, Permissao[]> = {
  visualizador: [
    // Leitura básica
    { recurso: 'parlamentares', acao: 'listar' },
    { recurso: 'parlamentares', acao: 'visualizar' },
    { recurso: 'contratos', acao: 'listar' },
    { recurso: 'contratos', acao: 'visualizar' },
    { recurso: 'alertas', acao: 'listar' },
    { recurso: 'alertas', acao: 'visualizar' },
    { recurso: 'estatisticas', acao: 'visualizar' },
    { recurso: 'relatorios', acao: 'exportar' },
  ],

  analista: [
    // Mais análise
    { recurso: 'alertas', acao: 'atualizar_status' },
    { recurso: 'alertas', acao: 'adicionar_comentario' },
    { recurso: 'parlamentares', acao: 'adicionar_nota' },
    { recurso: 'contratos', acao: 'adicionar_nota' },
    { recurso: 'relatorios', acao: 'agendar' },
    { recurso: 'relatorios', acao: 'exportar_lote' },
    { recurso: 'grafos', acao: 'visualizar' },
  ],

  admin: [
    // Administração
    { recurso: 'usuarios', acao: 'listar' },
    { recurso: 'usuarios', acao: 'criar' },
    { recurso: 'usuarios', acao: 'editar' },
    { recurso: 'usuarios', acao: 'deletar' },
    { recurso: 'usuarios', acao: 'alterar_role' },
    { recurso: 'sincronizacoes', acao: 'iniciar' },
    { recurso: 'sincronizacoes', acao: 'visualizar' },
    { recurso: 'configuracoes', acao: 'editar' },
    { recurso: 'logs', acao: 'visualizar' },
  ],
};

/**
 * Classe para gerenciar RBAC
 */
export class GerenciadorRBAC {
  /**
   * Verificar se usuário tem permissão
   */
  temPermissao(role: Role, recurso: string, acao: string): boolean {
    const permissoes = permissoesPorRole[role] || [];
    return permissoes.some((p) => p.recurso === recurso && p.acao === acao);
  }

  /**
   * Verificar múltiplas permissões (AND)
   */
  temTodasPermissoes(role: Role, permissoes: Permissao[]): boolean {
    return permissoes.every((p) => this.temPermissao(role, p.recurso, p.acao));
  }

  /**
   * Verificar múltiplas permissões (OR)
   */
  temAlgumaPermissao(role: Role, permissoes: Permissao[]): boolean {
    return permissoes.some((p) => this.temPermissao(role, p.recurso, p.acao));
  }

  /**
   * Obter todas as permissões de um role
   */
  obterPermissoes(role: Role): Permissao[] {
    return permissoesPorRole[role] || [];
  }

  /**
   * Listar todos os roles
   */
  listarRoles(): Role[] {
    return ['visualizador', 'analista', 'admin'];
  }

  /**
   * Obter descrição do role
   */
  obterDescricaoRole(role: Role): string {
    const descricoes: Record<Role, string> = {
      visualizador: 'Pode visualizar dados e exportar relatórios',
      analista: 'Pode analisar dados, atualizar alertas e agendar relatórios',
      admin: 'Acesso total ao sistema, incluindo gerenciamento de usuários',
    };

    return descricoes[role] || 'Role desconhecido';
  }

  /**
   * Validar permissões customizadas
   */
  validarPermissoes(permissoes: string[]): boolean {
    const permissoesValidas = new Set<string>();

    Object.values(permissoesPorRole).forEach((perms) => {
      perms.forEach((p) => {
        permissoesValidas.add(`${p.recurso}:${p.acao}`);
      });
    });

    return permissoes.every((p) => permissoesValidas.has(p));
  }

  /**
   * Adicionar permissão customizada
   */
  adicionarPermissaoCustomizada(role: Role, recurso: string, acao: string): void {
    if (!permissoesPorRole[role]) {
      permissoesPorRole[role] = [];
    }

    const permissaoExiste = permissoesPorRole[role].some(
      (p) => p.recurso === recurso && p.acao === acao
    );

    if (!permissaoExiste) {
      permissoesPorRole[role].push({ recurso, acao });
      console.log(`[RBAC] Permissão adicionada: ${role} -> ${recurso}:${acao}`);
    }
  }

  /**
   * Remover permissão
   */
  removerPermissao(role: Role, recurso: string, acao: string): void {
    if (!permissoesPorRole[role]) return;

    permissoesPorRole[role] = permissoesPorRole[role].filter(
      (p) => !(p.recurso === recurso && p.acao === acao)
    );

    console.log(`[RBAC] Permissão removida: ${role} -> ${recurso}:${acao}`);
  }

  /**
   * Comparar dois roles
   */
  compararRoles(role1: Role, role2: Role): number {
    const hierarquia: Record<Role, number> = {
      visualizador: 1,
      analista: 2,
      admin: 3,
    };

    return hierarquia[role1] - hierarquia[role2];
  }

  /**
   * Verificar se role é superior
   */
  roleSuperior(role1: Role, role2: Role): boolean {
    return this.compararRoles(role1, role2) > 0;
  }
}

/**
 * Instância global
 */
export const gerenciadorRBAC = new GerenciadorRBAC();

/**
 * Middleware para verificar permissão
 */
export function verificarPermissao(recurso: string, acao: string) {
  return (role: Role): boolean => {
    return gerenciadorRBAC.temPermissao(role, recurso, acao);
  };
}

/**
 * Decorator para tRPC (exemplo)
 */
export function requerPermissao(recurso: string, acao: string) {
  return (role: Role) => {
    if (!gerenciadorRBAC.temPermissao(role, recurso, acao)) {
      throw new Error(`Permissão negada: ${recurso}:${acao}`);
    }
  };
}
