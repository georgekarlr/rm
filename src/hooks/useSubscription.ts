import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import SubscriptionStorage from '../utils/subscriptionStorage';
import type { SubscriptionData, SubscriptionStatus } from '../types/subscription';

export function useSubscription(subscriptionId: number = 1) {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch fresh rm_users data from Supabase
      const { data, error } = await supabase.rpc('get_or_create_rm_account', {
        p_subscription_id: subscriptionId
      });

      if (error) {
        console.warn('get_or_create_rm_account function error:', error.message);
        
        // If the function fails, create fallback data with default users only
        const fallbackData = {
          id: subscriptionId,
          rm_expiration_date: null,
          is_one_time: false,
          rm_users: [
            { name: 'Everyone', user_type: 'viewer' },
            { name: 'Owner', user_type: 'admin' }
          ]
        };
        
        setSubscriptionData(fallbackData);
        console.log('🔧 Using fallback subscription data structure');
        return;
      }

      if (data && data.length > 0) {
        const freshData = data[0];
        
        // Get stored subscription fields from separate encrypted storage
        let storedSubscriptionFields = null;
        if (user?.id) {
          storedSubscriptionFields = await SubscriptionStorage.retrieveSubscriptionData(user.id);
        }

        // Transform the data to handle the new structure
        let transformedData = {
          id: freshData.id || subscriptionId,
          rm_expiration_date: freshData.rm_expiration_date,
          is_one_time: !!freshData.is_one_time, // Ensure boolean value
          rm_users: []
        };

        // Use stored subscription fields if available, otherwise use fresh data
        if (storedSubscriptionFields) {
          transformedData.rm_expiration_date = storedSubscriptionFields.expiration_date;
          transformedData.is_one_time = !!storedSubscriptionFields.is_one_time; // Ensure boolean value
          console.log('🔐 Using stored subscription fields from separate encrypted storage');
        }

        // Handle the rm_users field (JSONB array from the function) - always use fresh data
        if (freshData.rm_users && Array.isArray(freshData.rm_users)) {
          // The function returns rm_users as a JSONB array with name and user_type
          transformedData.rm_users = freshData.rm_users.filter(user => 
            user && typeof user === 'object' && user.name && user.user_type
          );
          
          console.log('✅ Using fresh rm_users data from database:', transformedData.rm_users);
        } else {
          console.warn('No rm_users array found or invalid structure:', freshData.rm_users);
          // Fallback to default users if structure is unexpected
          transformedData.rm_users = [
            { name: 'Everyone', user_type: 'viewer' },
            { name: 'Owner', user_type: 'admin' }
          ];
        }

        // Always ensure we have the default users available
        const hasEveryone = transformedData.rm_users.some(u => u.name === 'Everyone' && u.user_type === 'viewer');
        const hasOwner = transformedData.rm_users.some(u => u.name === 'Owner' && u.user_type === 'admin');

        if (!hasEveryone) {
          transformedData.rm_users.unshift({ name: 'Everyone', user_type: 'viewer' });
        }
        if (!hasOwner) {
          // Check if we have any admin user, if not add Owner
          const hasAdmin = transformedData.rm_users.some(u => u.user_type === 'admin');
          if (!hasAdmin) {
            transformedData.rm_users.push({ name: 'Owner', user_type: 'admin' });
          }
        }

        setSubscriptionData(transformedData);

        // Store only subscription fields separately (not rm_users)
        if (user?.id) {
          await SubscriptionStorage.storeSubscriptionData(
            transformedData.rm_expiration_date,
            transformedData.is_one_time,
            user.id
          );
          
          console.log('🔐 Subscription fields encrypted and stored separately (rm_users not stored)');
        }
      } else {
        // Create default subscription data if no data is available
        const defaultData = {
          id: subscriptionId,
          rm_expiration_date: null,
          is_one_time: false,
          rm_users: [
            { name: 'Everyone', user_type: 'viewer' },
            { name: 'Owner', user_type: 'admin' }
          ]
        };
        
        setSubscriptionData(defaultData);
        
        // Store only subscription fields (not rm_users)
        if (user?.id) {
          await SubscriptionStorage.storeSubscriptionData(
            defaultData.rm_expiration_date,
            defaultData.is_one_time,
            user.id
          );
        }
        
        console.log('🔧 Created default subscription data (rm_users not stored locally)');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching subscription data:', err);
      
      // Set minimal fallback data even on error
      const fallbackData = {
        id: subscriptionId,
        rm_expiration_date: null,
        is_one_time: false,
        rm_users: [
          { name: 'Everyone', user_type: 'viewer' },
          { name: 'Owner', user_type: 'admin' }
        ]
      };
      
      setSubscriptionData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    } else {
      setSubscriptionData(null);
      setLoading(false);
    }
  }, [subscriptionId, user]);

  const getSubscriptionStatus = (): SubscriptionStatus => {
    if (!subscriptionData) {
      return {
        isSubscribed: false,
        isLifetime: false,
        isExpired: false,
        expirationDate: null,
        message: 'Loading subscription status...'
      };
    }

    const { is_one_time, rm_expiration_date } = subscriptionData;

    // If it's a one-time purchase (lifetime)
    if (is_one_time) {
      return {
        isSubscribed: true,
        isLifetime: true,
        isExpired: false,
        expirationDate: null,
        message: 'You have a lifetime subscription account'
      };
    }

    // If there's no expiration date
    if (!rm_expiration_date) {
      return {
        isSubscribed: false,
        isLifetime: false,
        isExpired: false,
        expirationDate: null,
        message: 'Not subscribed. Visit ceintelly.org to subscribe'
      };
    }

    // Check if subscription is expired
    const expirationDate = new Date(rm_expiration_date);
    const now = new Date();
    const isExpired = expirationDate < now;

    if (isExpired) {
      return {
        isSubscribed: false,
        isLifetime: false,
        isExpired: true,
        expirationDate: rm_expiration_date,
        message: 'Subscription expired. Visit ceintelly.org to subscribe'
      };
    }

    return {
      isSubscribed: true,
      isLifetime: false,
      isExpired: false,
      expirationDate: rm_expiration_date,
      message: 'You are subscribed. Manage your subscription at ceintelly.org'
    };
  };

  return {
    subscriptionData,
    subscriptionStatus: getSubscriptionStatus(),
    loading,
    error,
    refetch: fetchSubscriptionData
  };
}