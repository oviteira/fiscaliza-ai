/**
 * Dashboard de Comparação de Períodos
 * 
 * Compara dados de um parlamentar/contrato em dois períodos diferentes
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface DadosComparacao {
  periodo1: {
    data: string;
    scoreRisco: number;
    alertas: number;
    contratos: number;
    emendas: number;
    indicadores: Record<string, number>;
  };
  periodo2: {
    data: string;
    scoreRisco: number;
    alertas: number;
    contratos: number;
    emendas: number;
    indicadores: Record<string, number>;
  };
  evolucao: {
    scoreRisco: number;
    alertas: number;
    contratos: number;
    emendas: number;
  };
}

export default function Comparacao() {
  const [tipoComparacao, setTipoComparacao] = useState<'parlamentar' | 'contrato'>('parlamentar');
  const [dataInicio1, setDataInicio1] = useState('2025-01-01');
  const [dataFim1, setDataFim1] = useState('2025-06-30');
  const [dataInicio2, setDataInicio2] = useState('2025-07-01');
  const [dataFim2, setDataFim2] = useState('2025-12-31');

  // Dados mock para demonstração
  const dadosComparacao: DadosComparacao = {
    periodo1: {
      data: `${dataInicio1} a ${dataFim1}`,
      scoreRisco: 62,
      alertas: 12,
      contratos: 8,
      emendas: 15,
      indicadores: {
        'Direcionamento de Emendas': 68,
        'Funcionários Fantasmas': 45,
        'Sobrepreço em Contratos': 72,
        'Conexões Suspeitas': 58,
        'Variação de Patrimônio': 52,
      },
    },
    periodo2: {
      data: `${dataInicio2} a ${dataFim2}`,
      scoreRisco: 78,
      alertas: 24,
      contratos: 12,
      emendas: 22,
      indicadores: {
        'Direcionamento de Emendas': 85,
        'Funcionários Fantasmas': 62,
        'Sobrepreço em Contratos': 88,
        'Conexões Suspeitas': 71,
        'Variação de Patrimônio': 69,
      },
    },
    evolucao: {
      scoreRisco: 16,
      alertas: 12,
      contratos: 4,
      emendas: 7,
    },
  };

  const calcularVariacao = (valor1: number, valor2: number): number => {
    return ((valor2 - valor1) / valor1) * 100;
  };

  const variacaoScore = calcularVariacao(dadosComparacao.periodo1.scoreRisco, dadosComparacao.periodo2.scoreRisco);
  const variacaoAlertas = calcularVariacao(dadosComparacao.periodo1.alertas, dadosComparacao.periodo2.alertas);
  const variacaoContratos = calcularVariacao(dadosComparacao.periodo1.contratos, dadosComparacao.periodo2.contratos);
  const variacaoEmendas = calcularVariacao(dadosComparacao.periodo1.emendas, dadosComparacao.periodo2.emendas);

  const indicadoresComparacao = Object.keys(dadosComparacao.periodo1.indicadores).map((indicador) => ({
    indicador,
    periodo1: dadosComparacao.periodo1.indicadores[indicador],
    periodo2: dadosComparacao.periodo2.indicadores[indicador],
  }));

  const CartaoComparacao = ({ label, valor1, valor2, variacao }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">{label} - Período 1</p>
            <p className="text-2xl font-bold text-slate-900">{valor1}</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">{label} - Período 2</p>
            <p className="text-2xl font-bold text-slate-900">{valor2}</p>
          </div>
          <div className={`flex items-center gap-2 p-2 rounded ${variacao > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            {variacao > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600" />
            )}
            <span className={variacao > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
              {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Comparação de Períodos</h1>
        <p className="text-slate-600 mt-2">
          Analise a evolução de scores de risco e indicadores entre dois períodos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Comparação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Comparação</label>
              <select
                value={tipoComparacao}
                onChange={(e) => setTipoComparacao(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="parlamentar">Parlamentar</option>
                <option value="contrato">Contrato</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">ID/Nome</label>
              <Input placeholder="Ex: João Silva ou #12345" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Período 1 - Início</label>
              <Input
                type="date"
                value={dataInicio1}
                onChange={(e) => setDataInicio1(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Período 1 - Fim</label>
              <Input
                type="date"
                value={dataFim1}
                onChange={(e) => setDataFim1(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Período 2 - Início</label>
              <Input
                type="date"
                value={dataInicio2}
                onChange={(e) => setDataInicio2(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Período 2 - Fim</label>
              <Input
                type="date"
                value={dataFim2}
                onChange={(e) => setDataFim2(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
            Comparar
          </Button>
        </CardContent>
      </Card>

      {/* Resumo de Comparação */}
      <div className="grid grid-cols-2 gap-4">
        <CartaoComparacao
          label="Score de Risco"
          valor1={dadosComparacao.periodo1.scoreRisco}
          valor2={dadosComparacao.periodo2.scoreRisco}
          variacao={variacaoScore}
        />
        <CartaoComparacao
          label="Alertas Detectados"
          valor1={dadosComparacao.periodo1.alertas}
          valor2={dadosComparacao.periodo2.alertas}
          variacao={variacaoAlertas}
        />
        <CartaoComparacao
          label="Contratos Analisados"
          valor1={dadosComparacao.periodo1.contratos}
          valor2={dadosComparacao.periodo2.contratos}
          variacao={variacaoContratos}
        />
        <CartaoComparacao
          label="Emendas Parlamentares"
          valor1={dadosComparacao.periodo1.emendas}
          valor2={dadosComparacao.periodo2.emendas}
          variacao={variacaoEmendas}
        />
      </div>

      {/* Gráfico de Indicadores */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Indicadores</CardTitle>
          <CardDescription>Comparação dos 5 principais indicadores de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={indicadoresComparacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="indicador" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="periodo1" fill="#06B6D4" name={`Período 1 (${dataInicio1})`} />
              <Bar dataKey="periodo2" fill="#F43F5E" name={`Período 2 (${dataInicio2})`} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Comparação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Indicador</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Período 1</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Período 2</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Variação</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {indicadoresComparacao.map((item) => {
                  const variacao = item.periodo2 - item.periodo1;
                  const percentual = ((variacao / item.periodo1) * 100).toFixed(1);

                  return (
                    <tr key={item.indicador} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{item.indicador}</td>
                      <td className="text-right py-3 px-4 text-slate-600">{item.periodo1}%</td>
                      <td className="text-right py-3 px-4 text-slate-600">{item.periodo2}%</td>
                      <td className="text-right py-3 px-4 font-semibold">
                        <span className={variacao > 0 ? 'text-red-600' : 'text-green-600'}>
                          {variacao > 0 ? '+' : ''}{variacao}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        {variacao > 0 ? (
                          <div className="flex items-center justify-end gap-1 text-red-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Piorou</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-green-600">
                            <TrendingDown className="w-4 h-4" />
                            <span>Melhorou</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Insights da Comparação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <p>
            • O score de risco aumentou <strong>{variacaoScore.toFixed(1)}%</strong> no segundo período, indicando piora significativa.
          </p>
          <p>
            • Foram detectados <strong>{dadosComparacao.evolucao.alertas} alertas adicionais</strong> no período 2.
          </p>
          <p>
            • O indicador de "Sobrepreço em Contratos" apresentou a maior variação positiva.
          </p>
          <p>
            • Recomenda-se investigação urgente dos contratos e emendas do segundo período.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
