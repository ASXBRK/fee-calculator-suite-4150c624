import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Input } from '@/components/ui/input';

interface FeeTierSettingsProps {
  isGstExcluding: boolean;
  setIsGstExcluding: (value: boolean) => void;
  numberOfTiers: number;
  setNumberOfTiers: (value: number) => void;
  tierRates: number[];
  updateTierRate: (index: number, rate: number) => void;
}

export function FeeTierSettings({
  isGstExcluding,
  setIsGstExcluding,
  numberOfTiers,
  setNumberOfTiers,
  tierRates,
  updateTierRate,
}: FeeTierSettingsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTierLabel = (index: number) => {
    if (index === 0) return `First ${formatCurrency(1000000)}`;
    if (index === numberOfTiers - 1) return `Above ${formatCurrency(index * 1000000)}`;
    return `${formatCurrency(index * 1000000)} - ${formatCurrency((index + 1) * 1000000)}`;
  };

  return (
    <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">Fee Structure Settings</h3>
      
      {/* GST Toggle */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
        <div>
          <Label className="text-foreground font-medium">Fee Rate</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {isGstExcluding ? 'Excluding GST (will add 10%)' : 'Including GST'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${!isGstExcluding ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Inc GST
          </span>
          <Switch
            checked={isGstExcluding}
            onCheckedChange={setIsGstExcluding}
          />
          <span className={`text-sm ${isGstExcluding ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Ex GST
          </span>
        </div>
      </div>

      {/* Number of Tiers Switch */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
        <div>
          <Label className="text-foreground font-medium">Number of Tiers</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {numberOfTiers === 2 ? '2 tiers (up to $1M, above $1M)' : '3 tiers (up to $1M, $1M-$2M, above $2M)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${numberOfTiers === 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            2 Tiers
          </span>
          <Switch
            checked={numberOfTiers === 3}
            onCheckedChange={(checked) => setNumberOfTiers(checked ? 3 : 2)}
          />
          <span className={`text-sm ${numberOfTiers === 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            3 Tiers
          </span>
        </div>
      </div>

      {/* Tier Rate Inputs */}
      <div className="space-y-4">
        <Label className="text-foreground font-medium">Fee Rates (%)</Label>
        {Array.from({ length: numberOfTiers }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 animate-fade-in">
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">{getTierLabel(index)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={tierRates[index]}
                onChange={(e) => updateTierRate(index, parseFloat(e.target.value) || 0)}
                className="w-24 text-right"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        ))}
        {isGstExcluding && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            * Rates will be multiplied by 1.1 to include GST in calculations
          </p>
        )}
      </div>
    </Card>
  );
}
