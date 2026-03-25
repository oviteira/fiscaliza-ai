// ============================================================
// TransparênciaIA — Mock Data
// Dados simulados para demonstração da plataforma
// Em produção, estes dados viriam de APIs de dados abertos:
// TSE, Portal da Transparência, IBGE, Banco Central, etc.
// ============================================================

export interface Parlamentar {
  id: string;
  nome: string;
  partido: string;
  estado: string;
  cargo: string;
  mandato: string;
  scoreRisco: number;
  nivelRisco: 'critico' | 'alto' | 'medio' | 'baixo';
  totalContratos: number;
  valorContratos: number;
  totalEmendas: number;
  valorEmendas: number;
  empresasVinculadas: number;
  alertas: Alerta[];
  fontesDados: string[];
}

export interface Alerta {
  id: string;
  tipo: 'contrato_familiar' | 'emenda_direcionada' | 'variacao_patrimonial' | 'funcionario_fantasma' | 'sobrepreco' | 'concentracao_fornecedor';
  descricao: string;
  valorEnvolvido: number;
  dataDeteccao: string;
  scoreContribuicao: number;
  fontes: string[];
}

export interface Empresa {
  id: string;
  cnpj: string;
  nome: string;
  ramo: string;
  totalContratos: number;
  valorTotal: number;
  scoreRisco: number;
  nivelRisco: 'critico' | 'alto' | 'medio' | 'baixo';
  socios: string[];
  vinculosParlamentares: string[];
}

export interface Contrato {
  id: string;
  numero: string;
  objeto: string;
  valor: number;
  dataAssinatura: string;
  dataVencimento: string;
  orgao: string;
  fornecedor: string;
  cnpjFornecedor: string;
  parlamentarVinculado?: string;
  scoreRisco: number;
  nivelRisco: 'critico' | 'alto' | 'medio' | 'baixo';
  alertas: string[];
  fonte: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'parlamentar' | 'empresa' | 'orgao' | 'familiar' | 'contrato';
  scoreRisco: number;
  nivelRisco: 'critico' | 'alto' | 'medio' | 'baixo';
  valor?: number;
  partido?: string;
  estado?: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'contrato' | 'emenda' | 'familiar' | 'socio' | 'doacao';
  valor?: number;
  descricao: string;
}

export interface EstatisticaGeral {
  totalParlamentares: number;
  totalContratos: number;
  totalValorAnalisado: number;
  totalAlertas: number;
  parlamentaresAltoRisco: number;
  contratosAltoRisco: number;
  fontesIntegradas: number;
  ultimaAtualizacao: string;
}

// ---- Dados Mock ----

export const estatisticasGerais: EstatisticaGeral = {
  totalParlamentares: 594,
  totalContratos: 128_743,
  totalValorAnalisado: 48_900_000_000,
  totalAlertas: 3_847,
  parlamentaresAltoRisco: 87,
  contratosAltoRisco: 2_341,
  fontesIntegradas: 34,
  ultimaAtualizacao: '2026-03-24T18:30:00Z',
};

export const parlamentares: Parlamentar[] = [
  {
    id: 'p001',
    nome: 'Carlos Eduardo Mendonça',
    partido: 'PSD',
    estado: 'SP',
    cargo: 'Deputado Federal',
    mandato: '2023–2027',
    scoreRisco: 87,
    nivelRisco: 'critico',
    totalContratos: 23,
    valorContratos: 14_800_000,
    totalEmendas: 45,
    valorEmendas: 32_000_000,
    empresasVinculadas: 7,
    alertas: [
      {
        id: 'a001',
        tipo: 'contrato_familiar',
        descricao: 'Empresa de cônjuge recebeu R$ 4,2M em contratos com municípios beneficiados por emendas',
        valorEnvolvido: 4_200_000,
        dataDeteccao: '2026-03-10',
        scoreContribuicao: 28,
        fontes: ['Portal da Transparência', 'TSE', 'Junta Comercial SP'],
      },
      {
        id: 'a002',
        tipo: 'emenda_direcionada',
        descricao: 'Padrão estatístico indica direcionamento de 89% das emendas para único fornecedor',
        valorEnvolvido: 18_500_000,
        dataDeteccao: '2026-03-15',
        scoreContribuicao: 35,
        fontes: ['SIAFI', 'Portal da Transparência'],
      },
      {
        id: 'a003',
        tipo: 'variacao_patrimonial',
        descricao: 'Variação patrimonial de 340% no período 2020–2024 acima da mediana do grupo',
        valorEnvolvido: 2_800_000,
        dataDeteccao: '2026-02-28',
        scoreContribuicao: 24,
        fontes: ['TSE — Declaração de Bens'],
      },
    ],
    fontesDados: ['TSE', 'Portal da Transparência Federal', 'SIAFI', 'Junta Comercial SP'],
  },
  {
    id: 'p002',
    nome: 'Ana Paula Rodrigues',
    partido: 'PT',
    estado: 'MG',
    cargo: 'Senadora',
    mandato: '2023–2031',
    scoreRisco: 72,
    nivelRisco: 'alto',
    totalContratos: 18,
    valorContratos: 9_200_000,
    totalEmendas: 38,
    valorEmendas: 24_000_000,
    empresasVinculadas: 4,
    alertas: [
      {
        id: 'a004',
        tipo: 'concentracao_fornecedor',
        descricao: 'Concentração de 76% das emendas em apenas 2 fornecedores nos últimos 3 anos',
        valorEnvolvido: 18_240_000,
        dataDeteccao: '2026-03-08',
        scoreContribuicao: 32,
        fontes: ['SIAFI', 'Portal da Transparência'],
      },
      {
        id: 'a005',
        tipo: 'sobrepreco',
        descricao: 'Preços 43% acima da mediana de mercado em contratos de obras públicas',
        valorEnvolvido: 3_900_000,
        dataDeteccao: '2026-03-12',
        scoreContribuicao: 40,
        fontes: ['SINAPI', 'Portal da Transparência MG'],
      },
    ],
    fontesDados: ['TSE', 'Portal da Transparência MG', 'SIAFI', 'TCU'],
  },
  {
    id: 'p003',
    nome: 'Roberto Figueiredo Lima',
    partido: 'União Brasil',
    estado: 'BA',
    cargo: 'Deputado Federal',
    mandato: '2023–2027',
    scoreRisco: 91,
    nivelRisco: 'critico',
    totalContratos: 31,
    valorContratos: 22_400_000,
    totalEmendas: 67,
    valorEmendas: 48_000_000,
    empresasVinculadas: 12,
    alertas: [
      {
        id: 'a006',
        tipo: 'funcionario_fantasma',
        descricao: 'Análise de folha de pagamento aponta 14 servidores comissionados com endereço inválido',
        valorEnvolvido: 840_000,
        dataDeteccao: '2026-03-18',
        scoreContribuicao: 45,
        fontes: ['SIAPE', 'Receita Federal', 'Correios'],
      },
      {
        id: 'a007',
        tipo: 'contrato_familiar',
        descricao: 'Irmão é sócio de empresa com R$ 8,7M em contratos com prefeituras beneficiadas',
        valorEnvolvido: 8_700_000,
        dataDeteccao: '2026-03-05',
        scoreContribuicao: 38,
        fontes: ['Junta Comercial BA', 'Portal da Transparência', 'TSE'],
      },
      {
        id: 'a008',
        tipo: 'emenda_direcionada',
        descricao: 'Emendas destinadas exclusivamente a municípios onde candidatos aliados venceram',
        valorEnvolvido: 32_000_000,
        dataDeteccao: '2026-02-20',
        scoreContribuicao: 8,
        fontes: ['TSE', 'SIAFI', 'IBGE'],
      },
    ],
    fontesDados: ['TSE', 'Portal da Transparência BA', 'SIAFI', 'SIAPE', 'Receita Federal'],
  },
  {
    id: 'p004',
    nome: 'Mariana Costa Silveira',
    partido: 'PSDB',
    estado: 'RS',
    cargo: 'Deputada Federal',
    mandato: '2023–2027',
    scoreRisco: 31,
    nivelRisco: 'baixo',
    totalContratos: 8,
    valorContratos: 2_100_000,
    totalEmendas: 22,
    valorEmendas: 12_000_000,
    empresasVinculadas: 1,
    alertas: [],
    fontesDados: ['TSE', 'Portal da Transparência RS', 'SIAFI'],
  },
  {
    id: 'p005',
    nome: 'José Antônio Pereira',
    partido: 'MDB',
    estado: 'GO',
    cargo: 'Senador',
    mandato: '2019–2027',
    scoreRisco: 58,
    nivelRisco: 'medio',
    totalContratos: 14,
    valorContratos: 6_800_000,
    totalEmendas: 29,
    valorEmendas: 18_000_000,
    empresasVinculadas: 3,
    alertas: [
      {
        id: 'a009',
        tipo: 'variacao_patrimonial',
        descricao: 'Aquisição de imóveis no valor de R$ 3,2M sem correspondência com renda declarada',
        valorEnvolvido: 3_200_000,
        dataDeteccao: '2026-03-01',
        scoreContribuicao: 58,
        fontes: ['TSE — Declaração de Bens', 'Receita Federal', 'Cartório de Imóveis GO'],
      },
    ],
    fontesDados: ['TSE', 'Portal da Transparência GO', 'Receita Federal'],
  },
  {
    id: 'p006',
    nome: 'Fernanda Alves Monteiro',
    partido: 'Republicanos',
    estado: 'RJ',
    cargo: 'Deputada Federal',
    mandato: '2023–2027',
    scoreRisco: 44,
    nivelRisco: 'medio',
    totalContratos: 11,
    valorContratos: 4_300_000,
    totalEmendas: 19,
    valorEmendas: 9_500_000,
    empresasVinculadas: 2,
    alertas: [
      {
        id: 'a010',
        tipo: 'sobrepreco',
        descricao: 'Contrato de consultoria 67% acima do valor de referência IPCA-corrigido',
        valorEnvolvido: 780_000,
        dataDeteccao: '2026-03-14',
        scoreContribuicao: 44,
        fontes: ['Portal da Transparência RJ', 'TCE-RJ'],
      },
    ],
    fontesDados: ['TSE', 'Portal da Transparência RJ', 'TCE-RJ'],
  },
];

export const contratos: Contrato[] = [
  {
    id: 'c001',
    numero: '2024/SP-0847',
    objeto: 'Serviços de consultoria em tecnologia da informação',
    valor: 4_200_000,
    dataAssinatura: '2024-03-15',
    dataVencimento: '2025-03-14',
    orgao: 'Prefeitura de Campinas — SP',
    fornecedor: 'TechSol Consultoria Ltda.',
    cnpjFornecedor: '23.456.789/0001-01',
    parlamentarVinculado: 'p001',
    scoreRisco: 89,
    nivelRisco: 'critico',
    alertas: ['Sócio é cônjuge do parlamentar', 'Valor 56% acima da mediana de mercado'],
    fonte: 'Portal da Transparência SP',
  },
  {
    id: 'c002',
    numero: '2024/BA-1203',
    objeto: 'Construção de unidade básica de saúde',
    valor: 3_800_000,
    dataAssinatura: '2024-06-10',
    dataVencimento: '2025-12-09',
    orgao: 'Prefeitura de Feira de Santana — BA',
    fornecedor: 'Construtora Nordeste S.A.',
    cnpjFornecedor: '34.567.890/0001-02',
    parlamentarVinculado: 'p003',
    scoreRisco: 76,
    nivelRisco: 'alto',
    alertas: ['Irmão do parlamentar é sócio', 'Preço 38% acima do SINAPI'],
    fonte: 'Portal da Transparência BA',
  },
  {
    id: 'c003',
    numero: '2025/MG-0234',
    objeto: 'Aquisição de equipamentos hospitalares',
    valor: 2_900_000,
    dataAssinatura: '2025-01-20',
    dataVencimento: '2025-07-19',
    orgao: 'Secretaria de Saúde de Minas Gerais',
    fornecedor: 'MedEquip Distribuidora Ltda.',
    cnpjFornecedor: '45.678.901/0001-03',
    parlamentarVinculado: 'p002',
    scoreRisco: 68,
    nivelRisco: 'alto',
    alertas: ['Único fornecedor habilitado no processo licitatório', 'Preços 43% acima da mediana'],
    fonte: 'Portal da Transparência MG',
  },
  {
    id: 'c004',
    numero: '2024/GO-0567',
    objeto: 'Pavimentação de rodovias municipais',
    valor: 6_100_000,
    dataAssinatura: '2024-09-05',
    dataVencimento: '2026-03-04',
    orgao: 'Departamento de Estradas de Rodagem — GO',
    fornecedor: 'Pavimenta Centro-Oeste Ltda.',
    cnpjFornecedor: '56.789.012/0001-04',
    parlamentarVinculado: 'p005',
    scoreRisco: 52,
    nivelRisco: 'medio',
    alertas: ['Variação de preço acima do IPCA no aditivo contratual'],
    fonte: 'Portal da Transparência GO',
  },
  {
    id: 'c005',
    numero: '2025/RS-0089',
    objeto: 'Serviços de manutenção predial',
    valor: 890_000,
    dataAssinatura: '2025-02-14',
    dataVencimento: '2026-02-13',
    orgao: 'Assembleia Legislativa do RS',
    fornecedor: 'Manutenção Sul Ltda.',
    cnpjFornecedor: '67.890.123/0001-05',
    parlamentarVinculado: 'p004',
    scoreRisco: 18,
    nivelRisco: 'baixo',
    alertas: [],
    fonte: 'Portal da Transparência RS',
  },
  {
    id: 'c006',
    numero: '2024/RJ-1456',
    objeto: 'Consultoria em gestão pública',
    valor: 780_000,
    dataAssinatura: '2024-11-30',
    dataVencimento: '2025-11-29',
    orgao: 'Secretaria de Administração — RJ',
    fornecedor: 'Gestão Eficiente Consultores S.S.',
    cnpjFornecedor: '78.901.234/0001-06',
    parlamentarVinculado: 'p006',
    scoreRisco: 44,
    nivelRisco: 'medio',
    alertas: ['Valor 67% acima do referencial de mercado'],
    fonte: 'Portal da Transparência RJ',
  },
];

export const graphData = {
  nodes: [
    { id: 'p001', label: 'Carlos Mendonça', type: 'parlamentar' as const, scoreRisco: 87, nivelRisco: 'critico' as const, partido: 'PSD', estado: 'SP' },
    { id: 'p002', label: 'Ana Paula Rodrigues', type: 'parlamentar' as const, scoreRisco: 72, nivelRisco: 'alto' as const, partido: 'PT', estado: 'MG' },
    { id: 'p003', label: 'Roberto Figueiredo', type: 'parlamentar' as const, scoreRisco: 91, nivelRisco: 'critico' as const, partido: 'União Brasil', estado: 'BA' },
    { id: 'p004', label: 'Mariana Silveira', type: 'parlamentar' as const, scoreRisco: 31, nivelRisco: 'baixo' as const, partido: 'PSDB', estado: 'RS' },
    { id: 'p005', label: 'José Pereira', type: 'parlamentar' as const, scoreRisco: 58, nivelRisco: 'medio' as const, partido: 'MDB', estado: 'GO' },
    { id: 'e001', label: 'TechSol Consultoria', type: 'empresa' as const, scoreRisco: 89, nivelRisco: 'critico' as const, valor: 4_200_000 },
    { id: 'e002', label: 'Construtora Nordeste', type: 'empresa' as const, scoreRisco: 76, nivelRisco: 'alto' as const, valor: 3_800_000 },
    { id: 'e003', label: 'MedEquip Distribuidora', type: 'empresa' as const, scoreRisco: 68, nivelRisco: 'alto' as const, valor: 2_900_000 },
    { id: 'e004', label: 'Pavimenta Centro-Oeste', type: 'empresa' as const, scoreRisco: 52, nivelRisco: 'medio' as const, valor: 6_100_000 },
    { id: 'f001', label: 'Cônjuge — Mendonça', type: 'familiar' as const, scoreRisco: 75, nivelRisco: 'alto' as const },
    { id: 'f002', label: 'Irmão — Figueiredo', type: 'familiar' as const, scoreRisco: 80, nivelRisco: 'critico' as const },
    { id: 'o001', label: 'Prefeitura Campinas', type: 'orgao' as const, scoreRisco: 45, nivelRisco: 'medio' as const },
    { id: 'o002', label: 'Pref. Feira de Santana', type: 'orgao' as const, scoreRisco: 60, nivelRisco: 'medio' as const },
    { id: 'o003', label: 'Sec. Saúde MG', type: 'orgao' as const, scoreRisco: 55, nivelRisco: 'medio' as const },
  ] as GraphNode[],
  links: [
    { source: 'p001', target: 'f001', type: 'familiar' as const, descricao: 'Cônjuge', valor: 0 },
    { source: 'f001', target: 'e001', type: 'socio' as const, descricao: 'Sócia majoritária', valor: 0 },
    { source: 'e001', target: 'o001', type: 'contrato' as const, descricao: 'Contrato R$ 4,2M', valor: 4_200_000 },
    { source: 'p001', target: 'o001', type: 'emenda' as const, descricao: 'Emenda R$ 8,5M', valor: 8_500_000 },
    { source: 'p003', target: 'f002', type: 'familiar' as const, descricao: 'Irmão', valor: 0 },
    { source: 'f002', target: 'e002', type: 'socio' as const, descricao: 'Sócio fundador', valor: 0 },
    { source: 'e002', target: 'o002', type: 'contrato' as const, descricao: 'Contrato R$ 3,8M', valor: 3_800_000 },
    { source: 'p003', target: 'o002', type: 'emenda' as const, descricao: 'Emenda R$ 6,2M', valor: 6_200_000 },
    { source: 'p002', target: 'e003', type: 'emenda' as const, descricao: 'Emenda R$ 2,9M', valor: 2_900_000 },
    { source: 'e003', target: 'o003', type: 'contrato' as const, descricao: 'Contrato R$ 2,9M', valor: 2_900_000 },
    { source: 'p005', target: 'e004', type: 'emenda' as const, descricao: 'Emenda R$ 6,1M', valor: 6_100_000 },
    { source: 'p001', target: 'p003', type: 'doacao' as const, descricao: 'Doação eleitoral R$ 150K', valor: 150_000 },
  ] as GraphLink[],
};

export const fontesIntegradas = [
  { nome: 'TSE — Tribunal Superior Eleitoral', tipo: 'Eleitoral', registros: '2.4M', status: 'ativo', ultimaSync: '2026-03-24' },
  { nome: 'Portal da Transparência Federal', tipo: 'Contratos', registros: '128K', status: 'ativo', ultimaSync: '2026-03-24' },
  { nome: 'SIAFI — Sistema de Administração Financeira', tipo: 'Financeiro', registros: '890K', status: 'ativo', ultimaSync: '2026-03-23' },
  { nome: 'SIAPE — Servidores Públicos', tipo: 'RH', registros: '1.2M', status: 'ativo', ultimaSync: '2026-03-22' },
  { nome: 'Banco Central — Open Finance', tipo: 'Financeiro', registros: '340K', status: 'ativo', ultimaSync: '2026-03-24' },
  { nome: 'Receita Federal — CNPJ', tipo: 'Empresarial', registros: '56M', status: 'ativo', ultimaSync: '2026-03-20' },
  { nome: 'IBGE — Dados Municipais', tipo: 'Geográfico', registros: '5.5K', status: 'ativo', ultimaSync: '2026-03-15' },
  { nome: 'TCU — Tribunal de Contas da União', tipo: 'Auditoria', registros: '78K', status: 'ativo', ultimaSync: '2026-03-18' },
  { nome: 'Portais Estaduais de Transparência (27)', tipo: 'Contratos', registros: '2.1M', status: 'ativo', ultimaSync: '2026-03-24' },
  { nome: 'Juntas Comerciais Estaduais', tipo: 'Empresarial', registros: '4.8M', status: 'ativo', ultimaSync: '2026-03-19' },
  { nome: 'SINAPI — Preços de Referência', tipo: 'Preços', registros: '12K', status: 'ativo', ultimaSync: '2026-03-01' },
  { nome: 'Diário Oficial da União', tipo: 'Normativo', registros: '890K', status: 'ativo', ultimaSync: '2026-03-24' },
];

export const timelineAlertas = [
  { mes: 'Out/25', critico: 12, alto: 28, medio: 45, baixo: 89 },
  { mes: 'Nov/25', critico: 15, alto: 32, medio: 51, baixo: 94 },
  { mes: 'Dez/25', critico: 9, alto: 25, medio: 38, baixo: 78 },
  { mes: 'Jan/26', critico: 18, alto: 41, medio: 63, baixo: 102 },
  { mes: 'Fev/26', critico: 22, alto: 48, medio: 71, baixo: 115 },
  { mes: 'Mar/26', critico: 31, alto: 56, medio: 84, baixo: 128 },
];

export const distribuicaoRisco = [
  { nivel: 'Crítico (81–100)', valor: 87, cor: '#F43F5E' },
  { nivel: 'Alto (61–80)', valor: 156, cor: '#F59E0B' },
  { nivel: 'Médio (41–60)', valor: 231, cor: '#FBBF24' },
  { nivel: 'Baixo (0–40)', valor: 120, cor: '#34D399' },
];

export const tiposAlerta = [
  { tipo: 'Concentração de Fornecedor', quantidade: 1247, percentual: 32 },
  { tipo: 'Variação Patrimonial', quantidade: 892, percentual: 23 },
  { tipo: 'Contrato com Familiares', quantidade: 678, percentual: 18 },
  { tipo: 'Sobrepreço em Contratos', quantidade: 543, percentual: 14 },
  { tipo: 'Emenda Direcionada', quantidade: 312, percentual: 8 },
  { tipo: 'Funcionário Fantasma', quantidade: 175, percentual: 5 },
];

export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
};

export const getRiskColor = (nivel: string): string => {
  switch (nivel) {
    case 'critico': return '#F43F5E';
    case 'alto': return '#F59E0B';
    case 'medio': return '#FBBF24';
    case 'baixo': return '#34D399';
    default: return '#94A3B8';
  }
};

export const getRiskLabel = (nivel: string): string => {
  switch (nivel) {
    case 'critico': return 'Crítico';
    case 'alto': return 'Alto';
    case 'medio': return 'Médio';
    case 'baixo': return 'Baixo';
    default: return 'N/A';
  }
};

export const getAlertaTipoLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    contrato_familiar: 'Contrato c/ Familiar',
    emenda_direcionada: 'Emenda Direcionada',
    variacao_patrimonial: 'Variação Patrimonial',
    funcionario_fantasma: 'Func. Fantasma',
    sobrepreco: 'Sobrepreço',
    concentracao_fornecedor: 'Concentração Fornecedor',
  };
  return labels[tipo] || tipo;
};
