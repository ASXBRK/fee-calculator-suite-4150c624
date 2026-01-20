import * as XLSX from 'xlsx';
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

export function useExcelExport() {
  const exportToExcel = (data: ExportData) => {
    const workbook = XLSX.utils.book_new();

    // Calculate SMSF total
    const smsfTotal = data.smsfFees 
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee 
      : 0;

    // Sheet 1: Summary
    const summaryData = [
      ['BPF Fee Calculator - Summary'],
      [],
      ['Fee Structure'],
      ['GST Treatment', data.isGstExcluding ? 'GST Excluding' : 'GST Inclusive'],
      ['Number of Tiers', data.numberOfTiers],
      ...data.tierRates.slice(0, data.numberOfTiers).map((rate, i) => [
        `Tier ${i + 1} Rate`, `${rate}%`
      ]),
      [],
      ['Accelerator Fees Charged', data.chargeAcceleratorFees ? 'Yes' : 'No'],
      [],
      ['Portfolio Summary'],
      ['Total Portfolio Value', data.portfolioTotals.totalBalance],
      ['Total Accelerator Balance', data.portfolioTotals.totalAccelerator],
      ['Total Contributions', data.contributionTotals.totalContributions],
      ['Feeable Contributions', data.contributionTotals.feeableContributions],
      ['Total Feeable Balance', data.portfolioTotals.feeableBalance],
      [],
      ['Fee Calculation'],
      ['Ongoing Fee', data.feeBreakdown.ongoingFeeAmount],
      ['SMSF Fees', smsfTotal],
      ['Document Services', data.documentServiceTotal],
      ['Total Annual Fees', data.totalFees],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Portfolios
    const portfolioData = [
      ['Portfolio Name', 'Total Value', 'Accelerator Balance', 'Feeable Value'],
      ...data.portfolios.map(p => [
        p.name,
        p.balance,
        p.acceleratorBalance,
        p.balance - (data.chargeAcceleratorFees === false ? p.acceleratorBalance : 0)
      ]),
      [],
      ['Totals', data.portfolioTotals.totalBalance, data.portfolioTotals.totalAccelerator, '']
    ];

    const portfolioSheet = XLSX.utils.aoa_to_sheet(portfolioData);
    XLSX.utils.book_append_sheet(workbook, portfolioSheet, 'Portfolios');

    // Sheet 3: Contributions
    const contributionData = [
      ['Type', 'Amount', 'Div 293 Applicable', 'Feeable Amount'],
      ...data.contributions.map(c => {
        let feeableAmount = c.amount;
        if (c.type === 'concessional') {
          feeableAmount = c.div293Applicable ? c.amount * 0.7 : c.amount * 0.85;
        }
        return [
          c.type === 'rollover' ? 'Rollover' :
          c.type === 'ncc' ? 'Non-concessional' : 'Concessional',
          c.amount,
          c.type === 'concessional' ? (c.div293Applicable ? 'Yes' : 'No') : 'N/A',
          feeableAmount
        ];
      }),
      [],
      ['Totals', data.contributionTotals.totalContributions, '', data.contributionTotals.feeableContributions]
    ];

    const contributionSheet = XLSX.utils.aoa_to_sheet(contributionData);
    XLSX.utils.book_append_sheet(workbook, contributionSheet, 'Contributions');

    // Sheet 4: Fee Summary
    const feeSummaryData = [
      ['Fee Calculation Summary'],
      [],
      ['Total Feeable Balance', data.feeBreakdown.totalBalance],
      ['Ongoing Fee Rate', `${data.feeBreakdown.ongoingFeePercent.toFixed(4)}%`],
      ['Ongoing Fee Amount', data.feeBreakdown.ongoingFeeAmount],
      [],
      ['Fee Split'],
      ['Shaw Amount (40%)', data.feeBreakdown.shawAmount],
      ['BPF Amount (60%)', data.feeBreakdown.bpfAmount],
    ];

    const feeSummarySheet = XLSX.utils.aoa_to_sheet(feeSummaryData);
    XLSX.utils.book_append_sheet(workbook, feeSummarySheet, 'Fee Breakdown');

    // Sheet 5: SMSF & Document Services (if applicable)
    if (data.isSMSF && data.smsfFees) {
      const smsfData = [
        ['SMSF Fees'],
        ['Administrator', data.administrator === 'heffron' ? 'Heffron' : data.administrator === 'ryans' ? 'Ryans' : 'Other'],
        ['Administration Fee', data.smsfFees.administrationFee],
        ['Audit Fee', data.smsfFees.auditFee],
        ['ASIC Agent Fee', data.smsfFees.asicAgentFee],
        ['Total SMSF Fees', smsfTotal],
        [],
        ['Document Services'],
        ['Service', 'Quantity', 'Unit Fee', 'Total'],
        ...data.documentServices.filter(s => s.selected).map(s => [
          s.name,
          s.quantity,
          s.fee,
          s.fee * s.quantity
        ]),
        [],
        ['Total Document Services', '', '', data.documentServiceTotal]
      ];

      const smsfSheet = XLSX.utils.aoa_to_sheet(smsfData);
      XLSX.utils.book_append_sheet(workbook, smsfSheet, 'SMSF & Documents');
    }

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `BPF_Fee_Calculation_${date}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
  };

  return { exportToExcel };
}
