// ============================================================
// Contratos — Análise de contratos públicos com scores de risco
// ============================================================

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { RiskBadge } from '@/components/RiskScore';
import { contratos, parlamentares, formatCurrency, getRiskColor, type Contrato } from '@/lib/mockData';
import { Search, X, FileText, AlertTriangle, Building2, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Contratos() {
  const [search, setSearch] = useState('');
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = contratos.filter((c) => {
    const matchSearch =
      c.objeto.toLowerCase().includes(search.toLowerCase()) ||
      c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      c.orgao.toLowerCase().includes(search.toLowerCase()) ||
      c.numero.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'all' || c.nivelRisco === riskFilter;
    return matchSearch && matchRisk;
  });

  const totalValor = filtered.reduce((sum, c) => sum + c.valor, 0);

  const getParlamentar = (id?: string) => {
    if (!id) return null;
    return parlamentares.find((p) => p.id === id);
  };

  return (
    <Layout
      title="Contratos Públicos"
      subtitle="Análise de contratos com scores de risco e detecção de padrões"
      breadcrumb={['TransparênciaIA', 'Contratos']}
    >
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Filtrado', value: filtered.length.toString(), sub: 'contratos', color: '#06B6D4' },
              { label: 'Valor Total', value: formatCurrency(totalValor), sub: 'em contratos', color: '#34D399' },
              { label: 'Score Crítico', value: filtered.filter(c => c.nivelRisco === 'critico').length.toString(), sub: 'contratos críticos', color: '#F43F5E' },
              { label: 'Score Alto', value: filtered.filter(c => c.nivelRisco === 'alto').length.toString(), sub: 'contratos alto risco', color: '#F59E0B' },
            ].map((card) => (
              <div
                key={card.label}
                className="gradient-border rounded-xl p-4"
                style={{ background: 'var(--card)' }}
              >
                <div className="text-xs text-slate-500 mb-1">{card.label}</div>
                <div
                  className="text-xl font-bold"
                  style={{ fontFamily: 'Sora, sans-serif', color: card.color }}
                >
                  {card.value}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            className="gradient-border rounded-xl p-4"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 flex-1 min-w-48"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por objeto, fornecedor, órgão ou número…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-slate-600 outline-none flex-1"
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                  </button>
                )}
              </div>

              <div className="flex gap-1">
                {[
                  { label: 'Todos', value: 'all' },
                  { label: 'Crítico', value: 'critico' },
                  { label: 'Alto', value: 'alto' },
                  { label: 'Médio', value: 'medio' },
                  { label: 'Baixo', value: 'baixo' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRiskFilter(opt.value)}
                    className="px-2.5 py-1 rounded text-xs transition-all"
                    style={{
                      background: riskFilter === opt.value ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                      color: riskFilter === opt.value ? '#06B6D4' : '#64748B',
                      border: `1px solid ${riskFilter === opt.value ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto text-xs text-slate-600 font-mono">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Contracts table */}
          <div
            className="gradient-border rounded-xl overflow-hidden"
            style={{ background: 'var(--card)' }}
          >
            <table className="w-full data-table">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-4 py-3">Número / Objeto</th>
                  <th className="text-left px-4 py-3">Fornecedor</th>
                  <th className="text-left px-4 py-3">Órgão</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="text-center px-4 py-3">Score</th>
                  <th className="text-center px-4 py-3">Alertas</th>
                  <th className="text-center px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const parlamentar = getParlamentar(c.parlamentarVinculado);
                  return (
                    <tr
                      key={c.id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: selectedContrato?.id === c.id ? 'rgba(6,182,212,0.06)' : undefined,
                        borderLeft: `3px solid ${getRiskColor(c.nivelRisco)}`,
                      }}
                      onClick={() => setSelectedContrato(c)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-xs font-mono text-slate-500 mb-0.5">{c.numero}</div>
                        <div className="text-sm text-white font-medium leading-tight max-w-xs truncate">
                          {c.objeto}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5 font-mono">
                          {c.dataAssinatura} → {c.dataVencimento}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-300">{c.fornecedor}</div>
                        <div className="text-[10px] text-slate-600 font-mono">{c.cnpjFornecedor}</div>
                        {parlamentar && (
                          <div
                            className="text-[10px] mt-1 px-1.5 py-0.5 rounded inline-block"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}
                          >
                            Vinc. {parlamentar.nome.split(' ')[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-400 max-w-[160px] truncate">{c.orgao}</div>
                        <div className="text-[10px] text-slate-600">{c.fonte}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-mono text-white font-bold">
                          {formatCurrency(c.valor)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RiskBadge score={c.scoreRisco} nivel={c.nivelRisco} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.alertas.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                            style={{
                              background: 'rgba(244,63,94,0.12)',
                              color: '#F43F5E',
                              border: '1px solid rgba(244,63,94,0.25)',
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {c.alertas.length}
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
                          onClick={(e) => { e.stopPropagation(); setSelectedContrato(c); }}
                        >
                          Detalhar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedContrato && (
          <div
            className="w-80 flex-shrink-0 border-l overflow-y-auto p-5 space-y-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500 mb-1">{selectedContrato.numero}</div>
                <h3
                  className="text-sm font-bold text-white leading-tight"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {selectedContrato.objeto}
                </h3>
              </div>
              <button onClick={() => setSelectedContrato(null)} className="text-slate-600 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              <div className="text-center">
                <div
                  className="text-4xl font-bold mb-1"
                  style={{ fontFamily: 'Sora, sans-serif', color: getRiskColor(selectedContrato.nivelRisco) }}
                >
                  {selectedContrato.scoreRisco}
                </div>
                <div className="text-xs text-slate-500">Score de Risco</div>
                <RiskBadge score={selectedContrato.scoreRisco} nivel={selectedContrato.nivelRisco} />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: FileText, label: 'Valor', value: formatCurrency(selectedContrato.valor) },
                { icon: Building2, label: 'Fornecedor', value: selectedContrato.fornecedor },
                { icon: Building2, label: 'CNPJ', value: selectedContrato.cnpjFornecedor },
                { icon: Building2, label: 'Órgão', value: selectedContrato.orgao },
                { icon: Calendar, label: 'Assinatura', value: selectedContrato.dataAssinatura },
                { icon: Calendar, label: 'Vencimento', value: selectedContrato.dataVencimento },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-2 rounded-lg p-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-600">{item.label}</div>
                      <div className="text-xs text-slate-300 font-mono">{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedContrato.alertas.length > 0 && (
              <div>
                <h4
                  className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  Alertas
                </h4>
                <div className="space-y-2">
                  {selectedContrato.alertas.map((alerta, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg p-2.5"
                      style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 leading-relaxed">{alerta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] text-slate-600 mb-1">Fonte dos dados</div>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(6,182,212,0.08)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.15)' }}
              >
                {selectedContrato.fonte}
              </span>
            </div>

            <Button
              className="w-full text-xs h-8"
              style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
              onClick={() => toast.info('Relatório do contrato em desenvolvimento')}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Acessar Fonte Original
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
