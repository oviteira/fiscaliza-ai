/**
 * Serviço de Geração de Relatórios em PDF
 */

import PDFDocument from 'pdfkit';

interface DadosRelatorio {
  parlamentar: {
    nome: string;
    cpf: string;
    partido: string;
    estado: string;
    scoreRisco: number;
    nivelRisco: string;
    totalContratos: number;
    totalEmendas: number;
  };
  contratos: Array<{
    numeroContrato: string;
    orgaoContratante: string;
    empresaContratada: string;
    valorContrato: number;
    scoreRisco: number;
    temSobrepreco: boolean;
    percentualSobrepreco?: number;
  }>;
  emendas: Array<{
    numeroEmenda: string;
    municipio: string;
    estado: string;
    valorEmenda: number;
    scoreRisco: number;
  }>;
  alertas: Array<{
    tipo: string;
    titulo: string;
    descricao: string;
    scoreRisco: number;
    nivelRisco: string;
  }>;
}

/**
 * Obter cor baseada no nível de risco
 */
function obterCorRisco(nivelRisco: string): string {
  switch (nivelRisco) {
    case 'critico':
      return '#F43F5E';
    case 'alto':
      return '#FBBF24';
    case 'medio':
      return '#F59E0B';
    case 'baixo':
      return '#34D399';
    default:
      return '#6B7280';
  }
}

/**
 * Formatar valor em moeda
 */
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Gerar relatório em PDF
 */
export async function gerarRelatorioPDF(dados: DadosRelatorio): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on('error', reject);

    try {
      // Cabeçalho
      doc.fontSize(24).font('Helvetica-Bold').text('FiscalizaAI', { align: 'center' });
      doc.fontSize(12).font('Helvetica').text('Relatório de Análise de Risco', { align: 'center' });
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
      doc.moveDown();

      // Seção 1: Dados do Parlamentar
      doc.fontSize(14).font('Helvetica-Bold').text('1. Dados do Parlamentar');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nome: ${dados.parlamentar.nome}`);
      doc.text(`CPF: ${dados.parlamentar.cpf}`);
      doc.text(`Partido: ${dados.parlamentar.partido}`);
      doc.text(`Estado: ${dados.parlamentar.estado}`);
      doc.moveDown();

      // Score de Risco
      const scoreRisco = Math.round(dados.parlamentar.scoreRisco);
      doc.fontSize(12).font('Helvetica-Bold').text('Score de Risco');
      doc.fontSize(10).font('Helvetica').text(`${scoreRisco}% - ${dados.parlamentar.nivelRisco.toUpperCase()}`);
      doc.moveDown();

      // Seção 2: Resumo Executivo
      doc.fontSize(14).font('Helvetica-Bold').text('2. Resumo Executivo');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total de Contratos: ${dados.parlamentar.totalContratos}`);
      doc.text(`Total de Emendas: ${dados.parlamentar.totalEmendas}`);
      doc.text(`Alertas Detectados: ${dados.alertas.length}`);
      doc.moveDown();

      // Seção 3: Contratos
      if (dados.contratos.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('3. Contratos Analisados');
        doc.fontSize(9).font('Helvetica');

        // Tabela de contratos
        const contratosPorPagina = 5;
        for (let i = 0; i < dados.contratos.length; i += contratosPorPagina) {
          const lote = dados.contratos.slice(i, i + contratosPorPagina);

          lote.forEach((contrato) => {
            doc.text(`Contrato: ${contrato.numeroContrato}`);
            doc.text(`  Órgão: ${contrato.orgaoContratante}`);
            doc.text(`  Empresa: ${contrato.empresaContratada}`);
            doc.text(`  Valor: ${formatarMoeda(contrato.valorContrato)}`);
            doc.text(`  Score de Risco: ${Math.round(contrato.scoreRisco)}%`);
            if (contrato.temSobrepreco) {
              doc.text(`  ⚠️ Sobrepreço detectado: ${contrato.percentualSobrepreco || 0}%`);
            }
            doc.moveDown(0.5);
          });

          if (i + contratosPorPagina < dados.contratos.length) {
            doc.addPage();
          }
        }
        doc.moveDown();
      }

      // Seção 4: Emendas
      if (dados.emendas.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('4. Emendas Parlamentares');
        doc.fontSize(9).font('Helvetica');

        const emendasPorPagina = 5;
        for (let i = 0; i < dados.emendas.length; i += emendasPorPagina) {
          const lote = dados.emendas.slice(i, i + emendasPorPagina);

          lote.forEach((emenda) => {
            doc.text(`Emenda: ${emenda.numeroEmenda}`);
            doc.text(`  Município: ${emenda.municipio}`);
            doc.text(`  Estado: ${emenda.estado}`);
            doc.text(`  Valor: ${formatarMoeda(emenda.valorEmenda)}`);
            doc.text(`  Score de Risco: ${Math.round(emenda.scoreRisco)}%`);
            doc.moveDown(0.5);
          });

          if (i + emendasPorPagina < dados.emendas.length) {
            doc.addPage();
          }
        }
        doc.moveDown();
      }

      // Seção 5: Alertas
      if (dados.alertas.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('5. Alertas de Risco');
        doc.fontSize(9).font('Helvetica');

        dados.alertas.forEach((alerta) => {
          doc.text(`[${alerta.nivelRisco.toUpperCase()}] ${alerta.titulo}`);
          doc.text(`  Tipo: ${alerta.tipo}`);
          doc.text(`  Score: ${Math.round(alerta.scoreRisco)}%`);
          doc.text(`  ${alerta.descricao}`);
          doc.moveDown(0.5);
        });
      }

      // Rodapé
      doc.moveDown();
      doc.fontSize(8).font('Helvetica').text('Este relatório foi gerado automaticamente pela plataforma FiscalizaAI.', {
        align: 'center',
      });
      doc.text('Para mais informações, visite: https://fiscalizaai.com.br', { align: 'center' });

      doc.end();
    } catch (error) {
      doc.end();
      reject(error);
    }
  });
}

/**
 * Gerar relatório simplificado
 */
export async function gerarRelatorioSimplificadoPDF(parlamentar: DadosRelatorio['parlamentar']): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on('error', reject);

    try {
      doc.fontSize(20).font('Helvetica-Bold').text('FiscalizaAI', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(parlamentar.nome, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Análise de Risco');
      doc.fontSize(11).font('Helvetica');
      doc.text(`Score: ${Math.round(parlamentar.scoreRisco)}%`);
      doc.text(`Classificação: ${parlamentar.nivelRisco.toUpperCase()}`);
      doc.moveDown();

      doc.fontSize(10).text(`Partido: ${parlamentar.partido}`);
      doc.text(`Estado: ${parlamentar.estado}`);
      doc.text(`Contratos: ${parlamentar.totalContratos}`);
      doc.text(`Emendas: ${parlamentar.totalEmendas}`);

      doc.end();
    } catch (error) {
      doc.end();
      reject(error);
    }
  });
}
