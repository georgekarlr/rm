import { useUserContext } from '../contexts/UserContext';

/**
 * Hook to manage the current user from settings (not auth user)
 * This is now a wrapper around the UserContext for backward compatibility
 */
export function useCurrentUser() {
  const {
    currentUser,
    loading,
    error,
    updateCurrentUser,
    updateUserName,
    updateUserType,
    clearCurrentUser,
    refreshUser,
    defaultUser,
    isSubscribed,
    isLifetime
  } = useUserContext();

  return {
    currentUser,
    loading,
    error,
    updateCurrentUser,
    updateUserName,
    updateUserType,
    clearCurrentUser,
    refreshUser,
    defaultUser,
    isSubscribed,
    isLifetime
  };
}