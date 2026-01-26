import { useState, useMemo } from 'react';
import { 
  Portfolio, 
  Contribution,
  DocumentService, 
  FeeBreakdown, 
  FeeTier,
  Administrator,
  SMSFFees,
  PASMPSItem,
  SMAStatus,
  DEFAULT_PASMPS_FEES,
  MINIMUM_ADVICE_FEES,
  SHAW_SPLIT, 
  BPF_SPLIT, 
  HEFFRON_SMSF_FEES,
  RYANS_SMSF_FEES,
  DOCUMENT_SERVICES,
  SMA_FEE_TIERS,
  SMA_EXISTING_FEES,
  MER_ESTIMATE_PERCENTAGE,
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
  const [useEstimate, setUseEstimate] = useState<boolean>(false);

  // PAS/MPS settings
  const [hasPAS, setHasPAS] = useState<boolean>(false);
  const [hasMPS, setHasMPS] = useState<boolean>(false);
  const [pasItems, setPasItems] = useState<PASMPSItem[]>([
    { id: '1', isNew: null }
  ]);
  const [mpsItems, setMpsItems] = useState<PASMPSItem[]>([
    { id: '1', isNew: null }
  ]);
  
  const [documentServices, setDocumentServices] = useState<DocumentService[]>(DOCUMENT_SERVICES);

  // SMA settings
  const [smaStatus, setSmaStatus] = useState<SMAStatus>(null);
  const [smaAccountCount, setSmaAccountCount] = useState<number>(1);
  const [smaInvestedAmount, setSmaInvestedAmount] = useState<number>(0);
  const [smaUseAutoEstimate, setSmaUseAutoEstimate] = useState<boolean>(false);

  // MER settings
  const [includeMER, setIncludeMER] = useState<boolean | null>(null);
  const [merKnown, setMerKnown] = useState<boolean>(false);
  const [merPercentage, setMerPercentage] = useState<number>(0);

  // SOA settings
  const [includeSOA, setIncludeSOA] = useState<boolean | null>(null);
  const [soaAmount, setSoaAmount] = useState<number>(0);
  const [soaDiscount, setSoaDiscount] = useState<number>(0); // 0, 25, 50, or 75

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

  // PAS/MPS functions
  const addPASItem = () => {
    const newId = (pasItems.length + 1).toString();
    setPasItems([...pasItems, { id: newId, isNew: null }]);
  };

  const removePASItem = (id: string) => {
    if (pasItems.length > 1) {
      setPasItems(pasItems.filter(item => item.id !== id));
    }
  };

  const updatePASItem = (id: string, isNew: boolean) => {
    setPasItems(pasItems.map(item => item.id === id ? { ...item, isNew } : item));
  };

  const addMPSItem = () => {
    const newId = (mpsItems.length + 1).toString();
    setMpsItems([...mpsItems, { id: newId, isNew: null }]);
  };

  const removeMPSItem = (id: string) => {
    if (mpsItems.length > 1) {
      setMpsItems(mpsItems.filter(item => item.id !== id));
    }
  };

  const updateMPSItem = (id: string, isNew: boolean) => {
    setMpsItems(mpsItems.map(item => item.id === id ? { ...item, isNew } : item));
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

  // Calculate applicable minimum fee based on PAS/MPS selections
  const applicableMinimum = useMemo(() => {
    // If no PAS/MPS selected, no minimum applies
    if (!hasPAS && !hasMPS) return 0;

    let hasNewPAS = false;
    let hasNewMPS = false;
    let hasAnyExisting = false;

    if (hasPAS) {
      pasItems.forEach(item => {
        if (item.isNew === true) hasNewPAS = true;
        if (item.isNew === false) hasAnyExisting = true;
      });
    }

    if (hasMPS) {
      mpsItems.forEach(item => {
        if (item.isNew === true) hasNewMPS = true;
        if (item.isNew === false) hasAnyExisting = true;
      });
    }

    // New MPS has highest minimum
    if (hasNewMPS) return MINIMUM_ADVICE_FEES.mpsNew;
    // New PAS has second highest minimum
    if (hasNewPAS) return MINIMUM_ADVICE_FEES.pasNew;
    // Existing only
    if (hasAnyExisting) return MINIMUM_ADVICE_FEES.existing;

    return 0;
  }, [hasPAS, hasMPS, pasItems, mpsItems]);

  const feeBreakdown = useMemo((): FeeBreakdown => {
    const { feeableBalance } = portfolioTotals;
    const { fee: calculatedFee } = calculateTieredFee(feeableBalance);
    
    // Check if minimum fee applies
    const minimumApplied = applicableMinimum > 0 && calculatedFee < applicableMinimum;
    const ongoingFeeAmount = minimumApplied ? applicableMinimum : calculatedFee;
    const ongoingFeePercent = feeableBalance > 0 ? (ongoingFeeAmount / feeableBalance) * 100 : 0;
    
    return {
      totalBalance: feeableBalance,
      ongoingFeePercent,
      ongoingFeeAmount,
      shawAmount: ongoingFeeAmount * SHAW_SPLIT,
      bpfAmount: ongoingFeeAmount * BPF_SPLIT,
      minimumApplied,
      minimumAmount: applicableMinimum,
    };
  }, [portfolioTotals, applicableMinimum, calculateTieredFee]);

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

  const pasMpsTotal = useMemo(() => {
    let total = 0;
    
    if (hasPAS) {
      pasItems.forEach(item => {
        if (item.isNew === true) {
          total += DEFAULT_PASMPS_FEES.pasNew;
        } else if (item.isNew === false) {
          total += DEFAULT_PASMPS_FEES.pasExisting;
        }
      });
    }
    
    if (hasMPS) {
      mpsItems.forEach(item => {
        if (item.isNew === true) {
          total += DEFAULT_PASMPS_FEES.mpsNew;
        } else if (item.isNew === false) {
          total += DEFAULT_PASMPS_FEES.mpsExisting;
        }
      });
    }
    
    return total;
  }, [hasPAS, hasMPS, pasItems, mpsItems]);

  // Calculate SMA fees
  const smaFees = useMemo(() => {
    if (!smaStatus || smaStatus === 'na') return null;
    
    if (smaStatus === 'existing') {
      const total = (SMA_EXISTING_FEES.managedFundCustody + 
                    SMA_EXISTING_FEES.accountKeepingFee + 
                    SMA_EXISTING_FEES.expenseRecoveryFee) * smaAccountCount;
      return {
        administrationFee: 0,
        administrationPercent: 0,
        accountKeepingFee: SMA_EXISTING_FEES.accountKeepingFee * smaAccountCount,
        expenseRecoveryFee: SMA_EXISTING_FEES.expenseRecoveryFee * smaAccountCount,
        managedFundCustody: SMA_EXISTING_FEES.managedFundCustody * smaAccountCount,
        total,
        accountCount: smaAccountCount,
      };
    }
    
    // New SMA - calculate tiered administration fee
    const investedAmount = smaUseAutoEstimate 
      ? Math.round(portfolioTotals.totalBalance * 0.2) 
      : smaInvestedAmount;
    
    if (investedAmount <= 0) return null;
    
    // Calculate tiered administration fee
    let remainingAmount = investedAmount;
    let adminFee = 0;
    
    for (const tier of SMA_FEE_TIERS) {
      if (remainingAmount <= 0) break;
      
      const tierStart = tier.min;
      const tierEnd = tier.max;
      const tierSize = tier.min === 0 ? tierEnd : tierEnd - tierStart + 1;
      const amountInTier = Math.min(remainingAmount, tier.min === 0 ? tierEnd : tierSize);
      
      adminFee += amountInTier * tier.rate;
      remainingAmount -= amountInTier;
    }
    
    const adminPercent = investedAmount > 0 ? (adminFee / investedAmount) * 100 : 0;
    const accountKeepingFee = 60 * smaAccountCount;
    const expenseRecoveryFee = 150 * smaAccountCount;
    const total = adminFee + accountKeepingFee + expenseRecoveryFee;
    
    return {
      administrationFee: adminFee,
      administrationPercent: adminPercent,
      accountKeepingFee,
      expenseRecoveryFee,
      managedFundCustody: 0,
      total,
      accountCount: smaAccountCount,
    };
  }, [smaStatus, smaAccountCount, smaInvestedAmount, smaUseAutoEstimate, portfolioTotals.totalBalance]);

  const smaTotal = useMemo(() => {
    return smaFees?.total || 0;
  }, [smaFees]);

  // Calculate MER fee
  const merFee = useMemo(() => {
    if (!includeMER) return 0;
    
    const rate = merKnown ? merPercentage : MER_ESTIMATE_PERCENTAGE;
    return (portfolioTotals.feeableBalance * rate) / 100;
  }, [includeMER, merKnown, merPercentage, portfolioTotals.feeableBalance]);

  // Calculate SOA fee with discount
  const soaFee = useMemo(() => {
    if (!includeSOA || soaAmount <= 0) return 0;
    return soaAmount * (1 - soaDiscount / 100);
  }, [includeSOA, soaAmount, soaDiscount]);

  const totalFees = useMemo(() => {
    return feeBreakdown.ongoingFeeAmount + 
           (smsfFees?.total || 0) + 
           documentServiceTotal +
           pasMpsTotal +
           smaTotal +
           merFee +
           soaFee;
  }, [feeBreakdown, smsfFees, documentServiceTotal, pasMpsTotal, smaTotal, merFee, soaFee]);

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
    useEstimate,
    setUseEstimate,
    hasPAS,
    setHasPAS,
    hasMPS,
    setHasMPS,
    pasItems,
    mpsItems,
    addPASItem,
    removePASItem,
    updatePASItem,
    addMPSItem,
    removeMPSItem,
    updateMPSItem,
    pasMpsTotal,
    applicableMinimum,
    documentServices,
    toggleDocumentService,
    updateServiceQuantity,
    feeBreakdown,
    smsfFees,
    documentServiceTotal,
    smaStatus,
    setSmaStatus,
    smaAccountCount,
    setSmaAccountCount,
    smaInvestedAmount,
    setSmaInvestedAmount,
    smaUseAutoEstimate,
    setSmaUseAutoEstimate,
    smaFees,
    smaTotal,
    includeMER,
    setIncludeMER,
    merKnown,
    setMerKnown,
    merPercentage,
    setMerPercentage,
    merFee,
    includeSOA,
    setIncludeSOA,
    soaAmount,
    setSoaAmount,
    soaDiscount,
    setSoaDiscount,
    soaFee,
    totalFees,
    calculateTieredFee,
  };
}
