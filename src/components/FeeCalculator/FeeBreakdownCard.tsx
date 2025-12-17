import { Card } from '@/components/ui/card';
import { FeeBreakdown as FeeBreakdownType } from './types';

interface FeeBreakdownCardProps {
  breakdown: FeeBreakdownType;
}

export function FeeBreakdownCard({ breakdown }: FeeBreakdownCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card className="p-6 gradient-card shadow-card border-border overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">Fee Summary</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <span className="text-muted-foreground">Total Balance</span>
          <span className="text-2xl font-semibold text-foreground animate-number-tick">
            {formatCurrency(breakdown.totalBalance)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Ongoing Fee Rate</span>
          <span className="text-lg font-medium text-primary">
            {formatPercent(breakdown.ongoingFeePercent)} p.a.
          </span>
        </div>

        <div className="flex justify-between items-center pb-4 border-b border-border">
          <span className="text-muted-foreground">Ongoing Fee Amount</span>
          <span className="text-lg font-medium text-foreground">
            {formatCurrency(breakdown.ongoingFeeAmount)} p.a.
          </span>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3">Fee Split</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Shaw and Partners (40%)</p>
              <p className="text-lg font-semibold text-primary">{formatCurrency(breakdown.shawAmount)}</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <p className="text-xs text-muted-foreground mb-1">BPF Wealth Group (60%)</p>
              <p className="text-lg font-semibold text-accent-foreground">{formatCurrency(breakdown.bpfAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
