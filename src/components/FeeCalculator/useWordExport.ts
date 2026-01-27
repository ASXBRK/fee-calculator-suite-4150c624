import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { Portfolio, Contribution, FeeBreakdown, DocumentService, SMSFFees } from './types';

interface ExportData {
  portfolios: Portfolio[];
  contributions: Contribution[];
  contributionTotals: { totalContributions: number; feeableContributions: number };
  portfolioTotals: { totalBalance: number; totalAccelerator: number; feeableBalance: number };
  chargeAcceleratorFees: boolean | null;
  feeBreakdown: FeeBreakdown;
  smsfFees: SMSFFees | null;
  documentServices: DocumentService[];
  documentServiceTotal: number;
  totalFees: number;
  tierRates: number[];
  numberOfTiers: number;
  isGstExcluding: boolean;
  isSMSF: boolean | null;
  administrator: 'heffron' | 'ryans' | 'other' | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const createTableRow = (cells: string[], isHeader = false): TableRow => {
  return new TableRow({
    children: cells.map(cell => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: cell, bold: isHeader })],
      })],
      width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
    })),
  });
};

const createSectionHeader = (text: string): Paragraph => {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28 })],
    spacing: { before: 400, after: 200 },
    heading: HeadingLevel.HEADING_2,
  });
};

const createKeyValueRow = (key: string, value: string): Paragraph => {
  return new Paragraph({
    children: [
      new TextRun({ text: `${key}: `, bold: true }),
      new TextRun({ text: value }),
    ],
    spacing: { after: 100 },
  });
};

export function useWordExport() {
  const exportToWord = async (data: ExportData) => {
    // Calculate SMSF total
    const smsfTotal = data.smsfFees
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee
      : 0;

    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: 'BPF Fee Calculator - Summary', bold: true, size: 36 })],
      spacing: { after: 400 },
      heading: HeadingLevel.HEADING_1,
    }));

    // Fee Structure Section
    children.push(createSectionHeader('Fee Structure'));
    children.push(createKeyValueRow('GST Treatment', data.isGstExcluding ? 'GST Excluding' : 'GST Inclusive'));
    children.push(createKeyValueRow('Number of Tiers', data.numberOfTiers.toString()));

    data.tierRates.slice(0, data.numberOfTiers).forEach((rate, i) => {
      children.push(createKeyValueRow(`Tier ${i + 1} Rate`, `${rate}%`));
    });

    children.push(createKeyValueRow('Accelerator Fees Charged', data.chargeAcceleratorFees ? 'Yes' : 'No'));

    // Portfolio Summary Section
    children.push(createSectionHeader('Portfolio Summary'));
    children.push(createKeyValueRow('Total Portfolio Value', formatCurrency(data.portfolioTotals.totalBalance)));
    children.push(createKeyValueRow('Total Accelerator Balance', formatCurrency(data.portfolioTotals.totalAccelerator)));
    children.push(createKeyValueRow('Total Contributions', formatCurrency(data.contributionTotals.totalContributions)));
    children.push(createKeyValueRow('Feeable Contributions', formatCurrency(data.contributionTotals.feeableContributions)));
    children.push(createKeyValueRow('Total Feeable Balance', formatCurrency(data.portfolioTotals.feeableBalance)));

    // Fee Calculation Section
    children.push(createSectionHeader('Fee Calculation'));
    children.push(createKeyValueRow('Ongoing Fee', formatCurrency(data.feeBreakdown.ongoingFeeAmount)));
    children.push(createKeyValueRow('SMSF Fees', formatCurrency(smsfTotal)));
    children.push(createKeyValueRow('Document Services', formatCurrency(data.documentServiceTotal)));
    children.push(createKeyValueRow('Total Annual Fees', formatCurrency(data.totalFees)));

    // Portfolios Table
    children.push(createSectionHeader('Portfolios'));
    const portfolioRows = [
      createTableRow(['Portfolio Name', 'Total Value', 'Accelerator Balance', 'Feeable Value'], true),
      ...data.portfolios.map(p => createTableRow([
        p.name,
        formatCurrency(p.balance),
        formatCurrency(p.acceleratorBalance),
        formatCurrency(p.balance - (data.chargeAcceleratorFees === false ? p.acceleratorBalance : 0))
      ])),
      createTableRow(['Totals', formatCurrency(data.portfolioTotals.totalBalance), formatCurrency(data.portfolioTotals.totalAccelerator), '']),
    ];

    children.push(new Table({
      rows: portfolioRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }));

    // Contributions Table
    children.push(createSectionHeader('Contributions'));
    const contributionRows = [
      createTableRow(['Type', 'Amount', 'Div 293 Applicable', 'Feeable Amount'], true),
      ...data.contributions.map(c => {
        let feeableAmount = c.amount;
        if (c.type === 'concessional') {
          feeableAmount = c.div293Applicable ? c.amount * 0.7 : c.amount * 0.85;
        }
        return createTableRow([
          c.type === 'rollover' ? 'Rollover' : c.type === 'ncc' ? 'Non-concessional' : 'Concessional',
          formatCurrency(c.amount),
          c.type === 'concessional' ? (c.div293Applicable ? 'Yes' : 'No') : 'N/A',
          formatCurrency(feeableAmount)
        ]);
      }),
      createTableRow(['Totals', formatCurrency(data.contributionTotals.totalContributions), '', formatCurrency(data.contributionTotals.feeableContributions)]),
    ];

    children.push(new Table({
      rows: contributionRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }));

    // Fee Breakdown Section
    children.push(createSectionHeader('Fee Breakdown'));
    children.push(createKeyValueRow('Total Feeable Balance', formatCurrency(data.feeBreakdown.totalBalance)));
    children.push(createKeyValueRow('Ongoing Fee Rate', `${data.feeBreakdown.ongoingFeePercent.toFixed(4)}%`));
    children.push(createKeyValueRow('Ongoing Fee Amount', formatCurrency(data.feeBreakdown.ongoingFeeAmount)));
    children.push(new Paragraph({ spacing: { after: 200 } }));
    children.push(createKeyValueRow('Shaw Amount (40%)', formatCurrency(data.feeBreakdown.shawAmount)));
    children.push(createKeyValueRow('BPF Amount (60%)', formatCurrency(data.feeBreakdown.bpfAmount)));

    // SMSF & Document Services (if applicable)
    if (data.isSMSF && data.smsfFees) {
      children.push(createSectionHeader('SMSF Fees'));
      children.push(createKeyValueRow('Administrator', data.administrator === 'heffron' ? 'Heffron' : data.administrator === 'ryans' ? 'Ryans' : 'Other'));
      children.push(createKeyValueRow('Administration Fee', formatCurrency(data.smsfFees.administrationFee)));
      children.push(createKeyValueRow('Audit Fee', formatCurrency(data.smsfFees.auditFee)));
      children.push(createKeyValueRow('ASIC Agent Fee', formatCurrency(data.smsfFees.asicAgentFee)));
      children.push(createKeyValueRow('Total SMSF Fees', formatCurrency(smsfTotal)));

      const selectedServices = data.documentServices.filter(s => s.selected);
      if (selectedServices.length > 0) {
        children.push(createSectionHeader('Document Services'));
        const serviceRows = [
          createTableRow(['Service', 'Quantity', 'Unit Fee', 'Total'], true),
          ...selectedServices.map(s => createTableRow([
            s.name,
            s.quantity.toString(),
            formatCurrency(s.fee),
            formatCurrency(s.fee * s.quantity)
          ])),
          createTableRow(['Total Document Services', '', '', formatCurrency(data.documentServiceTotal)]),
        ];

        children.push(new Table({
          rows: serviceRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }));
      }
    }

    // Create the document
    const doc = new Document({
      sections: [{
        children,
      }],
    });

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `BPF_Fee_Calculation_${date}.docx`;

    // Download file
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return { exportToWord };
}
