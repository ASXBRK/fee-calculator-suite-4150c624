import ExcelJS from 'exceljs';
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
  const exportToExcel = async (data: ExportData) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BPF Fee Calculator';
    workbook.created = new Date();

    // Calculate SMSF total
    const smsfTotal = data.smsfFees 
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee 
      : 0;

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['BPF Fee Calculator - Summary']);
    summarySheet.addRow([]);
    summarySheet.addRow(['Fee Structure']);
    summarySheet.addRow(['GST Treatment', data.isGstExcluding ? 'GST Excluding' : 'GST Inclusive']);
    summarySheet.addRow(['Number of Tiers', data.numberOfTiers]);
    
    data.tierRates.slice(0, data.numberOfTiers).forEach((rate, i) => {
      summarySheet.addRow([`Tier ${i + 1} Rate`, `${rate}%`]);
    });
    
    summarySheet.addRow([]);
    summarySheet.addRow(['Accelerator Fees Charged', data.chargeAcceleratorFees ? 'Yes' : 'No']);
    summarySheet.addRow([]);
    summarySheet.addRow(['Portfolio Summary']);
    summarySheet.addRow(['Total Portfolio Value', data.portfolioTotals.totalBalance]);
    summarySheet.addRow(['Total Accelerator Balance', data.portfolioTotals.totalAccelerator]);
    summarySheet.addRow(['Total Contributions', data.contributionTotals.totalContributions]);
    summarySheet.addRow(['Feeable Contributions', data.contributionTotals.feeableContributions]);
    summarySheet.addRow(['Total Feeable Balance', data.portfolioTotals.feeableBalance]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Fee Calculation']);
    summarySheet.addRow(['Ongoing Fee', data.feeBreakdown.ongoingFeeAmount]);
    summarySheet.addRow(['SMSF Fees', smsfTotal]);
    summarySheet.addRow(['Document Services', data.documentServiceTotal]);
    summarySheet.addRow(['Total Annual Fees', data.totalFees]);

    // Style the header
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 20;

    // Sheet 2: Portfolios
    const portfolioSheet = workbook.addWorksheet('Portfolios');
    portfolioSheet.addRow(['Portfolio Name', 'Total Value', 'Accelerator Balance', 'Feeable Value']);
    portfolioSheet.getRow(1).font = { bold: true };
    
    data.portfolios.forEach(p => {
      portfolioSheet.addRow([
        p.name,
        p.balance,
        p.acceleratorBalance,
        p.balance - (data.chargeAcceleratorFees === false ? p.acceleratorBalance : 0)
      ]);
    });
    
    portfolioSheet.addRow([]);
    portfolioSheet.addRow(['Totals', data.portfolioTotals.totalBalance, data.portfolioTotals.totalAccelerator, '']);

    portfolioSheet.columns.forEach(col => { col.width = 20; });

    // Sheet 3: Contributions
    const contributionSheet = workbook.addWorksheet('Contributions');
    contributionSheet.addRow(['Type', 'Amount', 'Div 293 Applicable', 'Feeable Amount']);
    contributionSheet.getRow(1).font = { bold: true };
    
    data.contributions.forEach(c => {
      let feeableAmount = c.amount;
      if (c.type === 'concessional') {
        feeableAmount = c.div293Applicable ? c.amount * 0.7 : c.amount * 0.85;
      }
      contributionSheet.addRow([
        c.type === 'rollover' ? 'Rollover' :
        c.type === 'ncc' ? 'Non-concessional' : 'Concessional',
        c.amount,
        c.type === 'concessional' ? (c.div293Applicable ? 'Yes' : 'No') : 'N/A',
        feeableAmount
      ]);
    });
    
    contributionSheet.addRow([]);
    contributionSheet.addRow(['Totals', data.contributionTotals.totalContributions, '', data.contributionTotals.feeableContributions]);

    contributionSheet.columns.forEach(col => { col.width = 20; });

    // Sheet 4: Fee Summary
    const feeSummarySheet = workbook.addWorksheet('Fee Breakdown');
    feeSummarySheet.addRow(['Fee Calculation Summary']);
    feeSummarySheet.getRow(1).font = { bold: true, size: 14 };
    feeSummarySheet.addRow([]);
    feeSummarySheet.addRow(['Total Feeable Balance', data.feeBreakdown.totalBalance]);
    feeSummarySheet.addRow(['Ongoing Fee Rate', `${data.feeBreakdown.ongoingFeePercent.toFixed(4)}%`]);
    feeSummarySheet.addRow(['Ongoing Fee Amount', data.feeBreakdown.ongoingFeeAmount]);
    feeSummarySheet.addRow([]);
    feeSummarySheet.addRow(['Fee Split']);
    feeSummarySheet.addRow(['Shaw Amount (40%)', data.feeBreakdown.shawAmount]);
    feeSummarySheet.addRow(['BPF Amount (60%)', data.feeBreakdown.bpfAmount]);

    feeSummarySheet.getColumn(1).width = 25;
    feeSummarySheet.getColumn(2).width = 20;

    // Sheet 5: SMSF & Document Services (if applicable)
    if (data.isSMSF && data.smsfFees) {
      const smsfSheet = workbook.addWorksheet('SMSF & Documents');
      smsfSheet.addRow(['SMSF Fees']);
      smsfSheet.getRow(1).font = { bold: true, size: 14 };
      smsfSheet.addRow(['Administrator', data.administrator === 'heffron' ? 'Heffron' : data.administrator === 'ryans' ? 'Ryans' : 'Other']);
      smsfSheet.addRow(['Administration Fee', data.smsfFees.administrationFee]);
      smsfSheet.addRow(['Audit Fee', data.smsfFees.auditFee]);
      smsfSheet.addRow(['ASIC Agent Fee', data.smsfFees.asicAgentFee]);
      smsfSheet.addRow(['Total SMSF Fees', smsfTotal]);
      smsfSheet.addRow([]);
      smsfSheet.addRow(['Document Services']);
      smsfSheet.getRow(8).font = { bold: true };
      smsfSheet.addRow(['Service', 'Quantity', 'Unit Fee', 'Total']);
      smsfSheet.getRow(9).font = { bold: true };
      
      data.documentServices.filter(s => s.selected).forEach(s => {
        smsfSheet.addRow([s.name, s.quantity, s.fee, s.fee * s.quantity]);
      });
      
      smsfSheet.addRow([]);
      smsfSheet.addRow(['Total Document Services', '', '', data.documentServiceTotal]);

      smsfSheet.columns.forEach(col => { col.width = 20; });
    }

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `BPF_Fee_Calculation_${date}.xlsx`;

    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return { exportToExcel };
}
