import React, { useState } from 'react';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { TerminationWarnings } from './TerminationWarnings';
import { TerminationImpact } from './TerminationImpact';
import { TerminationConfirmation } from './TerminationConfirmation';
import type { TerminateLeaseFormProps } from './types';

export function TerminateLeaseForm({
  onSubmit,
  submitting,
  lease,
  message
}: TerminateLeaseFormProps) {
  const [step, setStep] = useState<'review' | 'confirm'>('review');

  const handleProceedToConfirmation = () => {
    setStep('confirm');
  };

  const handleBackToReview = () => {
    setStep('review');
  };

  const handleConfirmTermination = () => {
    const event = new Event('submit') as any;
    onSubmit(event);
  };

  if (step === 'confirm') {
    return (
      <div className="space-y-6">
        <TerminationConfirmation
          lease={lease}
          onConfirm={handleConfirmTermination}
          onCancel={handleBackToReview}
          submitting={submitting}
        />
        
        {/* Message */}
        {message && (
          <Alert
            type={message.type}
            message={message.text}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warnings */}
      <TerminationWarnings lease={lease} />

      {/* Impact Summary */}
      <TerminationImpact lease={lease} />

      {/* Message */}
      {message && (
        <Alert
          type={message.type}
          message={message.text}
        />
      )}

      {/* Proceed Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleProceedToConfirmation}
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        >
          Proceed to Confirmation
        </Button>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Lease Termination Process:</h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>Review all warnings and impact information above</li>
          <li>Ensure any outstanding financial matters are addressed</li>
          <li>Proceed to the confirmation step</li>
          <li>Type the required confirmation text</li>
          <li>Confirm the termination to complete the process</li>
        </ol>
      </div>
    </div>
  );
}