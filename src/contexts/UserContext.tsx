import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import CurrentUserStorage from '../utils/currentUserStorage';
import type { RMUser } from '../types/subscription';

// User state interface
interface UserState {
  currentUser: RMUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isSubscribed: boolean;
  isLifetime: boolean;
}

// User actions
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: RMUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_SUBSCRIPTION_STATUS'; payload: { isSubscribed: boolean; isLifetime: boolean } }
  | { type: 'RESET_STATE' };

// User context interface
interface UserContextType extends UserState {
  updateCurrentUser: (user: RMUser) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  updateUserType: (userType: string) => Promise<void>;
  clearCurrentUser: () => void;
  refreshUser: () => Promise<void>;
  defaultUser: RMUser;
}

// Default user when no user is selected
const defaultUser: RMUser = { name: 'Everyone', user_type: 'viewer' };

// Initial state
const initialState: UserState = {
  currentUser: defaultUser,
  loading: true,
  error: null,
  initialized: false,
  isSubscribed: false,
  isLifetime: false,
};

// User reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        currentUser: action.payload || defaultUser, 
        loading: false, 
        error: null,
        initialized: true
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_SUBSCRIPTION_STATUS':
      return { 
        ...state, 
        isSubscribed: action.payload.isSubscribed,
        isLifetime: action.payload.isLifetime
      };
    case 'RESET_STATE':
      return { 
        ...initialState, 
        currentUser: defaultUser, 
        loading: false, 
        initialized: false 
      };
    default:
      return state;
  }
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// User provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const { subscriptionStatus, loading: subscriptionLoading } = useSubscription();
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Update subscription status when it changes
  useEffect(() => {
    if (!subscriptionLoading) {
      dispatch({ 
        type: 'SET_SUBSCRIPTION_STATUS', 
        payload: { 
          isSubscribed: subscriptionStatus.isSubscribed,
          isLifetime: subscriptionStatus.isLifetime
        } 
      });
    }
  }, [subscriptionStatus, subscriptionLoading]);

  // Load current user from separate encrypted storage
  const loadCurrentUser = async (forceReload = false) => {
    // Don't load if already initialized and not forcing reload
    if (state.initialized && !forceReload) {
      return;
    }

    if (!authUser?.id) {
      dispatch({ type: 'SET_USER', payload: defaultUser });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get current user from separate encrypted storage (not from settings storage)
      const storedUser = await CurrentUserStorage.retrieveCurrentUser(authUser.id);
      
      if (storedUser && storedUser.name && storedUser.user_type) {
        // Check subscription status - if not subscribed and not lifetime, force viewer role
        if (!state.isSubscribed && !state.isLifetime && storedUser.user_type !== 'viewer') {
          console.log('🔒 User is not subscribed. Forcing viewer role.');
          const restrictedUser = { ...storedUser, user_type: 'viewer' };
          dispatch({ type: 'SET_USER', payload: restrictedUser });
          
          // Don't update storage - keep the original role for when they subscribe
        } else {
          dispatch({ type: 'SET_USER', payload: storedUser });
          console.log('🔐 Current user loaded from separate encrypted storage:', storedUser);
        }
      } else {
        // Set default user if none stored or invalid
        dispatch({ type: 'SET_USER', payload: defaultUser });
        
        // Store default user in separate encrypted storage
        await CurrentUserStorage.storeCurrentUser(defaultUser, authUser.id);
        console.log('🔐 Default user set and stored in separate encrypted storage');
      }
    } catch (error: any) {
      console.error('Failed to load current user:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_USER', payload: defaultUser });
    }
  };

  // Update current user (both name and user_type)
  const updateCurrentUser = async (newUser: RMUser) => {
    if (!authUser?.id) {
      console.error('No auth user available for updating current user');
      dispatch({ type: 'SET_ERROR', payload: 'No authenticated user available' });
      return;
    }

    if (!newUser || !newUser.name || !newUser.user_type) {
      console.error('Invalid user data provided');
      dispatch({ type: 'SET_ERROR', payload: 'Invalid user data' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check subscription status - if not subscribed and not lifetime, force viewer role
      let userToStore = newUser;
      if (!state.isSubscribed && !state.isLifetime && newUser.user_type !== 'viewer') {
        console.log('🔒 User is not subscribed. Forcing viewer role for display.');
        userToStore = { ...newUser, user_type: 'viewer' };
      }
      
      // Always store the original user data (even if we're displaying a restricted version)
      // This way when they subscribe, they get their proper role back
      await CurrentUserStorage.storeCurrentUser(newUser, authUser.id);
      
      // Update state with potentially restricted user
      dispatch({ type: 'SET_USER', payload: userToStore });
      
      console.log('🔐 Current user updated in separate encrypted storage:', newUser);
      console.log('🔐 Current user displayed as:', userToStore);
      
      // Broadcast the change to other components/tabs
      try {
        window.dispatchEvent(new CustomEvent('userChanged', { 
          detail: { user: userToStore } 
        }));
        
        // Also use localStorage event for cross-tab communication
        localStorage.setItem('rm_user_change_event', JSON.stringify({
          user: userToStore,
          timestamp: Date.now()
        }));
        localStorage.removeItem('rm_user_change_event'); // Trigger storage event
      } catch (eventError) {
        console.warn('Failed to broadcast user change event:', eventError);
      }
      
    } catch (error: any) {
      console.error('Failed to update current user:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Revert on error
      try {
        const storedUser = await CurrentUserStorage.retrieveCurrentUser(authUser.id);
        dispatch({ type: 'SET_USER', payload: storedUser || defaultUser });
      } catch (revertError) {
        console.error('Failed to revert user on error:', revertError);
        dispatch({ type: 'SET_USER', payload: defaultUser });
      }
    }
  };

  // Update only user name (keeping user_type unchanged)
  const updateUserName = async (name: string) => {
    if (!authUser?.id) {
      console.error('No auth user available for updating user name');
      dispatch({ type: 'SET_ERROR', payload: 'No authenticated user available' });
      return;
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('Invalid name provided');
      dispatch({ type: 'SET_ERROR', payload: 'Invalid name provided' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update only the name in separate encrypted storage
      await CurrentUserStorage.updateUserName(name, authUser.id);
      
      // Update state with new name, keeping existing user_type
      const updatedUser = { 
        ...state.currentUser, 
        name: name 
      } as RMUser;
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      console.log('🔐 User name updated separately:', name);
      
      // Broadcast the change
      try {
        window.dispatchEvent(new CustomEvent('userChanged', { 
          detail: { user: updatedUser } 
        }));
      } catch (eventError) {
        console.warn('Failed to broadcast user name change event:', eventError);
      }
      
    } catch (error: any) {
      console.error('Failed to update user name:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Update only user type (keeping name unchanged)
  const updateUserType = async (userType: string) => {
    if (!authUser?.id) {
      console.error('No auth user available for updating user type');
      dispatch({ type: 'SET_ERROR', payload: 'No authenticated user available' });
      return;
    }

    if (!userType || !['viewer', 'leaser', 'admin'].includes(userType)) {
      console.error('Invalid user type provided');
      dispatch({ type: 'SET_ERROR', payload: 'Invalid user type provided' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check subscription status - if not subscribed and not lifetime, force viewer role
      let userTypeToDisplay = userType;
      if (!state.isSubscribed && !state.isLifetime && userType !== 'viewer') {
        console.log('🔒 User is not subscribed. Forcing viewer role for display.');
        userTypeToDisplay = 'viewer';
      }
      
      // Always store the original user type (even if we're displaying a restricted version)
      await CurrentUserStorage.updateUserType(userType, authUser.id);
      
      // Update state with potentially restricted user type
      const updatedUser = { 
        ...state.currentUser, 
        user_type: userTypeToDisplay 
      } as RMUser;
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      console.log('🔐 User type stored as:', userType);
      console.log('🔐 User type displayed as:', userTypeToDisplay);
      
      // Broadcast the change
      try {
        window.dispatchEvent(new CustomEvent('userChanged', { 
          detail: { user: updatedUser } 
        }));
      } catch (eventError) {
        console.warn('Failed to broadcast user type change event:', eventError);
      }
      
    } catch (error: any) {
      console.error('Failed to update user type:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  // Clear current user
  const clearCurrentUser = () => {
    dispatch({ type: 'SET_USER', payload: defaultUser });
    CurrentUserStorage.clearCurrentUser();
    console.log('🔐 Current user cleared from separate encrypted storage');
  };

  // Refresh user from storage
  const refreshUser = async () => {
    await loadCurrentUser(true);
  };

  // Load user when auth user changes or becomes available
  useEffect(() => {
    // Only proceed if auth is not loading
    if (authLoading || subscriptionLoading) {
      return;
    }

    if (authUser) {
      loadCurrentUser();
    } else {
      dispatch({ type: 'RESET_STATE' });
      // Clear storage when user signs out
      CurrentUserStorage.clearCurrentUser();
    }
  }, [authUser, authLoading, subscriptionLoading, state.isSubscribed, state.isLifetime]);

  // Listen for user changes from other components/tabs
  useEffect(() => {
    const handleUserChange = (event: CustomEvent) => {
      const { user } = event.detail;
      if (user && user.name && user.user_type) {
        dispatch({ type: 'SET_USER', payload: user });
        console.log('🔄 User change received from event:', user);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'rm_user_change_event' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.user && data.user.name && data.user.user_type) {
            dispatch({ type: 'SET_USER', payload: data.user });
            console.log('🔄 User change received from storage event:', data.user);
          }
        } catch (error) {
          console.error('Failed to parse storage event data:', error);
        }
      }
    };

    // Listen for sign out events to clear user data
    const handleSignOut = () => {
      clearCurrentUser();
      console.log('🔄 User cleared due to sign out event');
    };

    // Listen for custom events (same tab)
    window.addEventListener('userChanged', handleUserChange as EventListener);
    window.addEventListener('userSignedOut', handleSignOut);
    
    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('userChanged', handleUserChange as EventListener);
      window.removeEventListener('userSignedOut', handleSignOut);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle page visibility change to refresh user data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && authUser?.id && state.initialized) {
        // Refresh user data when page becomes visible
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authUser, state.initialized]);

  const contextValue: UserContextType = {
    ...state,
    updateCurrentUser,
    updateUserName,
    updateUserType,
    clearCurrentUser,
    refreshUser,
    defaultUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use user context
export function useUserContext(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}