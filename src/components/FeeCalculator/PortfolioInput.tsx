import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Portfolio } from './types';

interface PortfolioInputProps {
  portfolio: Portfolio;
  onUpdate: (id: string, updates: Partial<Portfolio>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  showAccelerator: boolean;
}

export function PortfolioInput({ portfolio, onUpdate, onRemove, canRemove, showAccelerator }: PortfolioInputProps) {
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onUpdate(portfolio.id, { balance: parseInt(value) || 0 });
  };

  const handleAcceleratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onUpdate(portfolio.id, { acceleratorBalance: parseInt(value) || 0 });
  };

  return (
    <div className="flex items-center gap-3 animate-fade-in">
      <Input
        type="text"
        value={portfolio.name}
        onChange={(e) => onUpdate(portfolio.id, { name: e.target.value })}
        className="w-32 bg-card border-border"
        placeholder="Portfolio name"
      />
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input
          type="text"
          value={portfolio.balance.toLocaleString()}
          onChange={handleBalanceChange}
          className="pl-7 bg-card border-border text-right font-medium"
          placeholder="Total value"
        />
      </div>
      {showAccelerator && (
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="text"
            value={portfolio.acceleratorBalance.toLocaleString()}
            onChange={handleAcceleratorChange}
            className="pl-7 bg-card border-border text-right font-medium"
            placeholder="Accelerator"
          />
        </div>
      )}
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
