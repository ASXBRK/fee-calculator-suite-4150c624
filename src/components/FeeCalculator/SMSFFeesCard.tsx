import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Administrator, SMSFFees } from './types';

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
  customFees: SMSFFees;
  setCustomFees: (fees: SMSFFees) => void;
}

export function SMSFFeesCard({ 
  isSMSF, 
  setIsSMSF, 
  administrator, 
  setAdministrator, 
  fees,
  customFees,
  setCustomFees 
}: SMSFFeesCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCustomFeeChange = (field: keyof SMSFFees, value: string) => {
    const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    setCustomFees({ ...customFees, [field]: numValue });
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

      {/* Fee Breakdown for Heffron/Ryans - Display only */}
      {isSMSF === true && administrator && administrator !== 'other' && fees && fees.total > 0 && (
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

      {/* Fee Breakdown for Other - Editable inputs */}
      {isSMSF === true && administrator === 'other' && (
        <div className="space-y-4 animate-fade-in mt-6 pt-4 border-t border-border">
          <div className="flex justify-between items-center gap-4">
            <Label className="text-muted-foreground whitespace-nowrap">Administration Fee</Label>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="text"
                value={customFees.administrationFee || ''}
                onChange={(e) => handleCustomFeeChange('administrationFee', e.target.value)}
                className="pl-7 text-right"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Label className="text-muted-foreground whitespace-nowrap">Audit Fee</Label>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="text"
                value={customFees.auditFee || ''}
                onChange={(e) => handleCustomFeeChange('auditFee', e.target.value)}
                className="pl-7 text-right"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <Label className="text-muted-foreground whitespace-nowrap">ASIC Agent - Special Purpose</Label>
            <div className="relative w-40">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="text"
                value={customFees.asicAgentFee || ''}
                onChange={(e) => handleCustomFeeChange('asicAgentFee', e.target.value)}
                className="pl-7 text-right"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="font-medium text-foreground">Total SMSF Fees</span>
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(customFees.administrationFee + customFees.auditFee + customFees.asicAgentFee)} p.a.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
