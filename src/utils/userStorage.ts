import CryptoUtils from './encryption';
import type { User } from '../types/auth';

/**
 * Secure user storage utility
 * Handles encrypted storage and retrieval of current user data
 */

class UserStorage {
  private static readonly STORAGE_KEY = 'rm_current_user';
  private static readonly BACKUP_KEY = 'rm_user_backup';

  /**
   * Store user data encrypted in localStorage
   */
  static async storeUser(user: User): Promise<void> {
    try {
      if (!user || !user.id) {
        throw new Error('Invalid user data');
      }

      const userData = JSON.stringify({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        timestamp: Date.now(),
        version: '1.0'
      });

      const password = CryptoUtils.generateUserPassword(user.id);
      const encryptedData = await CryptoUtils.encrypt(userData, password);

      // Store encrypted data
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      
      // Store a backup with different key (for redundancy)
      localStorage.setItem(this.BACKUP_KEY, encryptedData);

      console.log('✅ User data stored securely');
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
      throw new Error('Failed to store user data securely');
    }
  }

  /**
   * Retrieve and decrypt user data from localStorage
   */
  static async retrieveUser(): Promise<User | null> {
    try {
      let encryptedData = localStorage.getItem(this.STORAGE_KEY);
      
      // Try backup if primary storage fails
      if (!encryptedData) {
        encryptedData = localStorage.getItem(this.BACKUP_KEY);
      }

      if (!encryptedData) {
        return null;
      }

      // We need to try different user IDs since we don't know which user's data this is
      // This is a limitation - in a real app, you'd store the user ID separately or use a different approach
      const possibleUserIds = this.getPossibleUserIds();
      
      for (const userId of possibleUserIds) {
        try {
          const password = CryptoUtils.generateUserPassword(userId);
          const decryptedData = await CryptoUtils.decrypt(encryptedData, password);
          const userData = JSON.parse(decryptedData);

          // Validate the decrypted data
          if (this.isValidUserData(userData)) {
            console.log('✅ User data retrieved and decrypted successfully');
            return {
              id: userData.id,
              email: userData.email,
              created_at: userData.created_at
            };
          }
        } catch (error) {
          // Continue trying other possible user IDs
          continue;
        }
      }

      console.warn('⚠️ Could not decrypt user data with any known user ID');
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Update stored user data
   */
  static async updateUser(user: User): Promise<void> {
    await this.storeUser(user);
  }

  /**
   * Clear stored user data
   */
  static clearUser(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      console.log('✅ User data cleared from storage');
    } catch (error) {
      console.error('❌ Failed to clear user data:', error);
    }
  }

  /**
   * Check if user data exists in storage
   */
  static hasStoredUser(): boolean {
    return !!(localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.BACKUP_KEY));
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo(): { hasData: boolean; size: number; lastModified: number | null } {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return {
      hasData: !!data,
      size: data ? data.length : 0,
      lastModified: data ? Date.now() : null
    };
  }

  /**
   * Validate user data structure
   */
  private static isValidUserData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      typeof data.email === 'string' &&
      typeof data.created_at === 'string' &&
      data.id.length > 0 &&
      data.email.includes('@')
    );
  }

  /**
   * Get possible user IDs for decryption attempts
   * In a real implementation, you might store a hint or use a different approach
   */
  private static getPossibleUserIds(): string[] {
    // Try to get user IDs from session storage or other sources
    const sessionUser = sessionStorage.getItem('supabase.auth.token');
    const possibleIds: string[] = [];

    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed.user?.id) {
          possibleIds.push(parsed.user.id);
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }

    // Add any other possible sources of user IDs here
    // For now, we'll return the session-based ID if available
    return possibleIds;
  }

  /**
   * Store user ID hint for decryption (less secure but more practical)
   */
  static storeUserIdHint(userId: string): void {
    try {
      // Store a simple hash of the user ID as a hint
      const hint = btoa(userId.slice(0, 8) + userId.slice(-8));
      localStorage.setItem('rm_user_hint', hint);
    } catch (error) {
      console.error('Failed to store user ID hint:', error);
    }
  }

  /**
   * Retrieve user ID hint for decryption
   */
  static getUserIdHint(): string | null {
    try {
      const hint = localStorage.getItem('rm_user_hint');
      return hint ? atob(hint) : null;
    } catch (error) {
      console.error('Failed to retrieve user ID hint:', error);
      return null;
    }
  }
}

export default UserStorage;