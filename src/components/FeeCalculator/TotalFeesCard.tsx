import { Card } from '@/components/ui/card';

interface TotalFeesCardProps {
  ongoingFee: number;
  smsfFees: number;
  documentServices: number;
  pasMps?: number;
  sma?: number;
  mer?: number;
  soa?: number;
  total: number;
}

export function TotalFeesCard({ ongoingFee, smsfFees, documentServices, pasMps = 0, sma = 0, mer = 0, soa = 0, total }: TotalFeesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 gradient-primary text-primary-foreground shadow-card border-0 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <h3 className="font-display text-xl font-semibold mb-6">Total Annual Fees</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-primary-foreground/80">
            <span>Ongoing Advice Fee</span>
            <span>{formatCurrency(ongoingFee)}</span>
          </div>
          {smsfFees > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>SMSF Fees</span>
              <span>{formatCurrency(smsfFees)}</span>
            </div>
          )}
          {documentServices > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>Document Services</span>
              <span>{formatCurrency(documentServices)}</span>
            </div>
          )}
          {pasMps > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>PAS/MPS Fees</span>
              <span>{formatCurrency(pasMps)}</span>
            </div>
          )}
          {sma > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>SMA Fees</span>
              <span>{formatCurrency(sma)}</span>
            </div>
          )}
          {mer > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>MER</span>
              <span>{formatCurrency(mer)}</span>
            </div>
          )}
          {soa > 0 && (
            <div className="flex justify-between items-center text-primary-foreground/80">
              <span>SOA Fee</span>
              <span>{formatCurrency(soa)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Grand Total</span>
            <span className="text-3xl font-bold animate-number-tick">
              {formatCurrency(total)}
            </span>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-1">per annum (inc. GST)</p>
        </div>
      </div>
    </Card>
  );
}
