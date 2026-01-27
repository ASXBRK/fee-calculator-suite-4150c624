import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
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

export function useWordExport() {
  const exportToWord = async (data: ExportData) => {
    const smsfTotal = data.smsfFees
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee
      : 0;

    const children: Paragraph[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: 'BPF Fee Calculator - Summary', bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }));

    // Fee Summary
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Fee Summary', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    }));

    children.push(new Paragraph({ children: [new TextRun(`Total Portfolio Value: ${formatCurrency(data.portfolioTotals.totalBalance)}`)] }));
    children.push(new Paragraph({ children: [new TextRun(`Total Feeable Balance: ${formatCurrency(data.portfolioTotals.feeableBalance)}`)] }));
    children.push(new Paragraph({ children: [new TextRun(`Ongoing Fee: ${formatCurrency(data.feeBreakdown.ongoingFeeAmount)}`)] }));
    children.push(new Paragraph({ children: [new TextRun(`SMSF Fees: ${formatCurrency(smsfTotal)}`)] }));
    children.push(new Paragraph({ children: [new TextRun(`Document Services: ${formatCurrency(data.documentServiceTotal)}`)] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Total Annual Fees: ${formatCurrency(data.totalFees)}`, bold: true })],
      spacing: { before: 200 },
    }));

    // Fee Split
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Fee Split', bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    }));

    children.push(new Paragraph({ children: [new TextRun(`Shaw Amount (40%): ${formatCurrency(data.feeBreakdown.shawAmount)}`)] }));
    children.push(new Paragraph({ children: [new TextRun(`BPF Amount (60%): ${formatCurrency(data.feeBreakdown.bpfAmount)}`)] }));

    const doc = new Document({
      sections: [{ children }],
    });

    // Generate and download - use toBlob for browser
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BPF_Fee_Calculation_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return { exportToWord };
}
