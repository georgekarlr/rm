import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CurrentUserStorage from '../utils/currentUserStorage';
import type { RMUser } from '../types/subscription';

// User state interface
interface UserState {
  currentUser: RMUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// User actions
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: RMUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
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
  const [state, dispatch] = useReducer(userReducer, initialState);

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
        dispatch({ type: 'SET_USER', payload: storedUser });
        console.log('🔐 Current user loaded from separate encrypted storage:', storedUser);
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
      
      // Update in separate encrypted storage (not in settings storage)
      await CurrentUserStorage.storeCurrentUser(newUser, authUser.id);
      
      // Update state
      dispatch({ type: 'SET_USER', payload: newUser });
      
      console.log('🔐 Current user updated in separate encrypted storage:', newUser);
      
      // Broadcast the change to other components/tabs
      try {
        window.dispatchEvent(new CustomEvent('userChanged', { 
          detail: { user: newUser } 
        }));
        
        // Also use localStorage event for cross-tab communication
        localStorage.setItem('rm_user_change_event', JSON.stringify({
          user: newUser,
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
      
      // Update only the user_type in separate encrypted storage
      await CurrentUserStorage.updateUserType(userType, authUser.id);
      
      // Update state with new user_type, keeping existing name
      const updatedUser = { 
        ...state.currentUser, 
        user_type: userType 
      } as RMUser;
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      
      console.log('🔐 User type updated separately:', userType);
      
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
    if (authLoading) {
      return;
    }

    if (authUser) {
      loadCurrentUser();
    } else {
      dispatch({ type: 'RESET_STATE' });
      // Clear storage when user signs out
      CurrentUserStorage.clearCurrentUser();
    }
  }, [authUser, authLoading]);

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