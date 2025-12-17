import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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

      {/* Number of Tiers Slider */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-foreground font-medium">Number of Tiers</Label>
          <span className="text-lg font-semibold text-primary">{numberOfTiers}</span>
        </div>
        <Slider
          value={[numberOfTiers]}
          onValueChange={(value) => setNumberOfTiers(value[0])}
          min={2}
          max={3}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>2 Tiers</span>
          <span>3 Tiers</span>
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
