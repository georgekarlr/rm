export interface EditLeaseFormData {
  newEndDate: string;
  newBaseChargeAmount: string;
}

export interface EditLeaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lease: any | null; // Using any for now, should be typed based on your Lease interface
}

export interface EditLeaseFormProps {
  formData: EditLeaseFormData;
  onFormDataChange: (data: Partial<EditLeaseFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  lease: any;
  message: { type: 'success' | 'error'; text: string } | null;
}