import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { Portfolio, Contribution, FeeBreakdown, DocumentService, SMSFFees, PASMPSItem, SMAStatus, SMAFees, SHAW_SPLIT, BPF_SPLIT } from './types';

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
  // Additional data
  hasPAS: boolean | null;
  hasMPS: boolean | null;
  pasItems: PASMPSItem[];
  mpsItems: PASMPSItem[];
  pasMpsTotal: number;
  smaStatus: SMAStatus;
  smaAccountCount: number;
  smaInvestedAmount: number;
  smaFees: SMAFees | null;
  smaTotal: number;
  includeMER: boolean | null;
  merKnown: boolean | null;
  merPercentage: number;
  merFee: number;
  includeSOA: boolean | null;
  soaAmount: number;
  soaDiscount: number;
  soaFee: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value: number, decimals = 2) => {
  return `${value.toFixed(decimals)}%`;
};

export function useWordExport() {
  const exportToWord = async (data: ExportData) => {
    console.log('Export function called');
    try {
      // Fetch the template from public folder
      console.log('Fetching template...');
      const response = await fetch('/Fee%20Calc%20Template.docx');
      console.log('Fetch response:', response.status);
      if (!response.ok) {
        alert('Template file not found. Please add Fee Calc Template.docx to the public folder.');
        return;
      }
      const templateArrayBuffer = await response.arrayBuffer();
      console.log('Template loaded, size:', templateArrayBuffer.byteLength);

    // Load the template
    const zip = new PizZip(templateArrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // Return empty string for undefined values
    });

    // Calculate values
    const smsfTotal = data.smsfFees
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee
      : 0;

    // Entity name based on number of portfolios
    const entityName = data.portfolios.length > 1 ? "Investment Portfolio's" : "Investment Portfolio";

    // Tier thresholds (first $1M, $1M-$2M, $2M+)
    const tierThresholds = [0, 1000000, 2000000];

    // Build fee scale description
    const feeScaleDescription = data.tierRates
      .slice(0, data.numberOfTiers)
      .map((rate) => `${rate}%`)
      .join(' / ');

    // Build fee rate tiers table (showing the rate scale)
    const feeRateTiers = data.tierRates.slice(0, data.numberOfTiers).map((rate, i) => {
      const min = tierThresholds[i] || 0;
      const max = tierThresholds[i + 1];
      let tierRange: string;
      if (i === 0) {
        tierRange = `First ${formatCurrency(max || 1000000)}`;
      } else if (max) {
        tierRange = `${formatCurrency(min)} - ${formatCurrency(max)}`;
      } else {
        tierRange = `${formatCurrency(min)}+`;
      }
      return {
        tierRange,
        tierRate: formatPercent(rate),
      };
    });

    // Build fee tiers breakdown BY TIER (not by portfolio)
    // This splits the total feeable balance across the tiers
    const totalFeeableBalance = data.portfolioTotals.feeableBalance;
    const feeTiers: Array<{
      entityName: string;
      tierBalance: string;
      tierPercent: string;
      tierFee: string;
      tierShawFee: string;
      tierBPFFee: string;
    }> = [];

    let remainingBalance = totalFeeableBalance;
    for (let i = 0; i < data.numberOfTiers; i++) {
      const tierMin = tierThresholds[i] || 0;
      const tierMax = tierThresholds[i + 1] || Infinity;
      const tierSize = tierMax - tierMin;
      const rate = data.tierRates[i] || 0;

      // Calculate how much of the balance falls in this tier
      let balanceInTier = 0;
      if (remainingBalance > 0) {
        if (tierMax === Infinity) {
          // Last tier gets all remaining
          balanceInTier = remainingBalance;
        } else {
          balanceInTier = Math.min(remainingBalance, tierSize);
        }
        remainingBalance -= balanceInTier;
      }

      if (balanceInTier > 0) {
        const tierFee = balanceInTier * (rate / 100);
        feeTiers.push({
          entityName,
          tierBalance: formatCurrency(balanceInTier),
          tierPercent: formatPercent(rate),
          tierFee: formatCurrency(tierFee),
          tierShawFee: formatCurrency(tierFee * SHAW_SPLIT),
          tierBPFFee: formatCurrency(tierFee * BPF_SPLIT),
        });
      }
    }

    // Document services for table
    const selectedDocServices = data.documentServices.filter(s => s.selected);
    const documentServicesData = selectedDocServices.map(s => ({
      serviceName: s.name,
      serviceFee: formatCurrency(s.fee * s.quantity),
      servicePaidTo: 'Heffron',
    }));

    // Heffron doc services (same as document services for now)
    const heffronDocServices = selectedDocServices.map(s => ({
      docServiceName: s.name,
      docServiceFee: formatCurrency(s.fee * s.quantity),
    }));

    // Calculate totals
    const totalOngoingFees = data.feeBreakdown.ongoingFeeAmount + data.pasMpsTotal + data.smaTotal;
    const totalOtherFees = data.merFee + smsfTotal + (data.isSMSF ? 259 : 0); // MER + SMSF admin + ASIC levy

    // SOA fee calculations
    const soaFeeFullAmount = data.soaAmount;
    const soaFeeDiscounted = data.soaAmount * (1 - data.soaDiscount / 100);
    const soaFeeShaw = soaFeeDiscounted * SHAW_SPLIT;
    const soaFeeBPF = soaFeeDiscounted * BPF_SPLIT;

    // MER entities - single row with entity name
    const merEntities = data.includeMER ? [{
      entityName,
      entityBalance: formatCurrency(data.portfolioTotals.feeableBalance),
      entityMERPercent: formatPercent(data.merPercentage),
      entityMERFee: formatCurrency(data.merFee),
    }] : [];

    // Prepare template data
    const templateData = {
      // Main totals
      totalBalance: formatCurrency(data.portfolioTotals.totalBalance),
      totalFeeableBalance: formatCurrency(data.portfolioTotals.feeableBalance),

      // Ongoing advice fee
      ongoingAdviceFee: formatCurrency(data.feeBreakdown.ongoingFeeAmount),
      ongoingAdviceFeePercent: formatPercent(data.feeBreakdown.ongoingFeePercent, 4),
      totalShawFee: formatCurrency(data.feeBreakdown.shawAmount),
      totalBPFFee: formatCurrency(data.feeBreakdown.bpfAmount),

      // Fee tiers
      feeTiers,
      feeRateTiers,
      feeScaleDescription,
      balanceCalculationNote: data.chargeAcceleratorFees === false
        ? 'The fee is calculated on your total portfolio balance, excluding cash in your Accelerator account.'
        : 'The fee is calculated on your total portfolio balance.',

      // Conditionals
      excludeAccelerator: data.chargeAcceleratorFees === false,
      isSMSF: data.isSMSF === true,
      isHeffron: data.administrator === 'heffron',
      isRyans: data.administrator === 'ryans',
      hasOngoingSMSFAdmin: data.isSMSF === true && data.smsfFees !== null,
      isEstimateSMSFAdmin: data.administrator === 'other',

      // SMSF
      smsfAdminFee: data.smsfFees ? formatCurrency(data.smsfFees.administrationFee + data.smsfFees.auditFee) : '',
      smsfAdministrator: data.administrator === 'heffron' ? 'Heffron' : data.administrator === 'ryans' ? 'Ryans' : 'Your Administrator',

      // Document services
      documentServices: documentServicesData,
      heffronDocServices,
      hasPensionEstablishment: selectedDocServices.some(s => s.id === 'pension-establishment'),
      hasCommutation: selectedDocServices.some(s => s.id === 'pension-commutation'),
      hasLumpSum: selectedDocServices.some(s => s.id === 'lump-sum'),
      hasContributionSplitting: selectedDocServices.some(s => s.id === 'contribution-splitting'),

      // Portfolio Service (PAS/MPS)
      hasPortfolioService: data.hasPAS === true || data.hasMPS === true,
      portfolioServiceName: data.hasPAS ? 'Portfolio Administration Service (PAS)' : data.hasMPS ? 'Managed Portfolio Service (MPS)' : '',
      portfolioServiceFee: formatCurrency(data.pasMpsTotal),
      portfolioServiceTitle: data.hasPAS ? 'Portfolio Administration Service' : data.hasMPS ? 'Managed Portfolio Service' : '',
      isExistingPortfolioService: (data.hasPAS && data.pasItems.some(i => i.isNew === false)) || (data.hasMPS && data.mpsItems.some(i => i.isNew === false)),
      isNewPortfolioService: (data.hasPAS && data.pasItems.some(i => i.isNew === true)) || (data.hasMPS && data.mpsItems.some(i => i.isNew === true)),
      portfolioServiceAccountNote: `Based on ${data.pasItems.length + data.mpsItems.length} account(s).`,

      // SMA
      hasSMA: data.smaStatus === 'new' || data.smaStatus === 'existing',
      isExistingSMA: data.smaStatus === 'existing',
      isNewSMA: data.smaStatus === 'new',
      smaFee: formatCurrency(data.smaTotal),
      smaFeeType: data.smaStatus === 'new' ? 'Tiered %' : 'Fixed',
      smaTotalFee: formatCurrency(data.smaTotal),
      smaTotalPercent: data.smaInvestedAmount > 0 ? formatPercent((data.smaTotal / data.smaInvestedAmount) * 100) : '',
      smaAccountNote: `Based on ${data.smaAccountCount} SMA account(s).`,
      smaBalanceNote: `Based on estimated SMA balance of ${formatCurrency(data.smaInvestedAmount)}.`,
      smaAdminFee: data.smaFees ? formatCurrency(data.smaFees.accountKeepingFee + data.smaFees.expenseRecoveryFee) : '',
      smaAdminFeePercent: '',

      // MER
      hasMER: data.includeMER === true,
      isKnownMER: data.merKnown === true,
      isEstimateMER: data.merKnown === false,
      merPercent: formatPercent(data.merPercentage),
      merFee: formatCurrency(data.merFee),
      merTotalFee: formatCurrency(data.merFee),
      merTotalPercent: formatPercent(data.merPercentage),
      merTotalValue: formatCurrency(data.portfolioTotals.feeableBalance),
      merCalculationNote: 'Investment management costs are charged by fund managers on your investments.',
      merEstimateNote: 'This is an estimate based on typical managed fund fees.',
      merEntityName: entityName,
      merEstimatedBalance: formatCurrency(data.portfolioTotals.feeableBalance),
      merEstimatedPercent: formatPercent(data.merPercentage),
      merEstimatedFee: formatCurrency(data.merFee),
      merEntities,
      merHoldings: [],

      // SOA Fee
      hasSOAFee: data.includeSOA === true && data.soaFee > 0,
      soaFeeType: 'Statement of Advice',
      soaFeeAmount: formatCurrency(data.soaFee),
      soaFeePaidTo: 'Shaw/BPF',
      soaFeeFullAmount: formatCurrency(soaFeeFullAmount),
      soaFeeDiscounted: formatCurrency(soaFeeDiscounted),
      soaFeeShaw: formatCurrency(soaFeeShaw),
      soaFeeBPF: formatCurrency(soaFeeBPF),
      soaFeeDeductible: formatCurrency(soaFeeDiscounted),

      // Totals
      totalInitialFees: formatCurrency(data.documentServiceTotal + data.soaFee),
      totalOngoingFees: formatCurrency(totalOngoingFees),
      totalOngoingPercent: formatPercent(data.feeBreakdown.ongoingFeePercent, 4),
      totalOtherFees: formatCurrency(totalOtherFees),
      totalOtherPercent: data.portfolioTotals.feeableBalance > 0
        ? formatPercent((totalOtherFees / data.portfolioTotals.feeableBalance) * 100)
        : '',
    };

    // Render the document
    doc.render(templateData);

    // Generate output
    const output = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Download
    console.log('Downloading file...');
    const url = window.URL.createObjectURL(output);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fee_Disclosure_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log('Export complete');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting document: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return { exportToWord };
}
