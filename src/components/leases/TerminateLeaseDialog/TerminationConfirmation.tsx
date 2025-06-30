import React, { useState } from 'react';
import { AlertTriangle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/Button';
import type { TerminationConfirmationProps } from './types';

export function TerminationConfirmation({ 
  lease, 
  onConfirm, 
  onCancel, 
  submitting 
}: TerminationConfirmationProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const requiredText = `TERMINATE ${lease?.id}`;
  const isConfirmed = confirmationText === requiredText;

  return (
    <div className="space-y-6">
      {/* Final Warning */}
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-medium text-red-900">Final Confirmation Required</h4>
            <p className="text-sm text-red-700 mt-2">
              You are about to permanently terminate lease #{lease?.id} for {lease?.renterName}. 
              This action cannot be undone and will immediately:
            </p>
            <ul className="text-sm text-red-700 mt-2 ml-4 space-y-1">
              <li>• End the lease agreement today</li>
              <li>• Make the asset available for new leases</li>
              <li>• Update all related records</li>
              <li>• Log this action for audit purposes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">{requiredText}</code> to confirm termination:
        </label>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder={`Type "${requiredText}" to confirm`}
          disabled={submitting}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
            confirmationText && !isConfirmed
              ? 'border-red-300 focus:ring-red-500 bg-red-50'
              : confirmationText && isConfirmed
              ? 'border-green-300 focus:ring-green-500 bg-green-50'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {confirmationText && !isConfirmed && (
          <p className="text-xs text-red-600 mt-1">
            Text doesn't match. Please type exactly: {requiredText}
          </p>
        )}
        {isConfirmed && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Confirmation text matches. You can now proceed with termination.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        
        <Button
          onClick={onConfirm}
          loading={submitting}
          disabled={!isConfirmed || submitting}
          className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
        >
          {submitting ? (
            'Terminating Lease...'
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Terminate Lease
            </>
          )}
        </Button>
      </div>

      {/* Additional Warning */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Important:</strong> This action is permanent and cannot be reversed. 
          Make sure you have resolved any outstanding financial matters before proceeding.
        </p>
      </div>
    </div>
  );
}