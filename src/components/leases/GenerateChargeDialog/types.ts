export interface GenerateChargeFormData {
  amount: string;
  category: string;
  dueDate: string;
  description: string;
}

export interface GenerateChargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lease: any | null; // Using any for now, should be typed based on your Lease interface
}

export interface GenerateChargeFormProps {
  formData: GenerateChargeFormData;
  onFormDataChange: (data: Partial<GenerateChargeFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  lease: any;
  message: { type: 'success' | 'error'; text: string } | null;
}

export interface ChargeCategoryOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ChargePreviewProps {
  formData: GenerateChargeFormData;
  lease: any;
}