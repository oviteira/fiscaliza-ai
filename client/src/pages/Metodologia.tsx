// ============================================================
// Metodologia — Como a IA analisa e gera scores de risco
// ============================================================

import { Layout } from '@/components/Layout';
import { RiskScore } from '@/components/RiskScore';
import { Shield, Brain, Database, Network, BarChart3, FileText, Github, ExternalLink } from 'lucide-react';

const etapas = [
  {
    numero: '01',
    titulo: 'Coleta e Ingestão de Dados',
    descricao: 'A plataforma realiza coleta automatizada de dados de 34+ bases abertas governamentais, incluindo TSE, Portal da Transparência, SIAFI, SIAPE, Receita Federal e portais estaduais. Os dados são normalizados, deduplicados e armazenados em um banco de grafos estruturado.',
    icon: Database,
    color: '#06B6D4',
  },
  {
    numero: '02',
    titulo: 'Construção do Grafo de Conhecimento',
    descricao: 'As entidades identificadas (parlamentares, empresas, familiares, contratos, órgãos) são conectadas em um grafo de conhecimento. Cada aresta representa um relacionamento verificável: vínculo societário, contrato, emenda, doação eleitoral ou parentesco.',
    icon: Network,
    color: '#A78BFA',
  },
  {
    numero: '03',
    titulo: 'Análise Estatística e Detecção de Padrões',
    descricao: 'Algoritmos de análise estatística comparam os padrões de cada agente público com a mediana do grupo de referência. Desvios significativos — como concentração de fornecedores, variação patrimonial atípica ou sobrepreço em contratos — geram alertas ponderados.',
    icon: BarChart3,
    color: '#FBBF24',
  },
  {
    numero: '04',
    titulo: 'Cálculo do Score de Risco',
    descricao: 'O score de risco (0–100%) é calculado pela soma ponderada de múltiplos indicadores, normalizados pela frequência histórica de cada padrão. Cada tipo de alerta contribui com um peso proporcional à sua relevância estatística e ao valor financeiro envolvido.',
    icon: Brain,
    color: '#F59E0B',
  },
  {
    numero: '05',
    titulo: 'Geração de Relatórios',
    descricao: 'Os resultados são organizados em relatórios estruturados com evidências verificáveis, fontes primárias citadas e metodologia transparente. Todos os dados são rastreáveis até a fonte original para permitir verificação independente.',
    icon: FileText,
    color: '#34D399',
  },
];

const indicadores = [
  { nome: 'Concentração de Fornecedor', peso: 25, descricao: 'Percentual de contratos/emendas direcionados a um único fornecedor ou grupo' },
  { nome: 'Variação Patrimonial', peso: 20, descricao: 'Desvio da variação patrimonial declarada em relação à mediana do grupo' },
  { nome: 'Vínculo Familiar em Contratos', peso: 22, descricao: 'Presença de familiares como sócios de empresas contratadas' },
  { nome: 'Sobrepreço em Contratos', peso: 18, descricao: 'Desvio do valor contratado em relação ao referencial SINAPI/IPCA' },
  { nome: 'Padrão de Emendas', peso: 10, descricao: 'Análise geográfica e temporal do direcionamento de emendas parlamentares' },
  { nome: 'Inconsistência em RH', peso: 5, descricao: 'Detecção de servidores comissionados com dados cadastrais inconsistentes' },
];

export default function Metodologia() {
  return (
    <Layout
      title="Metodologia"
      subtitle="Como a inteligência artificial analisa dados e calcula scores de risco"
      breadcrumb={['TransparênciaIA', 'Metodologia']}
    >
      <div className="p-6 space-y-8">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div
              className="gradient-border rounded-xl p-6"
              style={{ background: 'var(--card)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.15)' }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#06B6D4' }} />
                </div>
                <div>
                  <h2
                    className="text-base font-bold text-white"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    Princípios Fundamentais
                  </h2>
                  <p className="text-xs text-slate-500">Base metodológica da plataforma</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
                <p>
                  A TransparênciaIA opera exclusivamente com <strong className="text-white">dados públicos e abertos</strong>,
                  disponibilizados pelos próprios órgãos governamentais. Nenhum dado privado ou sigiloso é
                  acessado ou processado.
                </p>
                <p>
                  Os <strong className="text-white">scores de risco</strong> são indicadores estatísticos que medem o
                  desvio de padrões observados em relação à mediana do grupo de referência. Um score elevado
                  indica que o padrão de comportamento financeiro se afasta significativamente da norma,
                  justificando atenção analítica adicional.
                </p>
                <p>
                  <strong className="text-white">Importante:</strong> Os scores não constituem acusação,
                  imputação de responsabilidade ou afirmação de irregularidade. São ferramentas analíticas
                  para orientar investigações jornalísticas, auditorias e controle social.
                </p>
              </div>
            </div>
          </div>

          {/* Score examples */}
          <div
            className="gradient-border rounded-xl p-6"
            style={{ background: 'var(--card)' }}
          >
            <h3
              className="text-sm font-semibold text-white mb-4"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Interpretação dos Scores
            </h3>
            <div className="space-y-4">
              {[
                { score: 91, nivel: 'critico' as const, descricao: 'Múltiplos indicadores com desvio severo' },
                { score: 72, nivel: 'alto' as const, descricao: 'Desvio significativo em indicadores relevantes' },
                { score: 48, nivel: 'medio' as const, descricao: 'Desvio moderado, requer monitoramento' },
                { score: 22, nivel: 'baixo' as const, descricao: 'Padrão dentro da normalidade estatística' },
              ].map((item) => (
                <div key={item.score} className="flex items-center gap-3">
                  <RiskScore score={item.score} nivel={item.nivel} size="sm" showLabel={false} animated={false} />
                  <p className="text-xs text-slate-400 leading-relaxed">{item.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <h2
            className="text-base font-bold text-white mb-4"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Pipeline de Análise
          </h2>
          <div className="space-y-3">
            {etapas.map((etapa, i) => {
              const Icon = etapa.icon;
              return (
                <div
                  key={etapa.numero}
                  className="gradient-border rounded-xl p-5 flex items-start gap-5"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${etapa.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: etapa.color }} />
                    </div>
                    {i < etapas.length - 1 && (
                      <div className="w-px h-6 bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: etapa.color }}
                      >
                        {etapa.numero}
                      </span>
                      <h3
                        className="text-sm font-semibold text-white"
                        style={{ fontFamily: 'Sora, sans-serif' }}
                      >
                        {etapa.titulo}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{etapa.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators */}
        <div>
          <h2
            className="text-base font-bold text-white mb-4"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            Composição do Score de Risco
          </h2>
          <div
            className="gradient-border rounded-xl overflow-hidden"
            style={{ background: 'var(--card)' }}
          >
            <table className="w-full data-table">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-5 py-3">Indicador</th>
                  <th className="text-left px-5 py-3">Descrição</th>
                  <th className="text-right px-5 py-3">Peso no Score</th>
                  <th className="px-5 py-3">Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {indicadores.map((ind) => (
                  <tr
                    key={ind.nome}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{ind.nome}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-slate-500 max-w-xs">{ind.descricao}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-mono font-bold text-cyan-400">{ind.peso}%</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-32 h-1.5 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${ind.peso * 4}%`,
                            background: 'linear-gradient(90deg, #06B6D4, #0284C7)',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open source */}
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: 'rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.04)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)' }}
            >
              <Github className="w-6 h-6" style={{ color: '#06B6D4' }} />
            </div>
            <div>
              <h3
                className="text-base font-bold text-white mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                Código Aberto e Auditável
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                Todo o código-fonte da plataforma, incluindo os algoritmos de análise, modelos estatísticos
                e pipelines de dados, está disponível publicamente no GitHub sob licença MIT. Isso garante
                que a metodologia possa ser auditada, criticada e melhorada pela comunidade.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Desenvolvido por <strong className="text-white">Vitor Lucas Silva Santos</strong>.
                Contribuições são bem-vindas — especialmente de jornalistas, cientistas de dados,
                advogados e especialistas em políticas públicas.
              </p>
              <a
                href="https://github.com/oviteira/transparencia-publica-ia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: '#06B6D4' }}
              >
                <Github className="w-4 h-4" />
                github.com/oviteira/transparencia-publica-ia
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
