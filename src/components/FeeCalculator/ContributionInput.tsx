import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Contribution, ContributionType } from './types';

interface ContributionInputProps {
  contribution: Contribution;
  onUpdate: (id: string, updates: Partial<Contribution>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export function ContributionInput({ contribution, onUpdate, onRemove, canRemove }: ContributionInputProps) {
  const handleTypeChange = (type: ContributionType) => {
    onUpdate(contribution.id, { 
      type, 
      div293Applicable: type === 'concessional' ? null : null 
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    onUpdate(contribution.id, { amount: parseInt(value) || 0 });
  };

  const formatValue = (value: number) => {
    if (value === 0) return '';
    return value.toLocaleString('en-AU');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select value={contribution.type} onValueChange={(v) => handleTypeChange(v as ContributionType)}>
          <SelectTrigger className="w-48 border-border/50 focus:ring-primary/20">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="rollover">Rollover</SelectItem>
            <SelectItem value="ncc">Non-concessional</SelectItem>
            <SelectItem value="concessional">Concessional</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          value={formatValue(contribution.amount)}
          onChange={handleAmountChange}
          className="flex-1 text-right border-border/50 focus:ring-primary/20"
          placeholder="0"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(contribution.id)}
          disabled={!canRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {contribution.type === 'concessional' && (
        <div className="ml-0 pl-4 border-l-2 border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">Is Division 293 applicable?</p>
          <div className="flex gap-2">
            <Button
              variant={contribution.div293Applicable === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate(contribution.id, { div293Applicable: true })}
              className={contribution.div293Applicable === true ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
            >
              Yes (70%)
            </Button>
            <Button
              variant={contribution.div293Applicable === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate(contribution.id, { div293Applicable: false })}
              className={contribution.div293Applicable === false ? '' : 'border-primary/30 text-primary hover:bg-primary/5'}
            >
              No (85%)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}