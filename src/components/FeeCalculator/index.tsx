import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Calculator, Download } from 'lucide-react';
import { useCalculator } from './useCalculator';
import { useExcelExport } from './useExcelExport';
import { PortfolioInput } from './PortfolioInput';
import { ContributionInput } from './ContributionInput';
import { FeeBreakdownCard } from './FeeBreakdownCard';
import { SMSFFeesCard } from './SMSFFeesCard';
import { DocumentServicesCard } from './DocumentServicesCard';
import { TotalFeesCard } from './TotalFeesCard';
import { FeeTierSettings } from './FeeTierSettings';

export function FeeCalculator() {
  const {
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
    totalFees
  } = useCalculator();

  const { exportToExcel } = useExcelExport();

  const handleExport = () => {
    exportToExcel({
      portfolios,
      contributions,
      contributionTotals,
      portfolioTotals,
      chargeAcceleratorFees,
      feeBreakdown,
      smsfFees,
      documentServices,
      documentServiceTotal,
      totalFees,
      tierRates,
      numberOfTiers,
      isGstExcluding,
      isSMSF,
      administrator
    });
  };

  // Check if fee tiers have been configured
  const hasTierConfiguration = tierRates.some(r => r > 0);
  
  // Check if accelerator question has been answered
  const hasAcceleratorAnswer = chargeAcceleratorFees !== null;
  
  // Show accelerator input if answered "No" (fees NOT charged on accelerator)
  const showAcceleratorInput = chargeAcceleratorFees === false;

  // Check if contributions are complete (all concessional have div293 answered)
  const contributionsComplete = contributions.every(c => 
    c.type !== 'concessional' || c.div293Applicable !== null
  );
  const hasContributionAmount = contributions.some(c => c.amount > 0);

  // Check if portfolio has been filled (balance > 0)
  const hasPortfolioBalance = portfolios.some(p => p.balance > 0);

  // Check if SMSF question has been answered
  const hasSMSFAnswer = isSMSF !== null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Calculator className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">​</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">BPF Fee Calculator</h1>
          <p className="text-lg text-primary-foreground/80 max-w-xl">
        </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Fee Structure Settings */}
            <FeeTierSettings isGstExcluding={isGstExcluding} setIsGstExcluding={setIsGstExcluding} numberOfTiers={numberOfTiers} setNumberOfTiers={setNumberOfTiers} tierRates={tierRates} updateTierRate={updateTierRate} />

            {/* Step 2: Accelerator Balance Question - Show after tier config */}
            {hasTierConfiguration && (
              <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
                <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                  Are fees charged on Accelerator balances?
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant={chargeAcceleratorFees === true ? 'default' : 'outline'}
                    onClick={() => setChargeAcceleratorFees(true)}
                    className={chargeAcceleratorFees === true ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={chargeAcceleratorFees === false ? 'default' : 'outline'}
                    onClick={() => setChargeAcceleratorFees(false)}
                    className={chargeAcceleratorFees === false ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
                  >
                    No
                  </Button>
                </div>
                {chargeAcceleratorFees === false && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Fees will be charged on total portfolio value less Accelerator balance
                  </p>
                )}
              </Card>
            )}

            {/* Step 3: Rollovers & Contributions - Show after accelerator question answered */}
            {hasTierConfiguration && hasAcceleratorAnswer && (
              <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Rollovers & Contributions
                  </h2>
                  <Button variant="outline" size="sm" onClick={addContribution} className="border-primary/30 text-primary hover:bg-primary/5">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="space-y-4">
                  {contributions.map(contribution => (
                    <ContributionInput
                      key={contribution.id}
                      contribution={contribution}
                      onUpdate={updateContribution}
                      onRemove={removeContribution}
                      canRemove={contributions.length > 1}
                    />
                  ))}
                </div>

                {/* Contribution totals */}
                {hasContributionAmount && (
                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Contributions</span>
                      <span className="font-medium text-foreground">{formatCurrency(contributionTotals.totalContributions)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-foreground">Feeable Amount</span>
                      <span className="text-primary">{formatCurrency(contributionTotals.feeableContributions)}</span>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Step 4: Portfolio Balances - Show after contributions */}
            {hasTierConfiguration && hasAcceleratorAnswer && contributionsComplete && (
              <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Portfolio Balances
                  </h2>
                  <Button variant="outline" size="sm" onClick={addPortfolio} className="border-primary/30 text-primary hover:bg-primary/5">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portfolio
                  </Button>
                </div>

                {/* Column headers */}
                <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                  <div className="w-32">Name</div>
                  <div className="flex-1 text-right">Total Value</div>
                  {showAcceleratorInput && <div className="flex-1 text-right">Accelerator Balance</div>}
                  <div className="w-10"></div>
                </div>

                <div className="space-y-4">
                  {portfolios.map(portfolio => (
                    <PortfolioInput
                      key={portfolio.id}
                      portfolio={portfolio}
                      onUpdate={updatePortfolio}
                      onRemove={removePortfolio}
                      canRemove={portfolios.length > 1}
                      showAccelerator={showAcceleratorInput}
                    />
                  ))}
                </div>

                {/* Running totals */}
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Portfolio Value</span>
                    <span className="font-medium text-foreground">{formatCurrency(portfolioTotals.totalBalance)}</span>
                  </div>
                  {showAcceleratorInput && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Accelerator Balance</span>
                      <span className="font-medium text-foreground">{formatCurrency(portfolioTotals.totalAccelerator)}</span>
                    </div>
                  )}
                  {hasContributionAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Feeable Contributions</span>
                      <span className="font-medium text-foreground">{formatCurrency(contributionTotals.feeableContributions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total Feeable Balance</span>
                    <span className="text-primary">{formatCurrency(portfolioTotals.feeableBalance)}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 5: SMSF - Show after portfolio balance entered */}
            {hasTierConfiguration && hasAcceleratorAnswer && contributionsComplete && hasPortfolioBalance && (
              <SMSFFeesCard isSMSF={isSMSF} setIsSMSF={setIsSMSF} administrator={administrator} setAdministrator={setAdministrator} fees={smsfFees} />
            )}

            {/* Step 5: Document Services - Only show if Heffron is selected */}
            {hasTierConfiguration && hasAcceleratorAnswer && contributionsComplete && hasPortfolioBalance && hasSMSFAnswer && administrator === 'heffron' && (
              <DocumentServicesCard services={documentServices} onToggle={toggleDocumentService} onQuantityChange={updateServiceQuantity} total={documentServiceTotal} />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-8 space-y-6">
              <FeeBreakdownCard breakdown={feeBreakdown} />
              {hasPortfolioBalance && (
                <>
                  <TotalFeesCard 
                    ongoingFee={feeBreakdown.ongoingFeeAmount} 
                    smsfFees={smsfFees ? smsfFees.administrationFee + smsfFees.auditFee + smsfFees.asicAgentFee : 0} 
                    documentServices={documentServiceTotal} 
                    total={totalFees} 
                  />
                  <Button 
                    onClick={handleExport}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>All fees shown include GST. Fee calculations are estimates only.</p>
        </div>
      </footer>
    </div>;
}