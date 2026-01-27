import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
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
    // Fetch the template from public folder
    const response = await fetch('/template.docx');
    if (!response.ok) {
      alert('Template file not found. Please add template.docx to the public folder.');
      return;
    }
    const templateArrayBuffer = await response.arrayBuffer();

    // Load the template
    const zip = new PizZip(templateArrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Calculate values
    const smsfTotal = data.smsfFees
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee
      : 0;

    // Prepare template data - add any placeholders you need here
    const templateData = {
      // Portfolio data
      totalPortfolioValue: formatCurrency(data.portfolioTotals.totalBalance),
      totalAcceleratorBalance: formatCurrency(data.portfolioTotals.totalAccelerator),
      totalFeeableBalance: formatCurrency(data.portfolioTotals.feeableBalance),

      // Contribution data
      totalContributions: formatCurrency(data.contributionTotals.totalContributions),
      feeableContributions: formatCurrency(data.contributionTotals.feeableContributions),

      // Fee breakdown
      ongoingFee: formatCurrency(data.feeBreakdown.ongoingFeeAmount),
      ongoingFeePercent: data.feeBreakdown.ongoingFeePercent.toFixed(4),
      shawAmount: formatCurrency(data.feeBreakdown.shawAmount),
      bpfAmount: formatCurrency(data.feeBreakdown.bpfAmount),

      // SMSF
      smsfTotal: formatCurrency(smsfTotal),
      administrationFee: data.smsfFees ? formatCurrency(data.smsfFees.administrationFee) : '$0',
      auditFee: data.smsfFees ? formatCurrency(data.smsfFees.auditFee) : '$0',
      asicAgentFee: data.smsfFees ? formatCurrency(data.smsfFees.asicAgentFee) : '$0',
      administrator: data.administrator === 'heffron' ? 'Heffron' : data.administrator === 'ryans' ? 'Ryans' : 'Other',

      // Document services
      documentServiceTotal: formatCurrency(data.documentServiceTotal),

      // Total
      totalFees: formatCurrency(data.totalFees),

      // Settings
      gstTreatment: data.isGstExcluding ? 'GST Excluding' : 'GST Inclusive',
      acceleratorFeesCharged: data.chargeAcceleratorFees ? 'Yes' : 'No',
      isSMSF: data.isSMSF ? 'Yes' : 'No',

      // Arrays for tables (if needed)
      portfolios: data.portfolios.map(p => ({
        name: p.name,
        balance: formatCurrency(p.balance),
        acceleratorBalance: formatCurrency(p.acceleratorBalance),
        feeableValue: formatCurrency(p.balance - (data.chargeAcceleratorFees === false ? p.acceleratorBalance : 0)),
      })),

      contributions: data.contributions.map(c => {
        let feeableAmount = c.amount;
        if (c.type === 'concessional') {
          feeableAmount = c.div293Applicable ? c.amount * 0.7 : c.amount * 0.85;
        }
        return {
          type: c.type === 'rollover' ? 'Rollover' : c.type === 'ncc' ? 'Non-concessional' : 'Concessional',
          amount: formatCurrency(c.amount),
          div293: c.type === 'concessional' ? (c.div293Applicable ? 'Yes' : 'No') : 'N/A',
          feeableAmount: formatCurrency(feeableAmount),
        };
      }),

      documentServices: data.documentServices.filter(s => s.selected).map(s => ({
        name: s.name,
        quantity: s.quantity,
        fee: formatCurrency(s.fee),
        total: formatCurrency(s.fee * s.quantity),
      })),

      // Date
      date: new Date().toLocaleDateString('en-AU'),
    };

    // Render the document
    doc.render(templateData);

    // Generate output
    const output = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Download
    const url = window.URL.createObjectURL(output);
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
