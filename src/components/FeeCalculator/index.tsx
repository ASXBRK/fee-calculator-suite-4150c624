import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Calculator } from 'lucide-react';
import { useCalculator } from './useCalculator';
import { PortfolioInput } from './PortfolioInput';
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

  // Check if portfolio has been filled (balance > 0)
  const hasPortfolioBalance = portfolios.some(p => p.balance > 0);

  // Check if fee tiers have been configured
  const hasTierConfiguration = tierRates.some(r => r > 0);

  // Check if SMSF question has been answered
  const hasSMSFAnswer = isSMSF !== null;
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

            {/* Step 2: Portfolio Balances - Show after tier config */}
            {hasTierConfiguration && <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Portfolio Balances
                  </h2>
                  <Button variant="outline" size="sm" onClick={addPortfolio} className="border-primary/30 text-primary hover:bg-primary/5">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Portfolio
                  </Button>
                </div>

                <div className="space-y-4">
                  {portfolios.map(portfolio => <PortfolioInput key={portfolio.id} portfolio={portfolio} onUpdate={updatePortfolio} onRemove={removePortfolio} canRemove={portfolios.length > 1} />)}
                </div>
              </Card>}

            {/* Step 3: SMSF - Show after portfolio balance entered */}
            {hasTierConfiguration && hasPortfolioBalance && <SMSFFeesCard isSMSF={isSMSF} setIsSMSF={setIsSMSF} administrator={administrator} setAdministrator={setAdministrator} fees={smsfFees} />}

            {/* Step 4: Document Services - Only show if Heffron is selected */}
            {hasTierConfiguration && hasPortfolioBalance && hasSMSFAnswer && administrator === 'heffron' && <DocumentServicesCard services={documentServices} onToggle={toggleDocumentService} onQuantityChange={updateServiceQuantity} total={documentServiceTotal} />}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-8 space-y-6">
              <FeeBreakdownCard breakdown={feeBreakdown} />
              {hasPortfolioBalance && <TotalFeesCard ongoingFee={feeBreakdown.ongoingFeeAmount} smsfFees={smsfFees?.total || 0} documentServices={documentServiceTotal} total={totalFees} />}
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