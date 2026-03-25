// ============================================================
// Fontes — Bases de dados integradas à plataforma
// ============================================================

import { Layout } from '@/components/Layout';
import { fontesIntegradas } from '@/lib/mockData';
import { Database, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

const tipoColors: Record<string, string> = {
  Eleitoral: '#A78BFA',
  Contratos: '#06B6D4',
  Financeiro: '#34D399',
  RH: '#F59E0B',
  Empresarial: '#FB923C',
  Geográfico: '#22D3EE',
  Auditoria: '#F43F5E',
  Preços: '#FBBF24',
  Normativo: '#94A3B8',
};

export default function Fontes() {
  return (
    <Layout
      title="Fontes de Dados"
      subtitle="Bases de dados abertas integradas à plataforma para análise cruzada"
      breadcrumb={['TransparênciaIA', 'Fontes de Dados']}
    >
      <div className="p-6 space-y-6">
        {/* Hero */}
        <div
          className="relative rounded-xl overflow-hidden p-8"
          style={{ background: 'var(--card)' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663473737627/fpYbPguHApKQ6HcUHWkH7V/data-streams-b32i9mqAMCZqyBtaGB3UHS.webp)`,
            }}
          />
          <div className="relative z-10">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: '#06B6D4', fontFamily: 'Fira Code, monospace' }}
            >
              Integração Contínua
            </div>
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {fontesIntegradas.length} Bases de Dados Abertas
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              A plataforma realiza cruzamento automático de informações provenientes de dezenas de
              fontes governamentais abertas, atualizadas diariamente para garantir análises precisas
              e atuais.
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {fontesIntegradas.filter(f => f.status === 'ativo').length}
                </div>
                <div className="text-xs text-slate-500">fontes ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  ~70M
                </div>
                <div className="text-xs text-slate-500">registros indexados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  24h
                </div>
                <div className="text-xs text-slate-500">ciclo de atualização</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sources grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {fontesIntegradas.map((fonte) => {
            const color = tipoColors[fonte.tipo] || '#64748B';
            return (
              <div
                key={fonte.nome}
                className="gradient-border rounded-xl p-5 hover:scale-[1.01] transition-transform"
                style={{ background: 'var(--card)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Database className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-semibold text-white leading-tight"
                      style={{ fontFamily: 'Sora, sans-serif' }}
                    >
                      {fonte.nome}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: `${color}15`, color }}
                      >
                        {fonte.tipo}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[10px] text-emerald-400"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {fonte.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-lg p-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-[10px] text-slate-600 mb-0.5">Registros</div>
                    <div className="text-sm font-mono font-bold text-white">{fonte.registros}</div>
                  </div>
                  <div
                    className="rounded-lg p-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-[10px] text-slate-600 mb-0.5">Última Sync</div>
                    <div className="text-xs font-mono text-slate-400">{fonte.ultimaSync}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <RefreshCw className="w-3 h-3" />
                    <span>Atualização automática</span>
                  </div>
                  <button className="flex items-center gap-1 text-[10px] text-cyan-500 hover:text-cyan-400 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    <span>Acessar fonte</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional sources note */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.04)' }}
        >
          <h3
            className="text-sm font-semibold text-white mb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Expansão Contínua das Fontes
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            A plataforma está em constante expansão, integrando novas bases de dados conforme
            disponibilizadas pelos órgãos públicos. Contribuições da comunidade para identificação
            de novas fontes são bem-vindas via GitHub.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Portais Municipais', 'TCEs Estaduais', 'Ministério Público', 'CGU', 'CADE', 'CVM', 'BACEN', 'ANATEL'].map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded font-mono"
                style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}
              >
                {f} — em integração
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
