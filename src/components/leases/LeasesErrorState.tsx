import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface LeasesErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function LeasesErrorState({ error, onRetry }: LeasesErrorStateProps) {
  return (
    <div className="py-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Leases</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onRetry}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}