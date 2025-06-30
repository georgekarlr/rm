export interface TerminateLeaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lease: any | null; // Using any for now, should be typed based on your Lease interface
}

export interface TerminateLeaseFormProps {
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  lease: any;
  message: { type: 'success' | 'error' | 'warning'; text: string } | null;
}

export interface LeaseTerminationInfoProps {
  lease: any;
}

export interface TerminationWarningsProps {
  lease: any;
}

export interface TerminationConfirmationProps {
  lease: any;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export interface TerminationImpactProps {
  lease: any;
}