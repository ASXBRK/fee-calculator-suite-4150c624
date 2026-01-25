import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus } from 'lucide-react';
import { SMAStatus, SMA_EXISTING_FEES } from './types';

interface SMACardProps {
  smaStatus: SMAStatus;
  setSmaStatus: (status: SMAStatus) => void;
  smaAccountCount: number;
  setSmaAccountCount: (count: number) => void;
  smaInvestedAmount: number;
  setSmaInvestedAmount: (amount: number) => void;
  useAutoEstimate: boolean;
  setUseAutoEstimate: (use: boolean) => void;
  totalBalance: number;
  smaFees: {
    administrationFee: number;
    administrationPercent: number;
    accountKeepingFee: number;
    expenseRecoveryFee: number;
    total: number;
    accountCount: number;
  } | null;
}

export function SMACard({
  smaStatus,
  setSmaStatus,
  smaAccountCount,
  setSmaAccountCount,
  smaInvestedAmount,
  setSmaInvestedAmount,
  useAutoEstimate,
  setUseAutoEstimate,
  totalBalance,
  smaFees,
}: SMACardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyWithDecimals = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setSmaInvestedAmount(parseInt(numericValue) || 0);
  };

  const estimatedAmount = Math.round(totalBalance * 0.2);

  return (
    <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
      <h3 className="font-display text-xl font-semibold text-foreground mb-4">
        Shaw SMA
      </h3>
      
      {/* Status Selection */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={smaStatus === 'na' ? 'default' : 'outline'}
          onClick={() => setSmaStatus('na')}
          className={smaStatus === 'na' ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
        >
          N/A
        </Button>
        <Button
          variant={smaStatus === 'new' ? 'default' : 'outline'}
          onClick={() => setSmaStatus('new')}
          className={smaStatus === 'new' ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
        >
          New
        </Button>
        <Button
          variant={smaStatus === 'existing' ? 'default' : 'outline'}
          onClick={() => setSmaStatus('existing')}
          className={smaStatus === 'existing' ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
        >
          Existing
        </Button>
      </div>

      {/* Existing SMA */}
      {smaStatus === 'existing' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">
              How many SMA accounts?
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSmaAccountCount(Math.max(1, smaAccountCount - 1))}
                disabled={smaAccountCount <= 1}
                className="h-10 w-10 border-primary/30"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-semibold w-12 text-center">{smaAccountCount}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSmaAccountCount(smaAccountCount + 1)}
                className="h-10 w-10 border-primary/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-sm font-medium text-foreground px-4 py-3">FEES</th>
                  <th className="text-center text-sm font-medium text-foreground px-4 py-3">% P.A.</th>
                  <th className="text-right text-sm font-medium text-foreground px-4 py-3">$ P.A.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="text-sm text-foreground px-4 py-3">Managed Fund Custody</td>
                  <td className="text-sm text-muted-foreground text-center px-4 py-3">Fixed</td>
                  <td className="text-sm text-foreground text-right px-4 py-3">
                    {formatCurrency(SMA_EXISTING_FEES.managedFundCustody)}
                    {smaAccountCount > 1 && <span className="text-muted-foreground ml-1">x{smaAccountCount}</span>}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="text-sm text-foreground px-4 py-3">Account Keeping Fee</td>
                  <td className="text-sm text-muted-foreground text-center px-4 py-3">Fixed</td>
                  <td className="text-sm text-foreground text-right px-4 py-3">
                    {formatCurrency(SMA_EXISTING_FEES.accountKeepingFee)}
                    {smaAccountCount > 1 && <span className="text-muted-foreground ml-1">x{smaAccountCount}</span>}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="text-sm text-foreground px-4 py-3">Expense Recovery Fee</td>
                  <td className="text-sm text-muted-foreground text-center px-4 py-3">Fixed</td>
                  <td className="text-sm text-foreground text-right px-4 py-3">
                    up to {formatCurrency(SMA_EXISTING_FEES.expenseRecoveryFee)}
                    {smaAccountCount > 1 && <span className="text-muted-foreground ml-1">x{smaAccountCount}</span>}
                  </td>
                </tr>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="text-sm font-semibold text-foreground px-4 py-3">Total</td>
                  <td className="px-4 py-3"></td>
                  <td className="text-sm font-semibold text-primary text-right px-4 py-3">
                    {smaFees ? formatCurrency(smaFees.total) : formatCurrency(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fee Recipient */}
          {smaFees && smaFees.total > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Praemium (100%)</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrencyWithDecimals(smaFees.total)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New SMA */}
      {smaStatus === 'new' && (
        <div className="space-y-6 animate-fade-in">
          {/* Account Count */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">
              How many SMA accounts?
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSmaAccountCount(Math.max(1, smaAccountCount - 1))}
                disabled={smaAccountCount <= 1}
                className="h-10 w-10 border-primary/30"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-semibold w-12 text-center">{smaAccountCount}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSmaAccountCount(smaAccountCount + 1)}
                className="h-10 w-10 border-primary/30"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Amount Invested */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">
              Amount Invested (householded)
            </Label>
            
            <div className="flex items-center gap-3 mb-3">
              <Switch
                id="auto-estimate"
                checked={useAutoEstimate}
                onCheckedChange={setUseAutoEstimate}
              />
              <Label htmlFor="auto-estimate" className="text-sm text-foreground cursor-pointer">
                Use automatic estimate (20% of total balance = {formatCurrency(estimatedAmount)})
              </Label>
            </div>

            {!useAutoEstimate && (
              <Input
                type="text"
                value={smaInvestedAmount > 0 ? formatCurrency(smaInvestedAmount) : ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="$0"
                className="text-right font-medium"
              />
            )}
          </div>

          {/* Fee Breakdown Table */}
          {(useAutoEstimate || smaInvestedAmount > 0) && smaFees && (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left text-sm font-medium text-foreground px-4 py-3">FEES</th>
                    <th className="text-center text-sm font-medium text-foreground px-4 py-3">% P.A.</th>
                    <th className="text-right text-sm font-medium text-foreground px-4 py-3">$ P.A.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="text-sm text-foreground px-4 py-3">Administration Fee (tiered)</td>
                    <td className="text-sm text-muted-foreground text-center px-4 py-3">{smaFees.administrationPercent.toFixed(2)}%</td>
                    <td className="text-sm text-foreground text-right px-4 py-3">
                      {formatCurrencyWithDecimals(smaFees.administrationFee)}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="text-sm text-foreground px-4 py-3">Account Keeping Fee</td>
                    <td className="text-sm text-muted-foreground text-center px-4 py-3">Fixed</td>
                    <td className="text-sm text-foreground text-right px-4 py-3">
                      {formatCurrency(smaFees.accountKeepingFee)}
                      {smaAccountCount > 1 && <span className="text-muted-foreground ml-1">x{smaAccountCount}</span>}
                    </td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="text-sm text-foreground px-4 py-3">Expense Recovery Fee</td>
                    <td className="text-sm text-muted-foreground text-center px-4 py-3">Fixed</td>
                    <td className="text-sm text-foreground text-right px-4 py-3">
                      up to {formatCurrency(smaFees.expenseRecoveryFee / smaAccountCount)}
                      {smaAccountCount > 1 && <span className="text-muted-foreground ml-1">x{smaAccountCount}</span>}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="text-sm font-semibold text-foreground px-4 py-3">Total</td>
                    <td className="px-4 py-3"></td>
                    <td className="text-sm font-semibold text-primary text-right px-4 py-3">
                      {formatCurrencyWithDecimals(smaFees.total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Fee Recipient */}
          {smaFees && smaFees.total > 0 && (useAutoEstimate || smaInvestedAmount > 0) && (
            <div className="pt-4 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Praemium (100%)</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrencyWithDecimals(smaFees.total)}</p>
              </div>
            </div>
          )}

          {/* Tier Reference */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Shaw SMA – Administration Fee Tiered</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">$0 - $250,000</span>
              <span className="text-foreground text-right">0.27%</span>
              <span className="text-muted-foreground">$250,001 - $500,000</span>
              <span className="text-foreground text-right">0.20%</span>
              <span className="text-muted-foreground">$500,001 - $1,000,000</span>
              <span className="text-foreground text-right">0.11%</span>
              <span className="text-muted-foreground">$1,000,001 and above</span>
              <span className="text-foreground text-right">0.00%</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
