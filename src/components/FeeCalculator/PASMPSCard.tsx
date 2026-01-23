import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { PASMPSItem } from './types';

interface PASMPSCardProps {
  hasPAS: boolean;
  setHasPAS: (value: boolean) => void;
  hasMPS: boolean;
  setHasMPS: (value: boolean) => void;
  pasItems: PASMPSItem[];
  mpsItems: PASMPSItem[];
  addPASItem: () => void;
  removePASItem: (id: string) => void;
  updatePASItem: (id: string, isNew: boolean) => void;
  addMPSItem: () => void;
  removeMPSItem: (id: string) => void;
  updateMPSItem: (id: string, isNew: boolean) => void;
  pasMpsTotal: number;
}

export function PASMPSCard({
  hasPAS,
  setHasPAS,
  hasMPS,
  setHasMPS,
  pasItems,
  mpsItems,
  addPASItem,
  removePASItem,
  updatePASItem,
  addMPSItem,
  removeMPSItem,
  updateMPSItem,
  pasMpsTotal
}: PASMPSCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 gradient-card shadow-card border-border animate-fade-in">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">PAS / MPS</h3>

      {/* PAS/MPS Selection */}
      <div className="space-y-4 mb-6">
        <Label className="text-foreground font-medium block">Select applicable services:</Label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-pas"
              checked={hasPAS}
              onCheckedChange={(checked) => setHasPAS(checked === true)}
            />
            <Label htmlFor="has-pas" className="cursor-pointer">PAS (Portfolio Administration Service)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-mps"
              checked={hasMPS}
              onCheckedChange={(checked) => setHasMPS(checked === true)}
            />
            <Label htmlFor="has-mps" className="cursor-pointer">MPS (Managed Portfolio Service)</Label>
          </div>
        </div>
      </div>

      {/* PAS Items */}
      {hasPAS && (
        <div className="animate-fade-in pt-4 border-t border-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-foreground font-medium">PAS Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPASItem}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add PAS
            </Button>
          </div>
          <div className="space-y-3">
            {pasItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-foreground font-medium">PAS {index + 1}</span>
                <div className="flex items-center gap-4">
                  <RadioGroup
                    value={item.isNew === null ? '' : item.isNew ? 'new' : 'existing'}
                    onValueChange={(value) => updatePASItem(item.id, value === 'new')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id={`pas-${item.id}-new`} />
                      <Label htmlFor={`pas-${item.id}-new`} className="cursor-pointer text-sm">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id={`pas-${item.id}-existing`} />
                      <Label htmlFor={`pas-${item.id}-existing`} className="cursor-pointer text-sm">Existing</Label>
                    </div>
                  </RadioGroup>
                  {pasItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePASItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MPS Items */}
      {hasMPS && (
        <div className="animate-fade-in pt-4 border-t border-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-foreground font-medium">MPS Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMPSItem}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add MPS
            </Button>
          </div>
          <div className="space-y-3">
            {mpsItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-foreground font-medium">MPS {index + 1}</span>
                <div className="flex items-center gap-4">
                  <RadioGroup
                    value={item.isNew === null ? '' : item.isNew ? 'new' : 'existing'}
                    onValueChange={(value) => updateMPSItem(item.id, value === 'new')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id={`mps-${item.id}-new`} />
                      <Label htmlFor={`mps-${item.id}-new`} className="cursor-pointer text-sm">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id={`mps-${item.id}-existing`} />
                      <Label htmlFor={`mps-${item.id}-existing`} className="cursor-pointer text-sm">Existing</Label>
                    </div>
                  </RadioGroup>
                  {mpsItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMPSItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      {(hasPAS || hasMPS) && pasMpsTotal > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-border animate-fade-in">
          <span className="font-medium text-foreground">Total PAS/MPS Fees</span>
          <span className="text-lg font-semibold text-primary">{formatCurrency(pasMpsTotal)} p.a.</span>
        </div>
      )}

      {!hasPAS && !hasMPS && (
        <p className="text-sm text-muted-foreground">
          Select PAS or MPS if applicable to your portfolio.
        </p>
      )}
    </Card>
  );
}