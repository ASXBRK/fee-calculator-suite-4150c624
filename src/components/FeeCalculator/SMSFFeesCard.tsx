import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SMSFFeesCardProps {
  isSMSF: boolean;
  setIsSMSF: (value: boolean) => void;
  fees: {
    administrationFee: number;
    auditFee: number;
    asicAgentFee: number;
    total: number;
  } | null;
}

export function SMSFFeesCard({ isSMSF, setIsSMSF, fees }: SMSFFeesCardProps) {
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-semibold text-foreground">SMSF Fees</h3>
        <div className="flex items-center gap-3">
          <Label htmlFor="smsf-toggle" className="text-sm text-muted-foreground">
            Include SMSF
          </Label>
          <Switch
            id="smsf-toggle"
            checked={isSMSF}
            onCheckedChange={setIsSMSF}
          />
        </div>
      </div>

      {fees ? (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Administration Fee</span>
            <span className="font-medium text-foreground">{formatCurrency(fees.administrationFee)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Audit Fee</span>
            <span className="font-medium text-foreground">{formatCurrency(fees.auditFee)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">ASIC Agent - Special Purpose</span>
            <span className="font-medium text-foreground">{formatCurrency(fees.asicAgentFee)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="font-medium text-foreground">Total SMSF Fees</span>
            <span className="text-lg font-semibold text-primary">{formatCurrency(fees.total)} p.a.</span>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Enable SMSF to see fee breakdown</p>
      )}
    </Card>
  );
}
