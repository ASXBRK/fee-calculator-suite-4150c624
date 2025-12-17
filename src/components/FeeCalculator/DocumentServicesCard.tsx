import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DocumentService } from './types';

interface DocumentServicesCardProps {
  services: DocumentService[];
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  total: number;
}

export function DocumentServicesCard({ services, onToggle, onQuantityChange, total }: DocumentServicesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 gradient-card shadow-card border-border">
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">Document Services</h3>
      
      <div className="space-y-3">
        {services.map((service) => (
          <div 
            key={service.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
              service.selected ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={service.id}
                checked={service.selected}
                onCheckedChange={() => onToggle(service.id)}
              />
              <label 
                htmlFor={service.id}
                className="text-sm cursor-pointer text-foreground"
              >
                {service.name}
              </label>
            </div>
            <div className="flex items-center gap-3">
              {service.selected && (
                <Input
                  type="number"
                  min="1"
                  value={service.quantity}
                  onChange={(e) => onQuantityChange(service.id, parseInt(e.target.value) || 1)}
                  className="w-16 h-8 text-center bg-card border-border"
                />
              )}
              <span className="text-sm font-medium text-muted-foreground w-20 text-right">
                {formatCurrency(service.fee)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
        <span className="font-medium text-foreground">Total Document Services</span>
        <span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span>
      </div>
    </Card>
  );
}
