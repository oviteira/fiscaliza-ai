/**
 * Hook React para conexão WebSocket em tempo real
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

interface EstatisticasWebSocket {
  clientesConectados: number;
  salasAtivas: number;
  timestamp: Date;
}

/**
 * Hook para usar WebSocket
 */
export function useRealtime() {
  const socketRef = useRef<Socket | null>(null);
  const [conectado, setConectado] = useState(false);
  const [atualizacoesRisco, setAtualizacoesRisco] = useState<AtualizacaoRisco[]>([]);
  const [alertas, setAlertas] = useState<AtualizacaoAlerta[]>([]);
  const [sincronizacoes, setSincronizacoes] = useState<AtualizacaoSincronizacao[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasWebSocket | null>(null);

  // Conectar ao servidor WebSocket
  useEffect(() => {
    const socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Conectado ao servidor');
      setConectado(true);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado do servidor');
      setConectado(false);
    });

    socket.on('conectado', (dados) => {
      console.log('[WebSocket] ID do cliente:', dados.id);
    });

    socket.on('atualizacao-risco', (atualizacao: AtualizacaoRisco) => {
      console.log('[WebSocket] Atualização de risco recebida:', atualizacao);
      setAtualizacoesRisco((prev) => [atualizacao, ...prev].slice(0, 50));
    });

    socket.on('novo-alerta', (alerta: AtualizacaoAlerta) => {
      console.log('[WebSocket] Novo alerta recebido:', alerta);
      setAlertas((prev) => [alerta, ...prev].slice(0, 50));
    });

    socket.on('alerta-parlamentar', (alerta: AtualizacaoAlerta) => {
      console.log('[WebSocket] Alerta de parlamentar recebido:', alerta);
    });

    socket.on('atualizacao-sincronizacao', (atualizacao: AtualizacaoSincronizacao) => {
      console.log('[WebSocket] Atualização de sincronização recebida:', atualizacao);
      setSincronizacoes((prev) => [atualizacao, ...prev].slice(0, 50));
    });

    socket.on('estatisticas', (dados: EstatisticasWebSocket) => {
      setEstatisticas(dados);
    });

    socket.on('pong', () => {
      console.log('[WebSocket] Pong recebido');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Entrar em uma sala
  const entrarSala = useCallback((sala: string) => {
    if (socketRef.current) {
      socketRef.current.emit('entrar-sala', sala);
      console.log('[WebSocket] Entrando na sala:', sala);
    }
  }, []);

  // Sair de uma sala
  const sairSala = useCallback((sala: string) => {
    if (socketRef.current) {
      socketRef.current.emit('sair-sala', sala);
      console.log('[WebSocket] Saindo da sala:', sala);
    }
  }, []);

  // Enviar ping
  const enviarPing = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('ping');
    }
  }, []);

  // Limpar atualizações
  const limparAtualizacoes = useCallback(() => {
    setAtualizacoesRisco([]);
    setAlertas([]);
    setSincronizacoes([]);
  }, []);

  return {
    conectado,
    atualizacoesRisco,
    alertas,
    sincronizacoes,
    estatisticas,
    entrarSala,
    sairSala,
    enviarPing,
    limparAtualizacoes,
    socket: socketRef.current,
  };
}

/**
 * Hook para monitorar alertas em tempo real
 */
export function useAlertas() {
  const { alertas, conectado, entrarSala, sairSala } = useRealtime();
  const [alertasNovos, setAlertasNovos] = useState<AtualizacaoAlerta[]>([]);

  useEffect(() => {
    if (conectado) {
      entrarSala('alertas');
    }

    return () => {
      if (conectado) {
        sairSala('alertas');
      }
    };
  }, [conectado, entrarSala, sairSala]);

  useEffect(() => {
    setAlertasNovos(alertas);
  }, [alertas]);

  return {
    alertas: alertasNovos,
    conectado,
  };
}

/**
 * Hook para monitorar sincronizações em tempo real
 */
export function useSincronizacoes() {
  const { sincronizacoes, conectado, entrarSala, sairSala } = useRealtime();
  const [sincronizacoesMonitoradas, setSincronizacoesMonitoradas] = useState<AtualizacaoSincronizacao[]>([]);

  useEffect(() => {
    if (conectado) {
      entrarSala('sincronizacoes');
    }

    return () => {
      if (conectado) {
        sairSala('sincronizacoes');
      }
    };
  }, [conectado, entrarSala, sairSala]);

  useEffect(() => {
    setSincronizacoesMonitoradas(sincronizacoes);
  }, [sincronizacoes]);

  return {
    sincronizacoes: sincronizacoesMonitoradas,
    conectado,
  };
}
