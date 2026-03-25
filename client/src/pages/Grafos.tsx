// ============================================================
// Grafos — Visualização de rede de conexões entre entidades
// ============================================================

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { NetworkGraph } from '@/components/NetworkGraph';
import { RiskBadge } from '@/components/RiskScore';
import { graphData, getRiskColor, formatCurrency, type GraphNode } from '@/lib/mockData';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const filterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Parlamentares', value: 'parlamentar' },
  { label: 'Empresas', value: 'empresa' },
  { label: 'Familiares', value: 'familiar' },
  { label: 'Órgãos', value: 'orgao' },
];

export default function Grafos() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredNodes = graphData.nodes.filter((n) => {
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    const matchRisk = riskFilter === 'all' || n.nivelRisco === riskFilter;
    return matchType && matchRisk;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = graphData.links.filter(
    (l) => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
  );

  const connectedLinks = selectedNode
    ? graphData.links.filter(
        (l) => l.source === selectedNode.id || l.target === selectedNode.id
      )
    : [];

  return (
    <Layout
      title="Grafo de Conexões"
      subtitle="Visualização de rede de relações entre parlamentares, empresas e contratos"
      breadcrumb={['TransparênciaIA', 'Grafo de Conexões']}
    >
      <div className="flex h-full overflow-hidden">
        {/* Graph area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Network className="w-3.5 h-3.5" />
              <span className="font-mono">{filteredNodes.length} nós · {filteredLinks.length} arestas</span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            {/* Type filter */}
            <div className="flex gap-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className="px-2.5 py-1 rounded text-xs transition-all"
                  style={{
                    background: typeFilter === opt.value ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                    color: typeFilter === opt.value ? '#06B6D4' : '#64748B',
                    border: `1px solid ${typeFilter === opt.value ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/10" />

            {/* Risk filter */}
            <div className="flex gap-1">
              {[
                { label: 'Todos', value: 'all', color: '#64748B' },
                { label: 'Crítico', value: 'critico', color: '#F43F5E' },
                { label: 'Alto', value: 'alto', color: '#F59E0B' },
                { label: 'Médio', value: 'medio', color: '#FBBF24' },
                { label: 'Baixo', value: 'baixo', color: '#34D399' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRiskFilter(opt.value)}
                  className="px-2.5 py-1 rounded text-xs transition-all"
                  style={{
                    background: riskFilter === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)',
                    color: riskFilter === opt.value ? opt.color : '#64748B',
                    border: `1px solid ${riskFilter === opt.value ? `${opt.color}40` : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-slate-500 hover:text-slate-300"
                onClick={() => toast.info('Use scroll do mouse para zoom e arraste para mover o grafo')}
              >
                <Info className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Graph */}
          <div className="flex-1 overflow-hidden" style={{ background: 'var(--background)' }}>
            <NetworkGraph
              nodes={filteredNodes}
              links={filteredLinks}
              onNodeClick={setSelectedNode}
              height={window.innerHeight - 200}
            />
          </div>
        </div>

        {/* Side panel */}
        <div
          className="w-72 flex-shrink-0 border-l overflow-y-auto"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {selectedNode ? (
            <div className="p-5 space-y-4">
              <div>
                <div
                  className="text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: '#06B6D4', fontFamily: 'Sora, sans-serif' }}
                >
                  {selectedNode.type}
                </div>
                <h3
                  className="text-base font-bold text-white"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {selectedNode.label}
                </h3>
                <div className="mt-2">
                  <RiskBadge score={selectedNode.scoreRisco} nivel={selectedNode.nivelRisco} />
                </div>
              </div>

              {selectedNode.valor && (
                <div
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}
                >
                  <div className="text-[10px] text-slate-500 mb-0.5">Valor Envolvido</div>
                  <div className="text-lg font-bold font-mono" style={{ color: '#06B6D4' }}>
                    {formatCurrency(selectedNode.valor)}
                  </div>
                </div>
              )}

              {selectedNode.partido && (
                <div className="text-sm text-slate-400">
                  <span className="text-slate-600">Partido: </span>{selectedNode.partido}
                  {selectedNode.estado && <> · {selectedNode.estado}</>}
                </div>
              )}

              {/* Connections */}
              {connectedLinks.length > 0 && (
                <div>
                  <h4
                    className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    Conexões ({connectedLinks.length})
                  </h4>
                  <div className="space-y-2">
                    {connectedLinks.map((link, i) => {
                      const otherId = link.source === selectedNode.id ? link.target : link.source;
                      const otherNode = graphData.nodes.find((n) => n.id === otherId);
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg p-2.5 cursor-pointer hover:bg-white/5 transition-colors"
                          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                          onClick={() => {
                            if (otherNode) setSelectedNode(otherNode);
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: getRiskColor(otherNode?.nivelRisco || 'baixo') }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs text-white font-medium truncate">
                              {otherNode?.label || otherId}
                            </div>
                            <div className="text-[10px] text-slate-500">{link.descricao}</div>
                            {link.valor && link.valor > 0 && (
                              <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                                {formatCurrency(link.valor)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                className="w-full text-xs h-8"
                style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.25)' }}
                onClick={() => toast.info('Análise expandida em desenvolvimento')}
              >
                Expandir Análise
              </Button>
            </div>
          ) : (
            <div className="p-5 flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(6,182,212,0.1)' }}
              >
                <Network className="w-6 h-6" style={{ color: '#06B6D4' }} />
              </div>
              <h3
                className="text-sm font-semibold text-white mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Selecione um nó
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clique em qualquer nó do grafo para visualizar os detalhes e conexões da entidade.
              </p>
              <div className="mt-6 space-y-2 w-full text-left">
                <div className="text-[10px] text-slate-600 uppercase tracking-wider" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Resumo do grafo
                </div>
                {[
                  { label: 'Parlamentares', count: graphData.nodes.filter(n => n.type === 'parlamentar').length, color: '#06B6D4' },
                  { label: 'Empresas', count: graphData.nodes.filter(n => n.type === 'empresa').length, color: '#FBBF24' },
                  { label: 'Familiares', count: graphData.nodes.filter(n => n.type === 'familiar').length, color: '#F43F5E' },
                  { label: 'Órgãos', count: graphData.nodes.filter(n => n.type === 'orgao').length, color: '#A78BFA' },
                  { label: 'Conexões', count: graphData.links.length, color: '#64748B' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400">{item.label}</span>
                    </div>
                    <span className="font-mono text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
