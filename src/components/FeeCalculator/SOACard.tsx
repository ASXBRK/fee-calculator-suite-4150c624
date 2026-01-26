import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SHAW_SPLIT, BPF_SPLIT } from './types';

interface SOACardProps {
  includeSOA: boolean | null;
  setIncludeSOA: (value: boolean) => void;
  soaAmount: number;
  setSoaAmount: (value: number) => void;
  soaDiscount: number;
  setSoaDiscount: (value: number) => void;
  soaFee: number;
}

export function SOACard({
  includeSOA,
  setIncludeSOA,
  soaAmount,
  setSoaAmount,
  soaDiscount,
  setSoaDiscount,
  soaFee,
}: SOACardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const discountOptions = [
    { value: '0', label: '0% (No discount)' },
    { value: '25', label: '25%' },
    { value: '50', label: '50%' },
    { value: '75', label: '75%' },
  ];

  return (
    <Card className="p-6 shadow-card border-0 animate-slide-up">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">
        Statement of Advice (SOA) Fee
      </h3>

      {/* Include SOA Question */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Include SOA fee?</Label>
        <div className="flex gap-3">
          <button
            onClick={() => setIncludeSOA(true)}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              includeSOA === true
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">Yes</span>
          </button>
          <button
            onClick={() => setIncludeSOA(false)}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              includeSOA === false
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="font-medium">No</span>
          </button>
        </div>
      </div>

      {/* SOA Amount and Discount */}
      {includeSOA === true && (
        <div className="mt-6 pt-6 border-t border-border space-y-6 animate-slide-up">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label>SOA Fee Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                step="100"
                value={soaAmount || ''}
                onChange={(e) => setSoaAmount(parseFloat(e.target.value) || 0)}
                className="pl-8"
                placeholder="0"
              />
            </div>
          </div>

          {/* Discount Dropdown */}
          <div className="space-y-2">
            <Label>Discount</Label>
            <Select
              value={soaDiscount.toString()}
              onValueChange={(value) => setSoaDiscount(parseInt(value))}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select discount" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {discountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Calculation Display */}
          {soaAmount > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 animate-slide-up">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Base SOA Fee</span>
                <span className="font-medium">{formatCurrency(soaAmount)}</span>
              </div>
              {soaDiscount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Discount ({soaDiscount}%)</span>
                  <span className="font-medium text-destructive">-{formatCurrency(soaAmount * (soaDiscount / 100))}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium">Final SOA Fee</span>
                <span className="text-lg font-semibold text-primary">{formatCurrency(soaFee)}</span>
              </div>
            </div>
          )}

          {/* Fee Split */}
          {soaFee > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Shaw & Partners (40%)</p>
                <p className="text-lg font-semibold text-primary">{formatCurrency(soaFee * SHAW_SPLIT)}</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">BPF Wealth Group (60%)</p>
                <p className="text-lg font-semibold text-accent-foreground">{formatCurrency(soaFee * BPF_SPLIT)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
