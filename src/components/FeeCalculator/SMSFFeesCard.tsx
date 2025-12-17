import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Administrator } from './types';

interface SMSFFeesCardProps {
  isSMSF: boolean | null;
  setIsSMSF: (value: boolean | null) => void;
  administrator: Administrator;
  setAdministrator: (value: Administrator) => void;
  fees: {
    administrationFee: number;
    auditFee: number;
    asicAgentFee: number;
    total: number;
  } | null;
}

export function SMSFFeesCard({ isSMSF, setIsSMSF, administrator, setAdministrator, fees }: SMSFFeesCardProps) {
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
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">SMSF</h3>

      {/* SMSF Yes/No Question */}
      <div className="mb-6">
        <Label className="text-foreground font-medium mb-3 block">Do you have an SMSF?</Label>
        <RadioGroup
          value={isSMSF === null ? '' : isSMSF ? 'yes' : 'no'}
          onValueChange={(value) => {
            setIsSMSF(value === 'yes');
            if (value === 'no') {
              setAdministrator(null);
            }
          }}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="smsf-yes" />
            <Label htmlFor="smsf-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="smsf-no" />
            <Label htmlFor="smsf-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Administrator Question - Only show if SMSF is Yes */}
      {isSMSF === true && (
        <div className="animate-fade-in pt-4 border-t border-border">
          <Label className="text-foreground font-medium mb-3 block">Who is the administrator?</Label>
          <RadioGroup
            value={administrator || ''}
            onValueChange={(value) => setAdministrator(value as Administrator)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="heffron" id="admin-heffron" />
              <Label htmlFor="admin-heffron" className="cursor-pointer">Heffron</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ryans" id="admin-ryans" />
              <Label htmlFor="admin-ryans" className="cursor-pointer">Ryans</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="admin-other" />
              <Label htmlFor="admin-other" className="cursor-pointer">Other</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Fee Breakdown - Only show if administrator is selected */}
      {isSMSF === true && administrator && fees && fees.total > 0 && (
        <div className="space-y-3 animate-fade-in mt-6 pt-4 border-t border-border">
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
      )}

      {isSMSF === true && administrator === 'other' && (
        <p className="text-sm text-muted-foreground mt-4 animate-fade-in">
          Please enter your administrator fees manually or contact us for assistance.
        </p>
      )}
    </Card>
  );
}
