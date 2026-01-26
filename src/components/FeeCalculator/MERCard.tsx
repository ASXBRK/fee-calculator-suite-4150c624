import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface MERCardProps {
  includeMER: boolean | null;
  setIncludeMER: (value: boolean) => void;
  merKnown: boolean;
  setMerKnown: (value: boolean) => void;
  merPercentage: number;
  setMerPercentage: (value: number) => void;
  merFee: number;
  totalBalance: number;
}

export function MERCard({
  includeMER,
  setIncludeMER,
  merKnown,
  setMerKnown,
  merPercentage,
  setMerPercentage,
  merFee,
  totalBalance,
}: MERCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const MER_ESTIMATE = 0.15; // 0.15%

  return (
    <Card className="p-6 shadow-card border-0 animate-slide-up">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">
        Management Expense Ratio (MER)
      </h3>

      {/* Include MER Question */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Include MER in fee calculation?</Label>
        <div className="flex gap-3">
          <button
            onClick={() => setIncludeMER(true)}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              includeMER === true
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">Yes</span>
          </button>
          <button
            onClick={() => setIncludeMER(false)}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              includeMER === false
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">No</span>
          </button>
        </div>
      </div>

      {/* MER Known/Estimate Question */}
      {includeMER === true && (
        <div className="mt-6 pt-6 border-t border-border space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">MER Percentage Known?</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Toggle on to enter exact MER, or use estimate
              </p>
            </div>
            <Switch
              checked={merKnown}
              onCheckedChange={setMerKnown}
            />
          </div>

          {merKnown ? (
            /* Manual MER Input */
            <div className="space-y-4 animate-slide-up">
              <Label>Enter MER Percentage</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={merPercentage || ''}
                  onChange={(e) => setMerPercentage(parseFloat(e.target.value) || 0)}
                  className="pr-8"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          ) : (
            /* Auto Estimate */
            <div className="bg-muted/50 rounded-lg p-4 animate-slide-up">
              <p className="text-sm font-medium text-foreground">Using Estimate: {MER_ESTIMATE}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 0.5% on 30% of the total balance
              </p>
            </div>
          )}

          {/* MER Fee Calculation Display */}
          {(merKnown ? merPercentage > 0 : true) && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 animate-slide-up">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Balance</span>
                <span className="font-medium">{formatBalance(totalBalance)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">MER Rate</span>
                <span className="font-medium">{merKnown ? merPercentage : MER_ESTIMATE}%</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium">Annual MER Fee</span>
                <span className="text-lg font-semibold text-primary">{formatCurrency(merFee)}</span>
              </div>
            </div>
          )}

          {/* Fee Recipient */}
          {merFee > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Fund Manager (100%)</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(merFee)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
