import React from 'react';
import { Calendar, RefreshCw, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { IntervalCard } from './IntervalCard';
import type { LeaseIntervalsListProps } from './types';

export function LeaseIntervalsList({ 
  lease, 
  intervals, 
  loading, 
  error, 
  onRefresh 
}: LeaseIntervalsListProps) {
  const getCurrentInterval = () => {
    const now = new Date();
    return intervals.find(interval => 
      interval.startDateTime <= now && interval.endDateTime >= now
    );
  };

  const getUpcomingIntervals = () => {
    const now = new Date();
    return intervals.filter(interval => interval.startDateTime > now);
  };

  const getCompletedIntervals = () => {
    const now = new Date();
    return intervals.filter(interval => interval.endDateTime < now);
  };

  const getOverdueIntervals = () => {
    return intervals.filter(interval => interval.status === 'overdue');
  };

  const currentInterval = getCurrentInterval();
  const upcomingIntervals = getUpcomingIntervals();
  const completedIntervals = getCompletedIntervals();
  const overdueIntervals = getOverdueIntervals();

  const getIntervalStats = () => {
    return {
      total: intervals.length,
      completed: completedIntervals.length,
      current: currentInterval ? 1 : 0,
      upcoming: upcomingIntervals.length,
      overdue: overdueIntervals.length,
      totalValue: intervals.reduce((sum, interval) => sum + interval.chargeAmount, 0),
      paidValue: intervals.filter(i => i.isPaid).reduce((sum, interval) => sum + interval.chargeAmount, 0)
    };
  };

  const stats = getIntervalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Charge Intervals</h3>
            <p className="text-sm text-gray-600">
              {stats.total} intervals • ${stats.totalValue.toLocaleString()} total value
            </p>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completed</p>
          <p className="text-lg font-bold text-green-700">{stats.completed}</p>
        </div>
        
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Current</p>
          <p className="text-lg font-bold text-orange-700">{stats.current}</p>
        </div>
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Upcoming</p>
          <p className="text-lg font-bold text-blue-700">{stats.upcoming}</p>
        </div>
        
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Overdue</p>
          <p className="text-lg font-bold text-red-700">{stats.overdue}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Error Loading Intervals</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && intervals.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intervals List */}
      {!loading && intervals.length > 0 && (
        <div className="space-y-4">
          {/* Current Interval */}
          {currentInterval && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Current Period</span>
              </h4>
              <IntervalCard interval={currentInterval} isHighlighted={true} />
            </div>
          )}

          {/* Overdue Intervals */}
          {overdueIntervals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Overdue Payments ({overdueIntervals.length})</span>
              </h4>
              <div className="space-y-3">
                {overdueIntervals.map(interval => (
                  <IntervalCard key={interval.id} interval={interval} />
                ))}
              </div>
            </div>
          )}

          {/* All Intervals - Scrollable */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>All Intervals ({intervals.length})</span>
            </h4>
            
            <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {intervals.map(interval => (
                <IntervalCard 
                  key={interval.id} 
                  interval={interval}
                  isHighlighted={interval.id === currentInterval?.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && intervals.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Intervals Found</h4>
          <p className="text-gray-600 mb-4">
            No charge intervals have been calculated for this lease yet.
          </p>
          <Button onClick={onRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Calculate Intervals
          </Button>
        </div>
      )}
    </div>
  );
}