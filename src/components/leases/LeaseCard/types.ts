export interface Lease {
  lease_id: number;
  asset_id: number;
  renter_id: number;
  asset_name: string;
  renter_name: string;
  start_date: string;
  end_date: string;
  lease_status: string;
  base_charge_amount: number;
  financial_status: string;
  next_payment_due: string;
  outstanding_balance: number;
  overdue_balance: number;
  intervals: any[];
  // Computed fields for UI
  id: number;
  assetId: number;
  renterId: number;
  assetName: string;
  renterName: string;
  startDate: string;
  endDate: string;
  leaseStatus: string;
  financialStatus: string;
  nextPaymentDue: string;
  outstandingBalance: number;
  overdueBalance: number;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export interface LeaseCardProps {
  lease: Lease;
  canEdit: boolean;
  onView: (lease: Lease) => void;
  onEdit: (lease: Lease) => void;
  onTerminate?: (lease: Lease) => void;
  onChargeBill?: (lease: Lease) => void;
  onRecordPayment?: (lease: Lease) => void;
}

export interface LeaseStatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  label: string;
}

export interface LeaseActionMenuProps {
  lease: Lease;
  canEdit: boolean;
  canTerminate: boolean;
  canChargeBill: boolean;
  onView: (lease: Lease) => void;
  onEdit: (lease: Lease) => void;
  onTerminate?: (lease: Lease) => void;
  onChargeBill?: (lease: Lease) => void;
  onRecordPayment?: (lease: Lease) => void;
}

export interface LeaseHeaderProps {
  lease: Lease;
  leaseConfig: LeaseStatusConfig;
  financialConfig: LeaseStatusConfig;
}

export interface LeaseFinancialInfoProps {
  lease: Lease;
}

export interface LeaseWarningsProps {
  lease: Lease;
}

export interface LeaseActionsProps {
  lease: Lease;
  canEdit: boolean;
  canTerminate: boolean;
  canChargeBill: boolean;
  onView: (lease: Lease) => void;
  onEdit: (lease: Lease) => void;
  onTerminate?: (lease: Lease) => void;
  onChargeBill?: (lease: Lease) => void;
  onRecordPayment?: (lease: Lease) => void;
}