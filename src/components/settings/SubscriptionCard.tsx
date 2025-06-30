import React from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CeintellyLogo } from '../CeintellyLogo';
import type { SubscriptionStatus } from '../../types/subscription';

interface SubscriptionCardProps {
  subscriptionStatus: SubscriptionStatus;
  loading: boolean;
}

export function SubscriptionCard({ subscriptionStatus, loading }: SubscriptionCardProps) {
  const { isSubscribed, isLifetime, isExpired, expirationDate, message } = subscriptionStatus;

  const getStatusIcon = () => {
    if (isLifetime || (isSubscribed && !isExpired)) {
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };

  const getStatusColor = () => {
    if (isLifetime) return 'text-purple-600';
    if (isSubscribed && !isExpired) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusBg = () => {
    if (isLifetime) return 'bg-purple-100';
    if (isSubscribed && !isExpired) return 'bg-green-100';
    return 'bg-red-100';
  };

  const handleManageSubscription = () => {
    window.open('https://ceintelly.org', '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Ceintelly Subscription</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CeintellyLogo width={24} height={24} />
          <h2 className="text-lg font-semibold text-gray-900">Ceintelly Subscription</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusBg()}`}>
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${getStatusColor()}`}>
              {isLifetime ? 'Lifetime Account' : isSubscribed ? 'Active Subscription' : 'Not Subscribed'}
            </p>
            {expirationDate && !isLifetime && (
              <p className="text-sm text-gray-600">
                {isExpired ? 'Expired on' : 'Expires on'}: {new Date(expirationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleManageSubscription}
        >
          <span>{isSubscribed ? 'Manage Subscription' : 'Subscribe Now'}</span>
          <ExternalLink className="w-4 h-4" />
        </Button>
        
        {/* Ceintelly Branding */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <a 
              href="https://ceintelly.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="font-semibold">Visit Ceintelly</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            For subscription management and support
          </p>
        </div>
      </CardContent>
    </Card>
  );
}