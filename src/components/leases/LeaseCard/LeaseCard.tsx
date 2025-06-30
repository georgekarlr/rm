import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { LeaseActionMenu } from './LeaseActionMenu';
import { LeaseHeader } from './LeaseHeader';
import { LeaseStatusBadges } from './LeaseStatusBadges';
import { LeaseDateInfo } from './LeaseDateInfo';
import { LeaseFinancialInfo } from './LeaseFinancialInfo';
import { LeaseWarnings } from './LeaseWarnings';
import { LeaseActions } from './LeaseActions';
import { leaseStatusConfig, financialStatusConfig } from './constants';
import type { LeaseCardProps } from './types';

export function LeaseCard({ 
  lease, 
  canEdit, 
  onView, 
  onEdit, 
  onTerminate, 
  onChargeBill,
  onRecordPayment
}: LeaseCardProps) {
  // Convert status values to lowercase for case-insensitive matching
  const leaseStatusKey = lease.leaseStatus?.toLowerCase();
  const financialStatusKey = lease.financialStatus?.toLowerCase();
  
  // Find the matching config or use default
  const leaseConfig = leaseStatusConfig[leaseStatusKey] || 
                      Object.values(leaseStatusConfig).find(config => 
                        config.label.toLowerCase() === leaseStatusKey
                      ) || 
                      leaseStatusConfig.default;
                      
  const financialConfig = financialStatusConfig[financialStatusKey] || 
                          Object.values(financialStatusConfig).find(config => 
                            config.label.toLowerCase() === financialStatusKey
                          ) || 
                          financialStatusConfig.default;

  // Determine if lease can be terminated (only active leases)
  const canTerminate = lease.leaseStatus?.toLowerCase() === 'active' && canEdit && onTerminate !== undefined;
  
  // Determine if bill can be charged (active leases with outstanding balance or overdue)
  const canChargeBill = lease.leaseStatus?.toLowerCase() === 'active' && 
                       canEdit && onChargeBill !== undefined;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 relative">
      <CardContent className="p-6">
        {/* Actions Menu */}
        <LeaseActionMenu
          lease={lease}
          canEdit={canEdit}
          canTerminate={canTerminate}
          canChargeBill={canChargeBill}
          onView={onView}
          onEdit={onEdit}
          onTerminate={onTerminate}
          onChargeBill={onChargeBill}
          onRecordPayment={onRecordPayment}
        />

        {/* Header */}
        <LeaseHeader 
          lease={lease}
          leaseConfig={leaseConfig}
          financialConfig={financialConfig}
        />

        {/* Status Badges */}
        <LeaseStatusBadges 
          lease={lease}
          leaseConfig={leaseConfig}
          financialConfig={financialConfig}
        />

        {/* Date Information */}
        <LeaseDateInfo lease={lease} />

        {/* Financial Information */}
        <LeaseFinancialInfo lease={lease} />

        {/* Warnings */}
        <LeaseWarnings lease={lease} />

        {/* Actions */}
        <LeaseActions
          lease={lease}
          canEdit={canEdit}
          canTerminate={canTerminate}
          canChargeBill={canChargeBill}
          onView={onView}
          onEdit={onEdit}
          onTerminate={onTerminate}
          onChargeBill={onChargeBill}
          onRecordPayment={onRecordPayment}
        />
      </CardContent>
    </Card>
  );
}