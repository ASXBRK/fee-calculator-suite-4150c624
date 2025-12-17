import { Card } from '@/components/ui/card';
import { FEE_TIERS } from './types';

export function FeeTierInfo() {
  const formatCurrency = (value: number) => {
    if (value === Infinity) return '∞';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-5 bg-secondary/50 border-border">
      <h4 className="text-sm font-medium text-foreground mb-3">Fee Structure</h4>
      <div className="space-y-2">
        {FEE_TIERS.map((tier, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(tier.min)} – {tier.max === Infinity ? 'above' : formatCurrency(tier.max)}
            </span>
            <span className="font-medium text-primary">
              {(tier.rate * 100).toFixed(2)}% p.a.
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        * All fees include GST
      </p>
    </Card>
  );
}
