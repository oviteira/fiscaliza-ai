/**
 * Módulo de Análise e Cálculo de Scores de Risco
 * 
 * Calcula scores de risco baseados em:
 * - Concentração de fornecedor (25%)
 * - Variação patrimonial (20%)
 * - Vínculo familiar em contratos (22%)
 * - Sobrepreço em contratos (18%)
 * - Padrão de emendas (10%)
 * - Inconsistência em RH (5%)
 */

import { Parlamentar, Contrato, Emenda } from '../drizzle/schema';

interface IndicadoresRisco {
  concentracaoFornecedor: number;
  variacaoPatrimonial: number;
  vinculoFamiliar: number;
  sobrepreco: number;
  padraoEmendas: number;
  inconsistenciaRH: number;
}

interface Familiar {
  nome: string;
  cpf: string;
}

interface ResultadoAnalise {
  scoreRisco: number;
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico';
  indicadores: IndicadoresRisco;
  detalhes: string[];
}

/**
 * Classe para análise de risco
 */
export class AnalisadorRisco {
  /**
   * Calcular score de risco de um parlamentar
   */
  static calcularScoreParlamentar(
    parlamentar: Parlamentar,
    contratos: Contrato[],
    emendas: Emenda[],
    familiares: Familiar[]
  ): ResultadoAnalise {
    const indicadores: IndicadoresRisco = {
      concentracaoFornecedor: this.analisarConcentracaoFornecedor(contratos),
      variacaoPatrimonial: this.analisarVariacaoPatrimonial(parlamentar),
      vinculoFamiliar: this.analisarVinculoFamiliar(contratos, familiares),
      sobrepreco: this.analisarSobrepreco(contratos),
      padraoEmendas: this.analisarPadraoEmendas(emendas),
      inconsistenciaRH: 0, // Requer dados de SIAPE
    };

    // Calcular score ponderado
    const scoreRisco = this.calcularScorePonderado(indicadores);
    const nivelRisco = this.classificarNivelRisco(scoreRisco);
    const detalhes = this.gerarDetalhes(indicadores, contratos, emendas);

    return {
      scoreRisco,
      nivelRisco,
      indicadores,
      detalhes,
    };
  }

  /**
   * Analisar concentração de fornecedor
   * Peso: 25%
   * 
   * Detecta se um parlamentar direciona a maioria dos contratos/emendas
   * para um único fornecedor ou grupo de fornecedores
   */
  private static analisarConcentracaoFornecedor(contratos: Contrato[]): number {
    if (contratos.length === 0) return 0;

    // Agrupar contratos por fornecedor
    const fornecedores = new Map<string, number>();
    let totalValor = 0;

    contratos.forEach((contrato) => {
      const valor = parseFloat(contrato.valorContrato);
      totalValor += valor;
      fornecedores.set(
        contrato.empresaContratada,
        (fornecedores.get(contrato.empresaContratada) || 0) + valor
      );
    });

    // Calcular percentual do maior fornecedor
    const maiorFornecedor = Math.max(...Array.from(fornecedores.values()));
    const percentualConcentracao = (maiorFornecedor / totalValor) * 100;

    // Classificar risco
    // > 80% = 100 (crítico)
    // > 60% = 75 (alto)
    // > 40% = 50 (médio)
    // > 20% = 25 (baixo)
    // <= 20% = 0 (sem risco)

    if (percentualConcentracao > 80) return 100;
    if (percentualConcentracao > 60) return 75;
    if (percentualConcentracao > 40) return 50;
    if (percentualConcentracao > 20) return 25;
    return 0;
  }

  /**
   * Analisar variação patrimonial
   * Peso: 20%
   * 
   * Detecta variações anormais no patrimônio declarado
   */
  private static analisarVariacaoPatrimonial(parlamentar: Parlamentar): number {
    // Requer dados de declarações de imposto de renda
    // Por enquanto, retornar 0
    return 0;
  }

  /**
   * Analisar vínculo familiar em contratos
   * Peso: 22%
   * 
   * Detecta se familiares do parlamentar são sócios de empresas contratadas
   */
  private static analisarVinculoFamiliar(contratos: Contrato[], familiares: Familiar[]): number {
    if (contratos.length === 0 || familiares.length === 0) return 0;

    let contratosFamiliar = 0;

    contratos.forEach((contrato) => {
      familiares.forEach((familiar) => {
        // Verificar se o nome do familiar aparece no contrato
        // Isso seria mais preciso com dados de CNPJ dos familiares
        if (
          contrato.empresaContratada &&
          familiar.nome &&
          contrato.empresaContratada.toLowerCase().includes(familiar.nome.toLowerCase())
        ) {
          contratosFamiliar++;
        }
      });
    });

    const percentualFamiliar = (contratosFamiliar / contratos.length) * 100;

    if (percentualFamiliar > 50) return 100;
    if (percentualFamiliar > 30) return 75;
    if (percentualFamiliar > 10) return 50;
    if (percentualFamiliar > 0) return 25;
    return 0;
  }

  /**
   * Analisar sobrepreço em contratos
   * Peso: 18%
   * 
   * Detecta contratos com valores acima da referência SINAPI
   */
  private static analisarSobrepreco(contratos: Contrato[]): number {
    if (contratos.length === 0) return 0;

    let contratosComSobrepreco = 0;
    let maiorPercentualSobrepreco = 0;

    contratos.forEach((contrato) => {
      // Verificar se tem sobrepreço
      if (contrato.temSobrepreco && contrato.percentualSobrepreco) {
        contratosComSobrepreco++;
        const percentual = parseFloat(contrato.percentualSobrepreco);
        maiorPercentualSobrepreco = Math.max(maiorPercentualSobrepreco, percentual);
      }
    });

    const percentualContratos = (contratosComSobrepreco / contratos.length) * 100;

    // Combinar percentual de contratos com sobrepreço e magnitude
    const risco = (percentualContratos * 0.5) + (Math.min(maiorPercentualSobrepreco, 100) * 0.5);

    return Math.min(risco, 100);
  }

  /**
   * Analisar padrão de emendas
   * Peso: 10%
   * 
   * Detecta padrões suspeitos no direcionamento de emendas
   */
  private static analisarPadraoEmendas(emendas: Emenda[]): number {
    if (emendas.length === 0) return 0;

    // Analisar concentração geográfica
    const municipios = new Map<string, number>();
    let totalEmendas = 0;

    emendas.forEach((emenda) => {
      totalEmendas++;
      if (emenda.municipio) {
        municipios.set(
          emenda.municipio,
          (municipios.get(emenda.municipio) || 0) + 1
        );
      }
    });

    // Calcular percentual do município com mais emendas
    const maiorMunicipio = municipios.size > 0 ? Math.max(...Array.from(municipios.values())) : 0;
    const percentualConcentracao = totalEmendas > 0 ? (maiorMunicipio / totalEmendas) * 100 : 0;

    // Analisar variação temporal
    const datas = emendas
      .filter((e) => e.dataEmenda)
      .map((e) => new Date(e.dataEmenda!).getTime());
    const diasEntre = datas.length > 1 ? Math.max(...datas) - Math.min(...datas) : 0;
    const diasMedio = datas.length > 0 ? diasEntre / datas.length : 0;

    // Se emendas concentradas em poucos dias, pode indicar padrão suspeito
    const riscotemporal = diasMedio < 30 ? 50 : 0;

    // Combinar riscos
    let risco = 0;
    if (percentualConcentracao > 70) risco += 50;
    if (percentualConcentracao > 50) risco += 30;
    risco += riscotemporal;

    return Math.min(risco, 100);
  }

  /**
   * Calcular score ponderado
   */
  private static calcularScorePonderado(indicadores: IndicadoresRisco): number {
    const score =
      indicadores.concentracaoFornecedor * 0.25 +
      indicadores.variacaoPatrimonial * 0.2 +
      indicadores.vinculoFamiliar * 0.22 +
      indicadores.sobrepreco * 0.18 +
      indicadores.padraoEmendas * 0.1 +
      indicadores.inconsistenciaRH * 0.05;

    return Math.round(score);
  }

  /**
   * Classificar nível de risco
   */
  private static classificarNivelRisco(score: number): 'baixo' | 'medio' | 'alto' | 'critico' {
    if (score >= 81) return 'critico';
    if (score >= 61) return 'alto';
    if (score >= 41) return 'medio';
    return 'baixo';
  }

  /**
   * Gerar detalhes da análise
   */
  private static gerarDetalhes(
    indicadores: IndicadoresRisco,
    contratos: Contrato[],
    emendas: Emenda[]
  ): string[] {
    const detalhes: string[] = [];

    if (indicadores.concentracaoFornecedor > 50) {
      detalhes.push(
        `⚠️ Concentração de fornecedor: ${indicadores.concentracaoFornecedor.toFixed(0)}% de risco`
      );
    }

    if (indicadores.vinculoFamiliar > 50) {
      detalhes.push(
        `⚠️ Vínculo familiar detectado: ${indicadores.vinculoFamiliar.toFixed(0)}% de risco`
      );
    }

    if (indicadores.sobrepreco > 50) {
      detalhes.push(
        `⚠️ Sobrepreço em contratos: ${indicadores.sobrepreco.toFixed(0)}% de risco`
      );
    }

    if (indicadores.padraoEmendas > 50) {
      detalhes.push(
        `⚠️ Padrão suspeito em emendas: ${indicadores.padraoEmendas.toFixed(0)}% de risco`
      );
    }

    detalhes.push(`📊 Total de contratos analisados: ${contratos.length}`);
    detalhes.push(`📊 Total de emendas analisadas: ${emendas.length}`);

    return detalhes;
  }

  /**
   * Detectar alertas específicos
   */
  static detectarAlertas(
    parlamentar: Parlamentar,
    contratos: Contrato[],
    emendas: Emenda[],
    familiares: Familiar[]
  ): Array<{
    tipo: string;
    titulo: string;
    descricao: string;
    scoreRisco: number;
  }> {
    const alertas: Array<{
      tipo: string;
      titulo: string;
      descricao: string;
      scoreRisco: number;
    }> = [];

    // Alerta: Concentração de fornecedor
    const concentracao = this.analisarConcentracaoFornecedor(contratos);
    if (concentracao > 50) {
      alertas.push({
        tipo: 'concentracao_fornecedor',
        titulo: 'Concentração de Fornecedor Detectada',
        descricao: `${parlamentar.nome} direciona a maioria dos contratos para um único fornecedor`,
        scoreRisco: concentracao,
      });
    }

    // Alerta: Vínculo familiar
    const vinculo = this.analisarVinculoFamiliar(contratos, familiares);
    if (vinculo > 25) {
      alertas.push({
        tipo: 'vinculo_familiar',
        titulo: 'Vínculo Familiar em Contratos',
        descricao: `Familiares de ${parlamentar.nome} aparecem como sócios de empresas contratadas`,
        scoreRisco: vinculo,
      });
    }

    // Alerta: Sobrepreço
    const sobrepreco = this.analisarSobrepreco(contratos);
    if (sobrepreco > 50) {
      alertas.push({
        tipo: 'sobrepreco',
        titulo: 'Sobrepreço em Contratos',
        descricao: `Contratos de ${parlamentar.nome} apresentam valores acima da referência SINAPI`,
        scoreRisco: sobrepreco,
      });
    }

    // Alerta: Padrão de emendas
    const padrao = this.analisarPadraoEmendas(emendas);
    if (padrao > 50) {
      alertas.push({
        tipo: 'padrão_suspeito',
        titulo: 'Padrão Suspeito em Emendas',
        descricao: `Emendas de ${parlamentar.nome} apresentam concentração geográfica ou temporal anormal`,
        scoreRisco: padrao,
      });
    }

    return alertas;
  }
}

/**
 * Funções auxiliares para análise
 */
export const analisarDados = {
  /**
   * Calcular média de valores
   */
  calcularMedia(valores: number[]): number {
    if (valores.length === 0) return 0;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  },

  /**
   * Calcular desvio padrão
   */
  calcularDesvio(valores: number[]): number {
    const media = this.calcularMedia(valores);
    const variancia =
      valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valores.length;
    return Math.sqrt(variancia);
  },

  /**
   * Detectar outliers (valores anormais)
   */
  detectarOutliers(valores: number[], desvios: number = 2): number[] {
    const media = this.calcularMedia(valores);
    const desvio = this.calcularDesvio(valores);
    const limite = desvio * desvios;

    return valores.filter((val) => Math.abs(val - media) > limite);
  },

  /**
   * Normalizar valor entre 0 e 100
   */
  normalizar(valor: number, minimo: number, maximo: number): number {
    if (maximo === minimo) return 0;
    const normalizado = ((valor - minimo) / (maximo - minimo)) * 100;
    return Math.max(0, Math.min(100, normalizado));
  },
};
