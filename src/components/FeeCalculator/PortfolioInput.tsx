import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Portfolio } from './types';

interface PortfolioInputProps {
  portfolio: Portfolio;
  onUpdate: (id: string, updates: Partial<Portfolio>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function PortfolioInput({ portfolio, onUpdate, onRemove, canRemove }: PortfolioInputProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onUpdate(portfolio.id, { balance: parseInt(value) || 0 });
  };

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Input
        type="text"
        value={portfolio.name}
        onChange={(e) => onUpdate(portfolio.id, { name: e.target.value })}
        className="w-40 bg-card border-border"
        placeholder="Portfolio name"
      />
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input
          type="text"
          value={portfolio.balance.toLocaleString()}
          onChange={handleBalanceChange}
          className="pl-8 bg-card border-border text-right font-medium"
          placeholder="0"
        />
      </div>
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(portfolio.id)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
