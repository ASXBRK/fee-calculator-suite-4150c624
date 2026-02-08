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
      nullGetter: () => 'XXXX', // Return XXXX for missing values
    });

    // Calculate values
    const smsfTotal = data.smsfFees
      ? data.smsfFees.administrationFee + data.smsfFees.auditFee + data.smsfFees.asicAgentFee
      : 0;

    // Entity name based on portfolio names
    // e.g., "SMSF Portfolio", "SMSF and Trust Portfolios", "SMSF, Trust and Personal Portfolios"
    const portfolioNames = data.portfolios
      .filter(p => p.balance > 0 || data.portfolios.length === 1)
      .map(p => p.name);

    let entityName: string;
    if (portfolioNames.length === 0) {
      entityName = 'Investment Portfolio';
    } else if (portfolioNames.length === 1) {
      entityName = `${portfolioNames[0]} Portfolio`;
    } else {
      // Multiple portfolios: "SMSF and Trust Portfolios" or "SMSF, Trust and Personal Portfolios"
      const lastPortfolio = portfolioNames.pop();
      entityName = `${portfolioNames.join(', ')} and ${lastPortfolio} Portfolios`;
    }

    // Tier thresholds (first $1M, $1M-$2M, $2M+)
    const tierThresholds = [0, 1000000, 2000000];

    // Build fee scale description (simple version)
    const feeScaleDescription = data.tierRates
      .slice(0, data.numberOfTiers)
      .map((rate) => `${rate}%`)
      .join(' / ');

    // Build detailed tier explanation for Note 2
    // e.g., "1.2% on the first $1,000,000 and 0.7% on the balance above" (2 tiers)
    // e.g., "1.2% on the first $1,000,000, 0.7% on the balance between $1,000,001 and $2,000,000 and 0.5% on the balance above $2,000,000" (3 tiers)
    let tierExplanation = '';
    const rates = data.tierRates.slice(0, data.numberOfTiers);
    if (data.numberOfTiers === 2) {
      tierExplanation = `${rates[0]}% on the first $1,000,000 and ${rates[1]}% on the balance above`;
    } else if (data.numberOfTiers === 3) {
      tierExplanation = `${rates[0]}% on the first $1,000,000, ${rates[1]}% on the balance between $1,000,001 and $2,000,000 and ${rates[2]}% on the balance above $2,000,000`;
    } else if (data.numberOfTiers === 1) {
      tierExplanation = `${rates[0]}% on the total balance`;
    }

    // Build fee rate tiers table (showing the rate scale) - Table 1A
    const feeRateTiers = data.tierRates.slice(0, data.numberOfTiers).map((rate, i) => {
      let tierRange: string;
      if (data.numberOfTiers === 2) {
        // 2 tiers: "First $1,000,000" and "$1,000,000+"
        if (i === 0) {
          tierRange = 'First $1,000,000';
        } else {
          tierRange = '$1,000,000+';
        }
      } else if (data.numberOfTiers === 3) {
        // 3 tiers: "First $1,000,000", "$1,000,001 - $2,000,000", "$2,000,000+"
        if (i === 0) {
          tierRange = 'First $1,000,000';
        } else if (i === 1) {
          tierRange = '$1,000,001 - $2,000,000';
        } else {
          tierRange = '$2,000,000+';
        }
      } else {
        // 1 tier or fallback
        tierRange = 'All balances';
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

    // Also build individual tier data for fixed table layouts
    const tierData: Array<{
      balance: number;
      percent: number;
      fee: number;
      shawFee: number;
      bpfFee: number;
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
        tierData.push({
          balance: balanceInTier,
          percent: rate,
          fee: tierFee,
          shawFee: tierFee * SHAW_SPLIT,
          bpfFee: tierFee * BPF_SPLIT,
        });
      }
    }

    // Count actual tiers used (based on balance, not settings)
    const actualTierCount = feeTiers.length;

    // Individual tier placeholders for fixed table layouts
    const tier1 = tierData[0] || { balance: 0, percent: 0, fee: 0, shawFee: 0, bpfFee: 0 };
    const tier2 = tierData[1] || { balance: 0, percent: 0, fee: 0, shawFee: 0, bpfFee: 0 };
    const tier3 = tierData[2] || { balance: 0, percent: 0, fee: 0, shawFee: 0, bpfFee: 0 };

    // Debug logging
    console.log('Tier data:', {
      totalFeeableBalance,
      actualTierCount,
      numberOfTiers: data.numberOfTiers,
      tier1Balance: tier1.balance,
      tier2Balance: tier2.balance,
      tier3Balance: tier3.balance,
      hasOneTier: actualTierCount === 1,
      hasTwoTiers: actualTierCount === 2,
      hasThreeTiers: actualTierCount === 3,
    });

    // Build dynamic balance calculation note
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

    // Build portfolio descriptions
    const portfoliosWithBalance = data.portfolios.filter(p => p.balance > 0);
    const portfolioDescriptions: string[] = [];
    let totalAcceleratorDeduction = 0;

    for (const portfolio of portfoliosWithBalance) {
      const portfolioName = portfolio.name.toLowerCase().includes('portfolio')
        ? portfolio.name
        : `${portfolio.name} portfolio`;

      if (data.chargeAcceleratorFees === false && portfolio.acceleratorBalance > 0) {
        // Fees NOT charged on accelerator - show balance less accelerator
        portfolioDescriptions.push(
          `${portfolioName} balance of ${formatCurrency(portfolio.balance)} less the accelerator balance of ${formatCurrency(portfolio.acceleratorBalance)}`
        );
        totalAcceleratorDeduction += portfolio.acceleratorBalance;
      } else {
        portfolioDescriptions.push(`${portfolioName} balance of ${formatCurrency(portfolio.balance)}`);
      }
    }

    // Build contribution descriptions
    const contributionDescriptions: string[] = [];
    const rollovers = data.contributions.filter(c => c.type === 'rollover' && c.amount > 0);
    const nccs = data.contributions.filter(c => c.type === 'ncc' && c.amount > 0);
    const ccs = data.contributions.filter(c => c.type === 'concessional' && c.amount > 0);

    // Add rollovers
    for (const rollover of rollovers) {
      contributionDescriptions.push(`rollover of ${formatCurrency(rollover.amount)}`);
    }

    // Add NCCs
    for (const ncc of nccs) {
      contributionDescriptions.push(`non-concessional contribution of ${formatCurrency(ncc.amount)}`);
    }

    // Add CCs with tax
    for (const cc of ccs) {
      const taxRate = cc.div293Applicable ? 0.30 : 0.15; // Div 293 is 30%, normal is 15%
      const taxAmount = cc.amount * taxRate;
      const taxType = cc.div293Applicable ? 'Division 293 tax' : 'contribution tax';
      contributionDescriptions.push(
        `concessional contribution of ${formatCurrency(cc.amount)} less ${taxType} of ${formatCurrency(taxAmount)}`
      );
    }

    // Build the full note
    let balanceCalculationNote = 'The fee is calculated on ';
    const parts: string[] = [];

    if (portfolioDescriptions.length > 0) {
      // Join portfolios with "and" for the last one
      if (portfolioDescriptions.length === 1) {
        parts.push(`your ${portfolioDescriptions[0]} as at ${dateStr}`);
      } else {
        const lastPortfolio = portfolioDescriptions.pop();
        parts.push(`your ${portfolioDescriptions.join(', ')} and ${lastPortfolio} as at ${dateStr}`);
      }
    }

    if (contributionDescriptions.length > 0) {
      // Join contributions
      if (portfolioDescriptions.length > 0 || parts.length > 0) {
        parts.push(`plus the ${contributionDescriptions.join(', ')}`);
      } else {
        // No portfolios, just contributions
        parts.push(`the ${contributionDescriptions.join(', ')}`);
      }
    }

    if (parts.length === 0) {
      balanceCalculationNote = 'The fee is calculated on your total portfolio balance.';
    } else {
      balanceCalculationNote += parts.join(' ') + '.';
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
      // Main totals - totalBalance is the amount fees are calculated on (portfolios + contributions)
      totalBalance: formatCurrency(data.portfolioTotals.feeableBalance),
      totalFeeableBalance: formatCurrency(data.portfolioTotals.feeableBalance),

      // Ongoing advice fee
      ongoingAdviceFee: formatCurrency(data.feeBreakdown.ongoingFeeAmount),
      ongoingAdviceFeePercent: formatPercent(data.feeBreakdown.ongoingFeePercent),
      totalShawFee: formatCurrency(data.feeBreakdown.shawAmount),
      totalBPFFee: formatCurrency(data.feeBreakdown.bpfAmount),

      // Fee tiers
      feeTiers,
      feeRateTiers,
      feeScaleDescription,
      tierExplanation,
      balanceCalculationNote,

      // Tier count conditionals (based on actual balance, not settings)
      hasOneTier: actualTierCount === 1,
      hasTwoTiers: actualTierCount === 2,
      hasThreeTiers: actualTierCount === 3,

      // Individual tier data for fixed table layouts
      tier1Balance: formatCurrency(tier1.balance),
      tier1Percent: formatPercent(tier1.percent),
      tier1Fee: formatCurrency(tier1.fee),
      tier1ShawFee: formatCurrency(tier1.shawFee),
      tier1BPFFee: formatCurrency(tier1.bpfFee),
      tier2Balance: formatCurrency(tier2.balance),
      tier2Percent: formatPercent(tier2.percent),
      tier2Fee: formatCurrency(tier2.fee),
      tier2ShawFee: formatCurrency(tier2.shawFee),
      tier2BPFFee: formatCurrency(tier2.bpfFee),
      tier3Balance: formatCurrency(tier3.balance),
      tier3Percent: formatPercent(tier3.percent),
      tier3Fee: formatCurrency(tier3.fee),
      tier3ShawFee: formatCurrency(tier3.shawFee),
      tier3BPFFee: formatCurrency(tier3.bpfFee),

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
      hasTrusteeCompanyEstablishment: selectedDocServices.some(s => s.id === 'trustee-company'),
      hasSMSFEstablishment: selectedDocServices.some(s => s.id === 'smsf-establishment'),
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
      // smaTotalPercent = (administrationFee + 60 + 150) / SMA balance
      smaTotalPercent: data.smaInvestedAmount > 0 && data.smaFees
        ? formatPercent(((data.smaFees.administrationFee || 0) + 60 + 150) / data.smaInvestedAmount * 100)
        : '',
      smaAccountNote: `Based on ${data.smaAccountCount} SMA account(s).`,
      smaBalanceNote: `Based on estimated SMA balance of ${formatCurrency(data.smaInvestedAmount)}.`,
      // smaAdminFee = the tiered administration fee amount
      smaAdminFee: data.smaFees ? formatCurrency(data.smaFees.administrationFee || 0) : '',
      // smaAdminFeePercent = the tiered administration fee as a percentage
      smaAdminFeePercent: data.smaFees ? formatPercent(data.smaFees.administrationPercent || 0) : '',

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
      soaFeeDeductible: '', // Left blank for user to input

      // Totals
      totalInitialFees: formatCurrency(data.documentServiceTotal + data.soaFee),
      totalOngoingFees: formatCurrency(totalOngoingFees),
      totalOngoingPercent: formatPercent(data.feeBreakdown.ongoingFeePercent),
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
    } catch (error: unknown) {
      console.error('Export error:', error);
      // Log detailed errors from docxtemplater
      if (error && typeof error === 'object' && 'properties' in error) {
        const err = error as { properties?: { errors?: Array<{ properties?: { id?: string; explanation?: string; file?: string } }> } };
        if (err.properties?.errors) {
          console.log('Template errors found:');
          const errorMessages = err.properties.errors.map((e, i) => {
            const msg = `${i + 1}. ${e.properties?.id || 'Unknown'}: ${e.properties?.explanation || 'No details'}`;
            console.log(msg);
            return msg;
          });
          alert('Template errors:\n' + errorMessages.slice(0, 5).join('\n') + (errorMessages.length > 5 ? `\n...and ${errorMessages.length - 5} more` : ''));
          return;
        }
      }
      alert('Error exporting document: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return { exportToWord };
}
