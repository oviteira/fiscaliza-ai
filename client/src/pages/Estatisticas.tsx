/**
 * Página de Estatísticas e Análises
 * 
 * Dashboard com gráficos de tendências, distribuições e evolução temporal
 */

import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, AlertTriangle, FileText } from 'lucide-react';

// Dados mock para gráficos
const dadosTendenciaRisco = [
  { data: '01/03', scoreRisco: 45, parlamentares: 150 },
  { data: '02/03', scoreRisco: 48, parlamentares: 155 },
  { data: '03/03', scoreRisco: 52, parlamentares: 160 },
  { data: '04/03', scoreRisco: 50, parlamentares: 165 },
  { data: '05/03', scoreRisco: 55, parlamentares: 170 },
  { data: '06/03', scoreRisco: 58, parlamentares: 175 },
  { data: '07/03', scoreRisco: 62, parlamentares: 180 },
  { data: '08/03', scoreRisco: 60, parlamentares: 185 },
  { data: '09/03', scoreRisco: 65, parlamentares: 190 },
  { data: '10/03', scoreRisco: 68, parlamentares: 195 },
];

const distribuicaoNivelRisco = [
  { name: 'Baixo', value: 45, fill: '#34D399' },
  { name: 'Médio', value: 30, fill: '#F59E0B' },
  { name: 'Alto', value: 20, fill: '#FBBF24' },
  { name: 'Crítico', value: 5, fill: '#F43F5E' },
];

const tiposAlertaMaisComuns = [
  { tipo: 'Sobrepreço', quantidade: 245, percentual: 28 },
  { tipo: 'Vínculo Familiar', quantidade: 189, percentual: 22 },
  { tipo: 'Concentração', quantidade: 156, percentual: 18 },
  { tipo: 'Desvio Geográfico', quantidade: 134, percentual: 15 },
  { tipo: 'Funcionário Fantasma', quantidade: 89, percentual: 10 },
  { tipo: 'Outro', quantidade: 45, percentual: 7 },
];

const parlamentaresAltoRisco = [
  { nome: 'João Silva', partido: 'PT', estado: 'SP', scoreRisco: 92 },
  { nome: 'Maria Santos', partido: 'PSDB', estado: 'MG', scoreRisco: 88 },
  { nome: 'Pedro Oliveira', partido: 'PL', estado: 'RJ', scoreRisco: 85 },
  { nome: 'Ana Costa', partido: 'MDB', estado: 'BA', scoreRisco: 82 },
  { nome: 'Carlos Mendes', partido: 'PP', estado: 'SP', scoreRisco: 79 },
];

const evolucaoContratos = [
  { mes: 'Jan', contratos: 120, valor: 45000000 },
  { mes: 'Fev', contratos: 135, valor: 52000000 },
  { mes: 'Mar', contratos: 128, valor: 48000000 },
  { mes: 'Abr', contratos: 145, valor: 58000000 },
  { mes: 'Mai', contratos: 152, valor: 62000000 },
  { mes: 'Jun', contratos: 148, valor: 60000000 },
];

export default function Estatisticas() {
  const estatisticas = useMemo(() => ({
    totalParlamentares: 513,
    parlamentaresAltoRisco: 98,
    totalContratos: 8450,
    contratosAltoRisco: 1205,
    totalAlertas: 813,
    alertasNovos: 45,
    scoreRiscoMedio: 58,
    tendencia: '+5%',
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Estatísticas e Análises</h1>
          <p className="text-slate-400">Dashboard de tendências, riscos e evolução temporal</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Parlamentares Monitorados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{estatisticas.totalParlamentares}</div>
              <p className="text-sm text-red-400 mt-1">{estatisticas.parlamentaresAltoRisco} com risco alto</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contratos Analisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{estatisticas.totalContratos}</div>
              <p className="text-sm text-yellow-400 mt-1">{estatisticas.contratosAltoRisco} com risco elevado</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alertas Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{estatisticas.totalAlertas}</div>
              <p className="text-sm text-cyan-400 mt-1">{estatisticas.alertasNovos} novos hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Score Médio de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{estatisticas.scoreRiscoMedio}%</div>
              <p className="text-sm text-orange-400 mt-1">{estatisticas.tendencia} vs. mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tendência de Risco */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Tendência de Risco (Últimos 10 dias)</CardTitle>
              <CardDescription>Score médio de risco ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosTendenciaRisco}>
                  <defs>
                    <linearGradient id="colorRisco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="data" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scoreRisco"
                    stroke="#06B6D4"
                    fillOpacity={1}
                    fill="url(#colorRisco)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Nível de Risco */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Nível de Risco</CardTitle>
              <CardDescription>Parlamentares por classificação de risco</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoNivelRisco}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribuicaoNivelRisco.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#E2E8F0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tipos de Alerta Mais Comuns */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Tipos de Alerta Mais Comuns</CardTitle>
            <CardDescription>Distribuição de alertas por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tiposAlertaMaisComuns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="tipo" stroke="#94A3B8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="quantidade" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Evolução de Contratos */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Contratos (Últimos 6 meses)</CardTitle>
            <CardDescription>Quantidade e valor total de contratos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoContratos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#E2E8F0' }}
                />
                <Legend wrapperStyle={{ color: '#E2E8F0' }} />
                <Line
                  type="monotone"
                  dataKey="contratos"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ fill: '#06B6D4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Parlamentares com Maior Risco */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Parlamentares com Maior Risco</CardTitle>
            <CardDescription>Top 5 parlamentares com scores mais altos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parlamentaresAltoRisco.map((parlamentar, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{parlamentar.nome}</p>
                    <p className="text-sm text-slate-400">{parlamentar.partido} - {parlamentar.estado}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">{parlamentar.scoreRisco}%</p>
                    <p className="text-xs text-slate-400">Risco Crítico</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
