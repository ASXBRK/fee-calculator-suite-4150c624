import { useState, useMemo } from 'react';
import { 
  Portfolio, 
  Contribution,
  DocumentService, 
  FeeBreakdown, 
  FeeTier,
  Administrator,
  SMSFFees,
  SHAW_SPLIT, 
  BPF_SPLIT, 
  HEFFRON_SMSF_FEES,
  RYANS_SMSF_FEES,
  DOCUMENT_SERVICES 
} from './types';

export function useCalculator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    { id: '1', name: 'Portfolio 1', balance: 0, acceleratorBalance: 0 },
  ]);
  
  // Accelerator balance settings
  const [chargeAcceleratorFees, setChargeAcceleratorFees] = useState<boolean | null>(null);
  
  // Contributions/Rollovers
  const [contributions, setContributions] = useState<Contribution[]>([
    { id: '1', type: 'rollover', amount: 0, div293Applicable: null },
  ]);
  
  // GST settings
  const [isGstExcluding, setIsGstExcluding] = useState(false);
  
  // Fee tier settings
  const [numberOfTiers, setNumberOfTiers] = useState(2);
  const [tierRates, setTierRates] = useState<number[]>([1.2, 0.7, 0.5]); // percentages
  
  // SMSF settings
  const [isSMSF, setIsSMSF] = useState<boolean | null>(null);
  const [administrator, setAdministrator] = useState<Administrator>(null);
  const [customFees, setCustomFees] = useState<SMSFFees>({
    administrationFee: 0,
    auditFee: 0,
    asicAgentFee: 0,
  });
  
  const [documentServices, setDocumentServices] = useState<DocumentService[]>(DOCUMENT_SERVICES);

  // Calculate actual fee tiers based on settings
  const feeTiers = useMemo((): FeeTier[] => {
    const tiers: FeeTier[] = [];
    const gstMultiplier = isGstExcluding ? 1.1 : 1;
    
    for (let i = 0; i < numberOfTiers; i++) {
      const rate = (tierRates[i] / 100) * gstMultiplier;
      tiers.push({
        min: i === 0 ? 0 : i * 1000000 + 1,
        max: i === numberOfTiers - 1 ? Infinity : (i + 1) * 1000000,
        rate,
      });
    }
    return tiers;
  }, [numberOfTiers, tierRates, isGstExcluding]);

  const addPortfolio = () => {
    const newId = (portfolios.length + 1).toString();
    setPortfolios([...portfolios, { id: newId, name: `Portfolio ${newId}`, balance: 0, acceleratorBalance: 0 }]);
  };

  const removePortfolio = (id: string) => {
    if (portfolios.length > 1) {
      setPortfolios(portfolios.filter(p => p.id !== id));
    }
  };

  const updatePortfolio = (id: string, updates: Partial<Portfolio>) => {
    setPortfolios(portfolios.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateTierRate = (index: number, rate: number) => {
    const newRates = [...tierRates];
    newRates[index] = rate;
    setTierRates(newRates);
  };

  // Contribution functions
  const addContribution = () => {
    const newId = (contributions.length + 1).toString();
    setContributions([...contributions, { id: newId, type: 'rollover', amount: 0, div293Applicable: null }]);
  };

  const removeContribution = (id: string) => {
    if (contributions.length > 1) {
      setContributions(contributions.filter(c => c.id !== id));
    }
  };

  const updateContribution = (id: string, updates: Partial<Contribution>) => {
    setContributions(contributions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Calculate feeable amount from contributions
  const contributionTotals = useMemo(() => {
    let totalContributions = 0;
    let feeableContributions = 0;

    contributions.forEach(c => {
      totalContributions += c.amount;
      
      if (c.type === 'rollover' || c.type === 'ncc') {
        // 100% goes to feeable balance
        feeableContributions += c.amount;
      } else if (c.type === 'concessional') {
        if (c.div293Applicable === true) {
          // 70% goes to feeable balance (30% tax)
          feeableContributions += c.amount * 0.7;
        } else if (c.div293Applicable === false) {
          // 85% goes to feeable balance (15% tax)
          feeableContributions += c.amount * 0.85;
        }
        // If div293Applicable is null, don't add to feeable yet
      }
    });

    return { totalContributions, feeableContributions };
  }, [contributions]);

  const toggleDocumentService = (id: string) => {
    setDocumentServices(documentServices.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  const updateServiceQuantity = (id: string, quantity: number) => {
    setDocumentServices(documentServices.map(s => 
      s.id === id ? { ...s, quantity: Math.max(1, quantity) } : s
    ));
  };

  const calculateTieredFee = (balance: number): { fee: number; breakdown: { tier: number; amount: number; rate: number; fee: number }[] } => {
    let remainingBalance = balance;
    let totalFee = 0;
    const breakdown: { tier: number; amount: number; rate: number; fee: number }[] = [];

    for (let i = 0; i < feeTiers.length && remainingBalance > 0; i++) {
      const tier = feeTiers[i];
      const tierMax = i === 0 ? tier.max : tier.max - feeTiers[i - 1].max;
      const amountInTier = Math.min(remainingBalance, i === 0 ? tier.max : remainingBalance);
      const tierFee = amountInTier * tier.rate;
      
      breakdown.push({
        tier: i + 1,
        amount: amountInTier,
        rate: tier.rate,
        fee: tierFee,
      });
      
      totalFee += tierFee;
      remainingBalance -= amountInTier;
    }

    return { fee: totalFee, breakdown };
  };

  const portfolioTotals = useMemo(() => {
    const totalBalance = portfolios.reduce((sum, p) => sum + p.balance, 0);
    const totalAccelerator = portfolios.reduce((sum, p) => sum + p.acceleratorBalance, 0);
    // If chargeAcceleratorFees is true (yes, charge fees), use full balance
    // If chargeAcceleratorFees is false (no, exclude), subtract accelerator
    const portfolioFeeableBalance = chargeAcceleratorFees === false ? totalBalance - totalAccelerator : totalBalance;
    // Add feeable contributions
    const feeableBalance = portfolioFeeableBalance + contributionTotals.feeableContributions;
    return { totalBalance, totalAccelerator, feeableBalance, portfolioFeeableBalance };
  }, [portfolios, chargeAcceleratorFees, contributionTotals]);

  const feeBreakdown = useMemo((): FeeBreakdown => {
    const { totalBalance, feeableBalance } = portfolioTotals;
    const { fee: ongoingFeeAmount } = calculateTieredFee(feeableBalance);
    const ongoingFeePercent = feeableBalance > 0 ? (ongoingFeeAmount / feeableBalance) * 100 : 0;
    
    return {
      totalBalance: feeableBalance,
      ongoingFeePercent,
      ongoingFeeAmount,
      shawAmount: ongoingFeeAmount * SHAW_SPLIT,
      bpfAmount: ongoingFeeAmount * BPF_SPLIT,
    };
  }, [portfolioTotals, feeTiers]);

  const smsfFees = useMemo(() => {
    if (!isSMSF || !administrator) return null;
    
    let fees: SMSFFees;
    switch (administrator) {
      case 'heffron':
        fees = HEFFRON_SMSF_FEES;
        break;
      case 'ryans':
        fees = RYANS_SMSF_FEES;
        break;
      case 'other':
        fees = customFees;
        break;
      default:
        return null;
    }
    
    return {
      ...fees,
      total: fees.administrationFee + fees.auditFee + fees.asicAgentFee,
    };
  }, [isSMSF, administrator, customFees]);

  const documentServiceTotal = useMemo(() => {
    // Only show document services for Heffron
    if (administrator !== 'heffron') return 0;
    
    return documentServices
      .filter(s => s.selected)
      .reduce((sum, s) => sum + (s.fee * s.quantity), 0);
  }, [documentServices, administrator]);

  const totalFees = useMemo(() => {
    return feeBreakdown.ongoingFeeAmount + 
           (smsfFees?.total || 0) + 
           documentServiceTotal;
  }, [feeBreakdown, smsfFees, documentServiceTotal]);

  return {
    portfolios,
    addPortfolio,
    removePortfolio,
    updatePortfolio,
    chargeAcceleratorFees,
    setChargeAcceleratorFees,
    contributions,
    addContribution,
    removeContribution,
    updateContribution,
    contributionTotals,
    portfolioTotals,
    isGstExcluding,
    setIsGstExcluding,
    numberOfTiers,
    setNumberOfTiers,
    tierRates,
    updateTierRate,
    feeTiers,
    isSMSF,
    setIsSMSF,
    administrator,
    setAdministrator,
    customFees,
    setCustomFees,
    documentServices,
    toggleDocumentService,
    updateServiceQuantity,
    feeBreakdown,
    smsfFees,
    documentServiceTotal,
    totalFees,
    calculateTieredFee,
  };
}
