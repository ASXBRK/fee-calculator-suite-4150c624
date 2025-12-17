export interface Portfolio {
  id: string;
  name: string;
  balance: number;
}

export interface DocumentService {
  id: string;
  name: string;
  fee: number;
  selected: boolean;
  quantity: number;
}

export interface SMSFFees {
  administrationFee: number;
  auditFee: number;
  asicAgentFee: number;
}

export interface FeeBreakdown {
  totalBalance: number;
  ongoingFeePercent: number;
  ongoingFeeAmount: number;
  shawAmount: number;
  bpfAmount: number;
}

export const FEE_TIERS = [
  { min: 0, max: 1000000, rate: 0.012 },
  { min: 1000001, max: Infinity, rate: 0.007 },
];

export const SHAW_SPLIT = 0.4;
export const BPF_SPLIT = 0.6;

export const DEFAULT_SMSF_FEES: SMSFFees = {
  administrationFee: 2010,
  auditFee: 585,
  asicAgentFee: 210,
};

export const DOCUMENT_SERVICES: DocumentService[] = [
  { id: 'smsf-establishment', name: 'SMSF Establishment Service', fee: 550, selected: false, quantity: 1 },
  { id: 'trustee-company', name: 'SMSF Trustee Company Establishment', fee: 990, selected: false, quantity: 1 },
  { id: 'pension-establishment', name: 'Pension Establishment', fee: 330, selected: false, quantity: 1 },
  { id: 'pension-commutation', name: 'Full/Partial Pension Commutation', fee: 330, selected: false, quantity: 1 },
  { id: 'lump-sum', name: 'Lump Sum from Accumulation', fee: 165, selected: false, quantity: 1 },
  { id: 'contribution-splitting', name: 'Contribution Splitting', fee: 165, selected: false, quantity: 1 },
];
