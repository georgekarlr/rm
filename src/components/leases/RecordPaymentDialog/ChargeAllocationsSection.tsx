import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import type { ChargeAllocationsSectionProps } from './types';

export function ChargeAllocationsSection({
  allocations,
  availableCharges,
  loadingCharges,
  submitting,
  onUpdateAllocation,
  totalAmount,
  totalAllocated
}: ChargeAllocationsSectionProps) {
  const remainingToAllocate = totalAmount - totalAllocated;
  const isFullyAllocated = Math.abs(remainingToAllocate) < 0.01;
  const isOverAllocated = remainingToAllocate < 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getChargeStatusIcon = (dueDate: string, isPaid: boolean) => {
    if (isPaid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getChargeStatusText = (dueDate: string, isPaid: boolean) => {
    if (isPaid) {
      return <span className="text-green-600">Paid</span>;
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      return <span className="text-red-600">Overdue</span>;
    }
    
    return <span className="text-yellow-600">Upcoming</span>;
  };

  if (loadingCharges) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Charge Allocations</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (availableCharges.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Charge Allocations</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-500">No unpaid charges found for this lease.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Charge Allocations</h3>
        <div className={`text-sm font-medium ${
          isFullyAllocated 
            ? 'text-green-600' 
            : isOverAllocated 
            ? 'text-red-600' 
            : 'text-yellow-600'
        }`}>
          {isFullyAllocated 
            ? 'Fully Allocated' 
            : isOverAllocated 
            ? 'Over-allocated' 
            : 'Partially Allocated'}
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-blue-600">Total Payment</p>
            <p className="font-semibold text-blue-900">${totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Allocated</p>
            <p className="font-semibold text-blue-900">${totalAllocated.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Remaining</p>
            <p className={`font-semibold ${
              isFullyAllocated 
                ? 'text-green-600' 
                : isOverAllocated 
                ? 'text-red-600' 
                : 'text-yellow-600'
            }`}>
              ${Math.abs(remainingToAllocate).toLocaleString()}
              {isOverAllocated && ' (over)'}
            </p>
          </div>
        </div>
      </div>

      {/* Charges List */}
      <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
        {allocations.map((allocation, index) => {
          const charge = availableCharges.find(c => c.charge_id === allocation.chargeId);
          if (!charge) return null;
          
          return (
            <div 
              key={allocation.id} 
              className={`p-3 border rounded-lg transition-all duration-200 ${
                allocation.selected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={allocation.selected}
                    onChange={(e) => onUpdateAllocation(allocation.id, 'selected', e.target.checked)}
                    disabled={submitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {charge.category || 'Charge'} - ${parseFloat(charge.total_due).toLocaleString()}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        ID: {charge.charge_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Due: {formatDate(charge.due_date)}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        {getChargeStatusIcon(charge.due_date, false)}
                        {getChargeStatusText(charge.due_date, false)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-24">
                  <Input
                    type="number"
                    value={allocation.amount}
                    onChange={(e) => onUpdateAllocation(allocation.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={charge.balance_remaining}
                    disabled={submitting || !allocation.selected}
                    className={`text-right ${
                      !allocation.selected ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>
              
              {allocation.selected && parseFloat(allocation.amount) > 0 && (
                <div className="ml-6 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Original amount:</span>
                    <span>${parseFloat(charge.total_due).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Amount paid:</span>
                    <span>${parseFloat(charge.amount_paid).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Balance remaining:</span>
                    <span>${parseFloat(charge.balance_remaining).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>This payment:</span>
                    <span>${parseFloat(allocation.amount).toLocaleString()}</span>
                  </div>
                  {parseFloat(allocation.amount) < parseFloat(charge.balance_remaining) && (
                    <div className="flex justify-between font-medium text-orange-600">
                      <span>Will remain:</span>
                      <span>${(parseFloat(charge.balance_remaining) - parseFloat(allocation.amount)).toLocaleString()}</span>
                    </div>
                  )}
                  {parseFloat(allocation.amount) >= parseFloat(charge.balance_remaining) && (
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Status after payment:</span>
                      <span>Fully paid</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            // Auto-allocate to oldest charges first
            let remaining = totalAmount;
            const updatedAllocations = [...allocations];
            
            // Sort charges by due date (oldest first)
            const sortedChargeIds = availableCharges
              .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
              .map(c => c.charge_id);
            
            // Reset all allocations
            updatedAllocations.forEach(a => {
              onUpdateAllocation(a.id, 'selected', false);
              onUpdateAllocation(a.id, 'amount', '0');
            });
            
            // Allocate to charges in order
            for (const chargeId of sortedChargeIds) {
              if (remaining <= 0) break;
              
              const charge = availableCharges.find(c => c.charge_id === chargeId);
              if (!charge) continue;
              
              const allocation = updatedAllocations.find(a => a.chargeId === chargeId);
              if (!allocation) continue;
              
              const chargeAmount = parseFloat(charge.balance_remaining);
              const allocateAmount = Math.min(chargeAmount, remaining);
              
              onUpdateAllocation(allocation.id, 'selected', true);
              onUpdateAllocation(allocation.id, 'amount', allocateAmount.toString());
              
              remaining -= allocateAmount;
            }
          }}
          disabled={submitting || totalAmount <= 0}
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          Auto-Allocate (Oldest First)
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            allocations.forEach(a => {
              onUpdateAllocation(a.id, 'selected', false);
              onUpdateAllocation(a.id, 'amount', '0');
            });
          }}
          disabled={submitting}
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}