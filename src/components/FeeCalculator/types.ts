export interface Portfolio {
  id: string;
  name: string;
  balance: number;
  acceleratorBalance: number;
}

export type ContributionType = 'rollover' | 'ncc' | 'concessional';

export interface Contribution {
  id: string;
  type: ContributionType;
  amount: number;
  div293Applicable: boolean | null; // Only relevant for concessional
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
  minimumApplied: boolean;
  minimumAmount: number;
}

export interface FeeTier {
  min: number;
  max: number;
  rate: number;
}

export interface PASMPSItem {
  id: string;
  isNew: boolean | null;
}

export interface PASMPSFees {
  pasNew: number;
  pasExisting: number;
  mpsNew: number;
  mpsExisting: number;
}

// PAS/MPS fees per account
export const DEFAULT_PASMPS_FEES: PASMPSFees = {
  pasNew: 792,        // $792 total ($317 Shaw, $475 BPF)
  pasExisting: 607.2, // $607.20 total ($243 Shaw, $364 BPF)
  mpsNew: 792,        // Same as PAS
  mpsExisting: 607.2, // Same as PAS
};

// Minimum advice fees when PAS/MPS is active
export interface MinimumFees {
  existing: number;
  pasNew: number;
  mpsNew: number;
}

export const MINIMUM_ADVICE_FEES: MinimumFees = {
  existing: 3600,    // $3,600 for existing PAS or MPS
  pasNew: 4675,      // $4,675 for new PAS
  mpsNew: 5472.5,    // $5,472.50 for new MPS
};

export type Administrator = 'heffron' | 'ryans' | 'other' | null;

export const SHAW_SPLIT = 0.4;
export const BPF_SPLIT = 0.6;

export const HEFFRON_SMSF_FEES: SMSFFees = {
  administrationFee: 2010,
  auditFee: 585,
  asicAgentFee: 210,
};

export const RYANS_SMSF_FEES: SMSFFees = {
  administrationFee: 1800,
  auditFee: 550,
  asicAgentFee: 200,
};

export const DOCUMENT_SERVICES: DocumentService[] = [
  { id: 'smsf-establishment', name: 'SMSF Establishment Service', fee: 550, selected: false, quantity: 1 },
  { id: 'trustee-company', name: 'SMSF Trustee Company Establishment', fee: 990, selected: false, quantity: 1 },
  { id: 'pension-establishment', name: 'Pension Establishment', fee: 330, selected: false, quantity: 1 },
  { id: 'pension-commutation', name: 'Full/Partial Pension Commutation', fee: 330, selected: false, quantity: 1 },
  { id: 'lump-sum', name: 'Lump Sum from Accumulation', fee: 165, selected: false, quantity: 1 },
  { id: 'contribution-splitting', name: 'Contribution Splitting', fee: 165, selected: false, quantity: 1 },
];
