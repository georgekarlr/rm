export interface ViewLeaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lease: any | null; // Using any for now, should be typed based on your Lease interface
  onEdit?: (lease: any) => void;
  onTerminate?: (lease: any) => void;
  onChargeBill?: (lease: any) => void;
  onRecordPayment?: (lease: any) => void;
}

export interface LeaseInterval {
  id: string;
  intervalNumber: number;
  startDateTime: Date;
  endDateTime: Date;
  duration: string;
  chargeAmount: number;
  status: 'upcoming' | 'current' | 'completed' | 'overdue';
  isPaid: boolean;
  dueDate: Date;
}

export interface LeaseDetailsHeaderProps {
  lease: any;
  onClose: () => void;
}

export interface LeaseBasicInfoProps {
  lease: any;
}

export interface LeaseFinancialSummaryProps {
  lease: any;
}

export interface LeaseIntervalsListProps {
  lease: any;
  intervals: LeaseInterval[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export interface LeaseActionsBarProps {
  lease: any;
  canEdit: boolean;
  canTerminate: boolean;
  canChargeBill: boolean;
  onEdit?: (lease: any) => void;
  onTerminate?: (lease: any) => void;
  onChargeBill?: (lease: any) => void;
  onRecordPayment?: (lease: any) => void;
}

export interface IntervalCardProps {
  interval: LeaseInterval;
  isHighlighted?: boolean;
}