import { useState, useMemo } from 'react';
import { 
  Portfolio, 
  DocumentService, 
  FeeBreakdown, 
  FEE_TIERS, 
  SHAW_SPLIT, 
  BPF_SPLIT, 
  DEFAULT_SMSF_FEES,
  DOCUMENT_SERVICES 
} from './types';

export function useCalculator() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    { id: '1', name: 'Portfolio 1', balance: 0 },
  ]);
  
  const [isSMSF, setIsSMSF] = useState(false);
  const [documentServices, setDocumentServices] = useState<DocumentService[]>(DOCUMENT_SERVICES);

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

    for (let i = 0; i < FEE_TIERS.length && remainingBalance > 0; i++) {
      const tier = FEE_TIERS[i];
      const tierMax = i === 0 ? tier.max : tier.max - FEE_TIERS[i - 1].max;
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
  }, [portfolios]);

  const smsfFees = useMemo(() => {
    if (!isSMSF) return null;
    return {
      ...DEFAULT_SMSF_FEES,
      total: DEFAULT_SMSF_FEES.administrationFee + DEFAULT_SMSF_FEES.auditFee + DEFAULT_SMSF_FEES.asicAgentFee,
    };
  }, [isSMSF]);

  const documentServiceTotal = useMemo(() => {
    return documentServices
      .filter(s => s.selected)
      .reduce((sum, s) => sum + (s.fee * s.quantity), 0);
  }, [documentServices]);

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
    isSMSF,
    setIsSMSF,
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
