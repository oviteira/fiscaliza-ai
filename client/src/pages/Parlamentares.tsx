// ============================================================
// Parlamentares — Lista com scores de risco e alertas
// ============================================================

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { RiskScore, RiskBadge } from '@/components/RiskScore';
import {
  parlamentares,
  formatCurrency,
  getRiskColor,
  getRiskLabel,
  getAlertaTipoLabel,
  type Parlamentar,
} from '@/lib/mockData';
import { Search, Filter, ChevronDown, X, AlertTriangle, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const nivelOptions = ['Todos', 'Crítico', 'Alto', 'Médio', 'Baixo'];
const partidoOptions = ['Todos', 'PSD', 'PT', 'União Brasil', 'PSDB', 'MDB', 'Republicanos'];

export default function Parlamentares() {
  const [search, setSearch] = useState('');
  const [nivelFilter, setNivelFilter] = useState('Todos');
  const [partidoFilter, setPartidoFilter] = useState('Todos');
  const [selectedParlamentar, setSelectedParlamentar] = useState<Parlamentar | null>(null);
  const [sortBy, setSortBy] = useState<'scoreRisco' | 'nome' | 'valorContratos'>('scoreRisco');

  const filtered = parlamentares
    .filter((p) => {
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) ||
        p.partido.toLowerCase().includes(search.toLowerCase()) ||
        p.estado.toLowerCase().includes(search.toLowerCase());
      const matchNivel = nivelFilter === 'Todos' || getRiskLabel(p.nivelRisco) === nivelFilter;
      const matchPartido = partidoFilter === 'Todos' || p.partido === partidoFilter;
      return matchSearch && matchNivel && matchPartido;
    })
    .sort((a, b) => {
      if (sortBy === 'scoreRisco') return b.scoreRisco - a.scoreRisco;
      if (sortBy === 'nome') return a.nome.localeCompare(b.nome);
      if (sortBy === 'valorContratos') return b.valorContratos - a.valorContratos;
      return 0;
    });

  return (
    <Layout
      title="Parlamentares"
      subtitle="Análise de scores de risco e alertas por agente público"
      breadcrumb={['TransparênciaIA', 'Parlamentares']}
    >
      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* Filters */}
          <div
            className="gradient-border rounded-xl p-4"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-48"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome, partido ou estado…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                  </button>
                )}
              </div>

              {/* Nivel filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <div className="flex gap-1">
                  {nivelOptions.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNivelFilter(n)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                      style={{
                        background: nivelFilter === n ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                        color: nivelFilter === n ? '#06B6D4' : '#64748B',
                        border: `1px solid ${nivelFilter === n ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-400 outline-none cursor-pointer"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  <option value="scoreRisco" style={{ background: '#1E293B' }}>Score de Risco</option>
                  <option value="nome" style={{ background: '#1E293B' }}>Nome</option>
                  <option value="valorContratos" style={{ background: '#1E293B' }}>Valor de Contratos</option>
                </select>
              </div>

              <div className="ml-auto text-xs text-slate-600 font-mono">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="gradient-border rounded-xl overflow-hidden"
            style={{ background: 'var(--card)' }}
          >
            <table className="w-full data-table">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-4 py-3">Parlamentar</th>
                  <th className="text-left px-4 py-3">Cargo / Estado</th>
                  <th className="text-center px-4 py-3">Score de Risco</th>
                  <th className="text-right px-4 py-3">Contratos</th>
                  <th className="text-right px-4 py-3">Emendas</th>
                  <th className="text-center px-4 py-3">Alertas</th>
                  <th className="text-center px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="transition-colors cursor-pointer"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: selectedParlamentar?.id === p.id ? 'rgba(6,182,212,0.06)' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedParlamentar?.id !== p.id) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedParlamentar?.id !== p.id) {
                        (e.currentTarget as HTMLElement).style.background = '';
                      }
                    }}
                    onClick={() => setSelectedParlamentar(p)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: `${getRiskColor(p.nivelRisco)}20`,
                            color: getRiskColor(p.nivelRisco),
                            fontFamily: 'Sora, sans-serif',
                          }}
                        >
                          {p.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{p.nome}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{p.partido}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-300">{p.cargo}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{p.estado} · {p.mandato}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <RiskBadge score={p.scoreRisco} nivel={p.nivelRisco} />
                        <div className="w-24 h-1 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${p.scoreRisco}%`,
                              backgroundColor: getRiskColor(p.nivelRisco),
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-white font-mono">{formatCurrency(p.valorContratos)}</div>
                      <div className="text-[11px] text-slate-500">{p.totalContratos} contratos</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm text-white font-mono">{formatCurrency(p.valorEmendas)}</div>
                      <div className="text-[11px] text-slate-500">{p.totalEmendas} emendas</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.alertas.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                          style={{
                            background: 'rgba(244,63,94,0.12)',
                            color: '#F43F5E',
                            border: '1px solid rgba(244,63,94,0.25)',
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {p.alertas.length}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 text-xs text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParlamentar(p);
                        }}
                      >
                        Detalhar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedParlamentar && (
          <div
            className="w-80 flex-shrink-0 border-l overflow-y-auto p-5 space-y-5"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-base font-bold text-white leading-tight"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {selectedParlamentar.nome}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {selectedParlamentar.partido} · {selectedParlamentar.estado}
                </div>
              </div>
              <button
                onClick={() => setSelectedParlamentar(null)}
                className="text-slate-600 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score ring */}
            <div className="flex justify-center py-2">
              <RiskScore
                score={selectedParlamentar.scoreRisco}
                nivel={selectedParlamentar.nivelRisco}
                size="lg"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Contratos', value: formatCurrency(selectedParlamentar.valorContratos), icon: FileText },
                { label: 'Emendas', value: formatCurrency(selectedParlamentar.valorEmendas), icon: FileText },
                { label: 'Empresas Vinc.', value: selectedParlamentar.empresasVinculadas.toString(), icon: Building2 },
                { label: 'Alertas', value: selectedParlamentar.alertas.length.toString(), icon: AlertTriangle },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-lg p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-[10px] text-slate-500 mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-white font-mono">{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Alertas */}
            {selectedParlamentar.alertas.length > 0 && (
              <div>
                <h4
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  Alertas Detectados
                </h4>
                <div className="space-y-3">
                  {selectedParlamentar.alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="rounded-lg p-3 border-l-2"
                      style={{
                        background: 'rgba(244,63,94,0.06)',
                        borderLeftColor: '#F43F5E',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wide"
                          style={{ color: '#F43F5E', fontFamily: 'Sora, sans-serif' }}
                        >
                          {getAlertaTipoLabel(alerta.tipo)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600">{alerta.dataDeteccao}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{alerta.descricao}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400">
                          {formatCurrency(alerta.valorEnvolvido)}
                        </span>
                        <span className="text-[10px] text-slate-600">
                          +{alerta.scoreContribuicao}pts score
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {alerta.fontes.map((f) => (
                          <span
                            key={f}
                            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fontes */}
            <div>
              <h4
                className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Fontes Consultadas
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedParlamentar.fontesDados.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded font-mono"
                    style={{
                      background: 'rgba(6,182,212,0.08)',
                      color: '#06B6D4',
                      border: '1px solid rgba(6,182,212,0.15)',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <Button
              className="w-full text-xs h-8"
              style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
              onClick={() => toast.info('Relatório completo em desenvolvimento', { description: 'Esta funcionalidade estará disponível em breve.' })}
            >
              Gerar Relatório Completo
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
