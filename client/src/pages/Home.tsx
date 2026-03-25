// ============================================================
// Home — Painel Geral da Plataforma FiscalizaAI
// Design: Intelligence Dashboard — cards de stats + gráficos
// ============================================================

import { Layout } from '@/components/Layout';
import { RiskScore, RiskBadge } from '@/components/RiskScore';
import {
  estatisticasGerais,
  parlamentares,
  timelineAlertas,
  distribuicaoRisco,
  tiposAlerta,
  formatCurrency,
  getRiskColor,
} from '@/lib/mockData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle, Users, FileText, Database, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const statCards = [
  {
    label: 'Parlamentares Monitorados',
    value: estatisticasGerais.totalParlamentares.toLocaleString('pt-BR'),
    sub: `${estatisticasGerais.parlamentaresAltoRisco} com score crítico`,
    icon: Users,
    color: '#06B6D4',
    href: '/parlamentares',
  },
  {
    label: 'Contratos Analisados',
    value: estatisticasGerais.totalContratos.toLocaleString('pt-BR'),
    sub: `${estatisticasGerais.contratosAltoRisco.toLocaleString('pt-BR')} com risco elevado`,
    icon: FileText,
    color: '#FBBF24',
    href: '/contratos',
  },
  {
    label: 'Valor Total Analisado',
    value: formatCurrency(estatisticasGerais.totalValorAnalisado),
    sub: 'em contratos e emendas',
    icon: TrendingUp,
    color: '#34D399',
    href: '/contratos',
  },
  {
    label: 'Alertas Detectados',
    value: estatisticasGerais.totalAlertas.toLocaleString('pt-BR'),
    sub: 'nos últimos 30 dias',
    icon: AlertTriangle,
    color: '#F43F5E',
    href: '/alertas',
  },
  {
    label: 'Fontes Integradas',
    value: estatisticasGerais.fontesIntegradas.toString(),
    sub: 'bases de dados abertas',
    icon: Database,
    color: '#A78BFA',
    href: '/fontes',
  },
  {
    label: 'Cobertura de Análise',
    value: '94,7%',
    sub: 'dos dados públicos disponíveis',
    icon: Shield,
    color: '#06B6D4',
    href: '/metodologia',
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-lg border p-3 text-xs"
        style={{
          background: 'rgba(15,23,42,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="font-semibold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-mono text-white">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const topRisco = [...parlamentares].sort((a, b) => b.scoreRisco - a.scoreRisco).slice(0, 5);

  return (
    <Layout
      title="Painel Geral"
      subtitle="Visão consolidada de riscos e análises — atualizado em tempo real"
      breadcrumb={['FiscalizaAI', 'Painel Geral']}
    >
      <div className="p-6 space-y-6 stagger-children">

        {/* Hero banner */}
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ minHeight: 180 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663473737627/fpYbPguHApKQ6HcUHWkH7V/hero-network-graph-kHw5tgbBjFJvNFv6JVXFgr.webp)`,
              opacity: 0.35,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.7) 60%, transparent 100%)' }}
          />
          <div className="relative z-10 p-8 flex items-center justify-between">
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#06B6D4', fontFamily: 'Fira Code, monospace' }}
              >
                Sistema Ativo · Análise em Tempo Real
              </div>
              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Inteligência Artificial para<br />Transparência Pública
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                Cruzamento automático de {estatisticasGerais.fontesIntegradas} bases de dados abertas.
                Scores de risco baseados em padrões estatísticos e análise comportamental.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {formatCurrency(estatisticasGerais.totalValorAnalisado)}
                </div>
                <div className="text-xs text-slate-500 mt-1">em contratos monitorados</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#F43F5E' }}>
                  {estatisticasGerais.totalAlertas.toLocaleString('pt-BR')}
                </div>
                <div className="text-xs text-slate-500 mt-1">alertas detectados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}>
                <div
                  className="gradient-border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${card.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors"
                    />
                  </div>
                  <div
                    className="text-xl font-bold text-white mb-0.5"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {card.value}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">{card.label}</div>
                  <div className="text-[10px] mt-1" style={{ color: card.color }}>{card.sub}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeline de alertas */}
          <div
            className="gradient-border rounded-xl p-5 lg:col-span-2"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Evolução de Alertas por Nível de Risco
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Últimos 6 meses</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timelineAlertas} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="gradCritico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAlto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMedio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="mes" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Sans' }} />
                <Area type="monotone" dataKey="critico" name="Crítico" stroke="#F43F5E" fill="url(#gradCritico)" strokeWidth={2} />
                <Area type="monotone" dataKey="alto" name="Alto" stroke="#F59E0B" fill="url(#gradAlto)" strokeWidth={2} />
                <Area type="monotone" dataKey="medio" name="Médio" stroke="#FBBF24" fill="url(#gradMedio)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de risco */}
          <div
            className="gradient-border rounded-xl p-5"
            style={{ background: 'var(--card)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              Distribuição por Nível de Risco
            </h3>
            <p className="text-xs text-slate-500 mb-4">Parlamentares federais</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={distribuicaoRisco}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="valor"
                >
                  {distribuicaoRisco.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border p-2 text-xs" style={{ background: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)' }}>
                          <div className="text-white font-semibold">{payload[0].name}</div>
                          <div className="text-slate-400">{payload[0].value} parlamentares</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {distribuicaoRisco.map((item) => (
                <div key={item.nivel} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.cor }} />
                    <span className="text-slate-400 text-[11px]">{item.nivel.split(' ')[0]}</span>
                  </div>
                  <span className="font-mono font-bold" style={{ color: item.cor }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top parlamentares por risco */}
          <div
            className="gradient-border rounded-xl p-5"
            style={{ background: 'var(--card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Maiores Scores de Risco
              </h3>
              <Link href="/parlamentares">
                <span className="text-xs text-cyan-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1">
                  Ver todos <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {topRisco.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-600 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium truncate" style={{ fontFamily: 'DM Sans' }}>
                        {p.nome}
                      </span>
                      <RiskBadge score={p.scoreRisco} nivel={p.nivelRisco} compact />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${p.scoreRisco}%`,
                            backgroundColor: getRiskColor(p.nivelRisco),
                            boxShadow: `0 0 6px ${getRiskColor(p.nivelRisco)}60`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono w-8 text-right">{p.scoreRisco}%</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {p.partido} · {p.estado} · {p.cargo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de alerta */}
          <div
            className="gradient-border rounded-xl p-5"
            style={{ background: 'var(--card)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
              Tipos de Alerta Detectados
            </h3>
            <p className="text-xs text-slate-500 mb-4">Distribuição por categoria</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tiposAlerta} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'Fira Code' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="tipo"
                  width={150}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantidade" name="Quantidade" radius={[0, 4, 4, 0]}>
                  {tiposAlerta.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={`hsl(${200 - index * 25}, 70%, 55%)`}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-lg border p-4 text-xs text-slate-500 leading-relaxed"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="font-semibold text-slate-400">Nota metodológica:</span> Os scores de risco apresentados são calculados por algoritmos estatísticos baseados em padrões de dados públicos e não constituem acusação, imputação de responsabilidade ou afirmação de irregularidade. Os dados são provenientes de fontes governamentais abertas e têm finalidade exclusivamente analítica e de controle social. Para investigações formais, consulte os órgãos competentes.
        </div>
      </div>
    </Layout>
  );
}
