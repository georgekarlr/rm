export interface RecordPaymentFormData {
  totalAmount: string;
  transactionDate: string;
  paymentDetails: PaymentDetail[];
  allocations: ChargeAllocation[];
  notes: string;
}

export interface PaymentDetail {
  id: string;
  amount: string;
  paymentMethod: string;
  paymentType: string;
}

export interface ChargeAllocation {
  id: string;
  chargeId: number;
  amount: string;
  selected: boolean;
}

export interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lease: any | null; // Using any for now, should be typed based on your Lease interface
}

export interface RecordPaymentFormProps {
  formData: RecordPaymentFormData;
  onFormDataChange: (data: Partial<RecordPaymentFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  lease: any;
  message: { type: 'success' | 'error'; text: string } | null;
  onAddPaymentDetail: () => void;
  onRemovePaymentDetail: (id: string) => void;
  onUpdatePaymentDetail: (id: string, field: keyof PaymentDetail, value: string) => void;
  onUpdateAllocation: (id: string, field: keyof Omit<ChargeAllocation, 'id'>, value: any) => void;
  availableCharges: any[];
  loadingCharges: boolean;
}

export interface PaymentMethodOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PaymentTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface LeaseInfoProps {
  lease: any;
}

export interface UserInfoBannerProps {
  currentUser?: {
    name: string;
    user_type: string;
  } | null;
}

export interface PaymentDetailsSectionProps {
  paymentDetails: PaymentDetail[];
  submitting: boolean;
  onAddPaymentDetail: () => void;
  onRemovePaymentDetail: (id: string) => void;
  onUpdatePaymentDetail: (id: string, field: keyof PaymentDetail, value: string) => void;
  paymentMethods: PaymentMethodOption[];
  paymentTypes: PaymentTypeOption[];
}

export interface ChargeAllocationsSectionProps {
  allocations: ChargeAllocation[];
  availableCharges: any[];
  loadingCharges: boolean;
  submitting: boolean;
  onUpdateAllocation: (id: string, field: keyof Omit<ChargeAllocation, 'id'>, value: any) => void;
  totalAmount: number;
  totalAllocated: number;
}

export interface PaymentSummaryProps {
  formData: RecordPaymentFormData;
  lease: any;
  totalAllocated: number;
}