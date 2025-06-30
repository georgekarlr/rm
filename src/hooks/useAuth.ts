import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CurrentUserStorage from '../utils/currentUserStorage';
import SubscriptionStorage from '../utils/subscriptionStorage';
import type { AuthState, User } from '../types/auth';

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const currentUser = session.user as User;
          setUser(currentUser);
          console.log('✅ User authenticated:', currentUser.email);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = session.user as User;
        setUser(currentUser);
        console.log('✅ User signed in:', currentUser.email);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        
        try {
          // Clear encrypted current user data on sign out
          CurrentUserStorage.clearCurrentUser();
          console.log('🔐 Current user data cleared on sign out');
          
          // Clear encrypted subscription data on sign out
          SubscriptionStorage.clearSubscriptionData();
          console.log('🔐 Subscription data cleared on sign out');
          
          // Broadcast sign out event
          window.dispatchEvent(new CustomEvent('userSignedOut'));
        } catch (error) {
          console.error('Failed to clear encrypted data on sign out:', error);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const currentUser = session.user as User;
        setUser(currentUser);
        console.log('🔄 Token refreshed for user:', currentUser.email);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}