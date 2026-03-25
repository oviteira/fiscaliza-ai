// ============================================================
// Alertas — Lista de alertas e riscos detectados pela IA
// ============================================================

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { RiskBadge } from '@/components/RiskScore';
import {
  parlamentares,
  formatCurrency,
  getRiskColor,
  getAlertaTipoLabel,
  type Alerta,
} from '@/lib/mockData';
import { AlertTriangle, Clock, Database, TrendingUp, Filter } from 'lucide-react';

// Flatten all alerts from all parlamentares
const allAlertas = parlamentares.flatMap((p) =>
  p.alertas.map((a) => ({
    ...a,
    parlamentarNome: p.nome,
    parlamentarPartido: p.partido,
    parlamentarEstado: p.estado,
    parlamentarScore: p.scoreRisco,
    parlamentarNivel: p.nivelRisco,
  }))
).sort((a, b) => b.scoreContribuicao - a.scoreContribuicao);

const tipoColors: Record<string, string> = {
  contrato_familiar: '#F43F5E',
  emenda_direcionada: '#F59E0B',
  variacao_patrimonial: '#A78BFA',
  funcionario_fantasma: '#FB923C',
  sobrepreco: '#FBBF24',
  concentracao_fornecedor: '#06B6D4',
};

const tipoIcons: Record<string, string> = {
  contrato_familiar: '👥',
  emenda_direcionada: '🎯',
  variacao_patrimonial: '📈',
  funcionario_fantasma: '👻',
  sobrepreco: '💰',
  concentracao_fornecedor: '🏢',
};

export default function Alertas() {
  const [tipoFilter, setTipoFilter] = useState('all');
  const [search, setSearch] = useState('');

  const tipos = ['all', ...Array.from(new Set(allAlertas.map((a) => a.tipo)))];

  const filtered = allAlertas.filter((a) => {
    const matchTipo = tipoFilter === 'all' || a.tipo === tipoFilter;
    const matchSearch =
      !search ||
      a.parlamentarNome.toLowerCase().includes(search.toLowerCase()) ||
      a.descricao.toLowerCase().includes(search.toLowerCase());
    return matchTipo && matchSearch;
  });

  const totalValor = filtered.reduce((sum, a) => sum + a.valorEnvolvido, 0);

  return (
    <Layout
      title="Central de Alertas"
      subtitle="Riscos e anomalias detectados automaticamente pela análise de IA"
      breadcrumb={['TransparênciaIA', 'Alertas']}
    >
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Total de Alertas',
              value: allAlertas.length.toString(),
              sub: 'detectados pela IA',
              icon: AlertTriangle,
              color: '#F43F5E',
            },
            {
              label: 'Valor Envolvido',
              value: formatCurrency(allAlertas.reduce((s, a) => s + a.valorEnvolvido, 0)),
              sub: 'em potenciais riscos',
              icon: TrendingUp,
              color: '#FBBF24',
            },
            {
              label: 'Parlamentares',
              value: new Set(allAlertas.map((a) => a.parlamentarNome)).size.toString(),
              sub: 'com alertas ativos',
              icon: Filter,
              color: '#F59E0B',
            },
            {
              label: 'Última Detecção',
              value: '24/03/2026',
              sub: 'atualização contínua',
              icon: Clock,
              color: '#06B6D4',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="gradient-border rounded-xl p-4"
                style={{ background: 'var(--card)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                  <span className="text-xs text-slate-500">{card.label}</span>
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Sora, sans-serif', color: card.color }}
                >
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">{card.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div
          className="gradient-border rounded-xl p-4"
          style={{ background: 'var(--card)' }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Buscar alertas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-slate-600 outline-none border rounded-lg px-3 py-2 flex-1 min-w-48"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}
            />
            <div className="flex flex-wrap gap-1">
              {tipos.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoFilter(tipo)}
                  className="px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1"
                  style={{
                    background: tipoFilter === tipo ? `${tipoColors[tipo] || '#06B6D4'}20` : 'rgba(255,255,255,0.04)',
                    color: tipoFilter === tipo ? (tipoColors[tipo] || '#06B6D4') : '#64748B',
                    border: `1px solid ${tipoFilter === tipo ? `${tipoColors[tipo] || '#06B6D4'}40` : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {tipo !== 'all' && <span>{tipoIcons[tipo]}</span>}
                  {tipo === 'all' ? 'Todos' : getAlertaTipoLabel(tipo)}
                </button>
              ))}
            </div>
            <div className="ml-auto text-xs text-slate-600 font-mono">
              {filtered.length} alerta{filtered.length !== 1 ? 's' : ''}
              {filtered.length > 0 && (
                <span className="ml-2 text-amber-500">{formatCurrency(totalValor)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Alerts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map((alerta) => {
            const color = tipoColors[alerta.tipo] || '#64748B';
            return (
              <div
                key={alerta.id}
                className="gradient-border rounded-xl p-5 hover:scale-[1.01] transition-transform"
                style={{
                  background: 'var(--card)',
                  borderLeft: `3px solid ${color}`,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tipoIcons[alerta.tipo]}</span>
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color, fontFamily: 'Sora, sans-serif' }}
                      >
                        {getAlertaTipoLabel(alerta.tipo)}
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">{alerta.dataDeteccao}</div>
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ background: `${color}15`, color }}
                  >
                    +{alerta.scoreContribuicao}pts
                  </div>
                </div>

                {/* Parlamentar */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: `${getRiskColor(alerta.parlamentarNivel)}20`,
                      color: getRiskColor(alerta.parlamentarNivel),
                      fontFamily: 'Sora, sans-serif',
                    }}
                  >
                    {alerta.parlamentarNome.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-white font-medium truncate">{alerta.parlamentarNome}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {alerta.parlamentarPartido} · {alerta.parlamentarEstado}
                    </div>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <RiskBadge score={alerta.parlamentarScore} nivel={alerta.parlamentarNivel} compact />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {alerta.descricao}
                </p>

                {/* Value */}
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2 mb-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-[10px] text-slate-500">Valor envolvido</span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {formatCurrency(alerta.valorEnvolvido)}
                  </span>
                </div>

                {/* Sources */}
                <div className="flex flex-wrap gap-1">
                  {alerta.fontes.map((f: string) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B' }}
                    >
                      <Database className="w-2.5 h-2.5" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-lg border p-4 text-xs text-slate-500 leading-relaxed"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="font-semibold text-slate-400">Aviso legal:</span> Os alertas apresentados são gerados por algoritmos de análise estatística e identificação de padrões em dados públicos. Não constituem acusação, imputação de responsabilidade ou afirmação de irregularidade. Têm caráter exclusivamente analítico para fins de controle social e transparência pública.
        </div>
      </div>
    </Layout>
  );
}
