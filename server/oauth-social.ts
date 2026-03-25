/**
 * Autenticação Social OAuth2
 * 
 * Suporta GitHub e Google OAuth
 */

import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface UsuarioOAuth {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'github' | 'google';
}

/**
 * Classe para gerenciar autenticação social
 */
export class GerenciadorOAuthSocial {
  /**
   * Processar login GitHub
   */
  async processarGitHub(perfil: any): Promise<any> {
    const usuarioOAuth: UsuarioOAuth = {
      id: perfil.id.toString(),
      email: perfil.email || `${perfil.login}@github.com`,
      name: perfil.name || perfil.login,
      avatar: perfil.avatar_url,
      provider: 'github',
    };

    return this.upsertUsuario(usuarioOAuth);
  }

  /**
   * Processar login Google
   */
  async processarGoogle(perfil: any): Promise<any> {
    const usuarioOAuth: UsuarioOAuth = {
      id: perfil.sub,
      email: perfil.email,
      name: perfil.name,
      avatar: perfil.picture,
      provider: 'google',
    };

    return this.upsertUsuario(usuarioOAuth);
  }

  /**
   * Criar ou atualizar usuário
   */
  private async upsertUsuario(usuarioOAuth: UsuarioOAuth): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Buscar usuário existente
      let usuario = null;

      if (usuarioOAuth.provider === 'github') {
        const resultado = await db
          .select()
          .from(users)
          .where(eq(users.githubId, usuarioOAuth.id))
          .limit(1);
        usuario = resultado[0];
      } else if (usuarioOAuth.provider === 'google') {
        const resultado = await db
          .select()
          .from(users)
          .where(eq(users.googleId, usuarioOAuth.id))
          .limit(1);
        usuario = resultado[0];
      }

      if (usuario) {
        // Atualizar usuário existente
        console.log(`[OAuth] Usuário ${usuarioOAuth.email} já existe, atualizando...`);
        return usuario;
      }

      // Criar novo usuário
      console.log(`[OAuth] Criando novo usuário ${usuarioOAuth.email}...`);

      const novoUsuario = {
        openId: `${usuarioOAuth.provider}-${usuarioOAuth.id}`,
        email: usuarioOAuth.email,
        name: usuarioOAuth.name,
        avatar: usuarioOAuth.avatar,
        loginMethod: usuarioOAuth.provider,
        role: 'visualizador' as const,
        permissoes: '[]',
        ativo: 1,
        lastSignedIn: new Date(),
        ...(usuarioOAuth.provider === 'github' && { githubId: usuarioOAuth.id }),
        ...(usuarioOAuth.provider === 'google' && { googleId: usuarioOAuth.id }),
      };

      await db.insert(users).values(novoUsuario);

      const usuarioCriado = await db
        .select()
        .from(users)
        .where(eq(users.openId, novoUsuario.openId))
        .limit(1);

      console.log(`[OAuth] Usuário ${usuarioOAuth.email} criado com sucesso`);
      return usuarioCriado[0];
    } catch (erro) {
      console.error('[OAuth] Erro ao processar usuário:', erro);
      throw erro;
    }
  }

  /**
   * Gerar URL de callback GitHub
   */
  gerarUrlGitHub(clientId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user:email',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Gerar URL de callback Google
   */
  gerarUrlGoogle(clientId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Trocar código por token GitHub
   */
  async trocarCodigoGitHub(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<any> {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const dados = await response.json();

      if (dados.error) {
        throw new Error(`GitHub OAuth error: ${dados.error}`);
      }

      return dados.access_token;
    } catch (erro) {
      console.error('[OAuth GitHub] Erro ao trocar código:', erro);
      throw erro;
    }
  }

  /**
   * Trocar código por token Google
   */
  async trocarCodigoGoogle(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const dados = await response.json();

      if (dados.error) {
        throw new Error(`Google OAuth error: ${dados.error}`);
      }

      return dados.id_token;
    } catch (erro) {
      console.error('[OAuth Google] Erro ao trocar código:', erro);
      throw erro;
    }
  }

  /**
   * Obter perfil do GitHub
   */
  async obterPerfilGitHub(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (erro) {
      console.error('[OAuth GitHub] Erro ao obter perfil:', erro);
      throw erro;
    }
  }

  /**
   * Obter perfil do Google
   */
  async obterPerfilGoogle(idToken: string): Promise<any> {
    try {
      // Decodificar JWT (simplificado - em produção usar biblioteca)
      const partes = idToken.split('.');
      const payload = JSON.parse(Buffer.from(partes[1], 'base64').toString());

      return payload;
    } catch (erro) {
      console.error('[OAuth Google] Erro ao decodificar token:', erro);
      throw erro;
    }
  }
}

/**
 * Instância global
 */
export const gerenciadorOAuthSocial = new GerenciadorOAuthSocial();
