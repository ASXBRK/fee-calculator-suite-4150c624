import { useState, useMemo } from 'react';
import { 
  Portfolio, 
  DocumentService, 
  FeeBreakdown, 
  FeeTier,
  Administrator,
  SHAW_SPLIT, 
  BPF_SPLIT, 
  HEFFRON_SMSF_FEES,
  RYANS_SMSF_FEES,
  OTHER_SMSF_FEES,
  DOCUMENT_SERVICES 
} from './types';

export function useCalculator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    { id: '1', name: 'Portfolio 1', balance: 0 },
  ]);
  
  // GST settings
  const [isGstExcluding, setIsGstExcluding] = useState(false);
  
  // Fee tier settings
  const [numberOfTiers, setNumberOfTiers] = useState(2);
  const [tierRates, setTierRates] = useState<number[]>([1.2, 0.7, 0.5]); // percentages
  
  // SMSF settings
  const [isSMSF, setIsSMSF] = useState<boolean | null>(null);
  const [administrator, setAdministrator] = useState<Administrator>(null);
  
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
    setPortfolios([...portfolios, { id: newId, name: `Portfolio ${newId}`, balance: 0 }]);
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

  const feeBreakdown = useMemo((): FeeBreakdown => {
    const totalBalance = portfolios.reduce((sum, p) => sum + p.balance, 0);
    const { fee: ongoingFeeAmount } = calculateTieredFee(totalBalance);
    const ongoingFeePercent = totalBalance > 0 ? (ongoingFeeAmount / totalBalance) * 100 : 0;
    
    return {
      totalBalance,
      ongoingFeePercent,
      ongoingFeeAmount,
      shawAmount: ongoingFeeAmount * SHAW_SPLIT,
      bpfAmount: ongoingFeeAmount * BPF_SPLIT,
    };
  }, [portfolios, feeTiers]);

  const smsfFees = useMemo(() => {
    if (!isSMSF || !administrator) return null;
    
    let fees;
    switch (administrator) {
      case 'heffron':
        fees = HEFFRON_SMSF_FEES;
        break;
      case 'ryans':
        fees = RYANS_SMSF_FEES;
        break;
      case 'other':
        fees = OTHER_SMSF_FEES;
        break;
      default:
        return null;
    }
    
    return {
      ...fees,
      total: fees.administrationFee + fees.auditFee + fees.asicAgentFee,
    };
  }, [isSMSF, administrator]);

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
