/**
 * Serviço de WebSocket para Atualizações em Tempo Real
 * 
 * Fornece atualizações live de scores de risco, alertas e sincronizações
 * para os clientes conectados.
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface ClienteConectado {
  id: string;
  socketId: string;
  conectadoEm: Date;
  ultimaAtividade: Date;
}

interface AtualizacaoRisco {
  parlamentarId: number;
  nome: string;
  scoreRisco: number;
  nivelRisco: string;
  timestamp: Date;
}

interface AtualizacaoAlerta {
  id: number;
  parlamentarId: number;
  tipo: string;
  titulo: string;
  scoreRisco: number;
  nivelRisco: string;
  timestamp: Date;
}

interface AtualizacaoSincronizacao {
  fonte: string;
  status: 'iniciada' | 'em_progresso' | 'concluida' | 'erro';
  percentualConclusao: number;
  mensagem: string;
  timestamp: Date;
}

/**
 * Classe para gerenciar conexões WebSocket
 */
export class GerenciadorWebSocket {
  private io: SocketIOServer | null = null;
  private clientes: Map<string, ClienteConectado> = new Map();
  private salas: Map<string, Set<string>> = new Map();

  /**
   * Inicializar servidor WebSocket
   */
  inicializar(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      this.aoConectar(socket);

      socket.on('disconnect', () => {
        this.aoDesconectar(socket);
      });

      socket.on('entrar-sala', (sala: string) => {
        this.entrarSala(socket, sala);
      });

      socket.on('sair-sala', (sala: string) => {
        this.sairSala(socket, sala);
      });

      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    console.log('[WebSocket] Servidor inicializado');
  }

  /**
   * Callback ao conectar
   */
  private aoConectar(socket: Socket): void {
    const cliente: ClienteConectado = {
      id: socket.id,
      socketId: socket.id,
      conectadoEm: new Date(),
      ultimaAtividade: new Date(),
    };

    this.clientes.set(socket.id, cliente);

    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);
    socket.emit('conectado', { id: socket.id, timestamp: new Date() });

    // Emitir número de clientes conectados
    this.emitirEstatisticas();
  }

  /**
   * Callback ao desconectar
   */
  private aoDesconectar(socket: Socket): void {
    this.clientes.delete(socket.id);

    // Remover de todas as salas
    this.salas.forEach((clientes) => {
      clientes.delete(socket.id);
    });

    console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);

    // Emitir número de clientes conectados
    this.emitirEstatisticas();
  }

  /**
   * Entrar em uma sala
   */
  private entrarSala(socket: Socket, sala: string): void {
    socket.join(sala);

    if (!this.salas.has(sala)) {
      this.salas.set(sala, new Set());
    }
    this.salas.get(sala)!.add(socket.id);

    console.log(`[WebSocket] Cliente ${socket.id} entrou na sala: ${sala}`);
  }

  /**
   * Sair de uma sala
   */
  private sairSala(socket: Socket, sala: string): void {
    socket.leave(sala);

    const clientes = this.salas.get(sala);
    if (clientes) {
      clientes.delete(socket.id);
      if (clientes.size === 0) {
        this.salas.delete(sala);
      }
    }

    console.log(`[WebSocket] Cliente ${socket.id} saiu da sala: ${sala}`);
  }

  /**
   * Emitir atualização de risco
   */
  emitirAtualizacaoRisco(atualizacao: AtualizacaoRisco): void {
    if (!this.io) return;

    this.io.emit('atualizacao-risco', atualizacao);
    console.log(`[WebSocket] Atualização de risco emitida: ${atualizacao.nome}`);
  }

  /**
   * Emitir novo alerta
   */
  emitirNovoAlerta(alerta: AtualizacaoAlerta): void {
    if (!this.io) return;

    this.io.emit('novo-alerta', alerta);
    this.io.to(`parlamentar-${alerta.parlamentarId}`).emit('alerta-parlamentar', alerta);

    console.log(`[WebSocket] Novo alerta emitido: ${alerta.titulo}`);
  }

  /**
   * Emitir atualização de sincronização
   */
  emitirAtualizacaoSincronizacao(atualizacao: AtualizacaoSincronizacao): void {
    if (!this.io) return;

    this.io.emit('atualizacao-sincronizacao', atualizacao);
    console.log(`[WebSocket] Atualização de sincronização emitida: ${atualizacao.fonte}`);
  }

  /**
   * Emitir estatísticas
   */
  private emitirEstatisticas(): void {
    if (!this.io) return;

    const estatisticas = {
      clientesConectados: this.clientes.size,
      salasAtivas: this.salas.size,
      timestamp: new Date(),
    };

    this.io.emit('estatisticas', estatisticas);
  }

  /**
   * Emitir para sala específica
   */
  emitirParaSala(sala: string, evento: string, dados: any): void {
    if (!this.io) return;

    this.io.to(sala).emit(evento, dados);
  }

  /**
   * Emitir para todos os clientes
   */
  emitirParaTodos(evento: string, dados: any): void {
    if (!this.io) return;

    this.io.emit(evento, dados);
  }

  /**
   * Obter número de clientes conectados
   */
  obterClientesConectados(): number {
    return this.clientes.size;
  }

  /**
   * Obter clientes de uma sala
   */
  obterClientesSala(sala: string): number {
    return this.salas.get(sala)?.size || 0;
  }

  /**
   * Fechar servidor
   */
  fechar(): void {
    if (this.io) {
      this.io.close();
      console.log('[WebSocket] Servidor fechado');
    }
  }
}

/**
 * Instância global do gerenciador WebSocket
 */
export const gerenciadorWebSocket = new GerenciadorWebSocket();
