import CryptoUtils from './encryption';
import type { SubscriptionData, RMUser } from '../types/subscription';

/**
 * Legacy settings storage utility (deprecated for most use cases)
 * Now only used for backward compatibility
 * Current user data should use CurrentUserStorage
 * Subscription fields should use SubscriptionStorage
 */

interface StoredSettingsData {
  subscriptionData: SubscriptionData | null;
  currentUser: RMUser | null;
  timestamp: number;
  version: string;
}

class SettingsStorage {
  private static readonly STORAGE_KEY = 'rm_settings_data';
  private static readonly BACKUP_KEY = 'rm_settings_backup';
  private static readonly USER_HINT_KEY = 'rm_settings_hint';
  private static readonly CURRENT_USER_KEY = 'rm_current_user';

  /**
   * Store settings data encrypted in localStorage (DEPRECATED)
   * Use CurrentUserStorage and SubscriptionStorage instead
   */
  static async storeSettingsData(
    subscriptionData: SubscriptionData | null,
    currentUser: RMUser | null,
    authUserId: string
  ): Promise<void> {
    try {
      if (!authUserId) {
        throw new Error('Auth user ID is required for encryption');
      }

      // Only store basic subscription data without rm_users
      const basicSubscriptionData = subscriptionData ? {
        id: subscriptionData.id,
        rm_expiration_date: subscriptionData.rm_expiration_date,
        is_one_time: subscriptionData.is_one_time,
        rm_users: [] // Don't store rm_users in legacy storage
      } : null;

      const settingsData: StoredSettingsData = {
        subscriptionData: basicSubscriptionData,
        currentUser,
        timestamp: Date.now(),
        version: '1.0'
      };

      const dataString = JSON.stringify(settingsData);
      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedData = await CryptoUtils.encrypt(dataString, password);

      // Store encrypted data
      localStorage.setItem(this.STORAGE_KEY, encryptedData);
      localStorage.setItem(this.BACKUP_KEY, encryptedData);
      
      // Store user ID hint for decryption
      this.storeUserIdHint(authUserId);

      console.log('✅ Legacy settings data stored securely (without rm_users)');
    } catch (error) {
      console.error('❌ Failed to store settings data:', error);
      throw new Error('Failed to store settings data securely');
    }
  }

  /**
   * Retrieve and decrypt settings data from localStorage (DEPRECATED)
   * Use CurrentUserStorage and SubscriptionStorage instead
   */
  static async retrieveSettingsData(authUserId?: string): Promise<StoredSettingsData | null> {
    try {
      let encryptedData = localStorage.getItem(this.STORAGE_KEY);
      
      // Try backup if primary storage fails
      if (!encryptedData) {
        encryptedData = localStorage.getItem(this.BACKUP_KEY);
      }

      if (!encryptedData) {
        return null;
      }

      // Try with provided user ID first, then with hint
      const userIds = [];
      if (authUserId) userIds.push(authUserId);
      
      const hintUserId = this.getUserIdHint();
      if (hintUserId && !userIds.includes(hintUserId)) {
        userIds.push(hintUserId);
      }

      for (const userId of userIds) {
        try {
          const password = CryptoUtils.generateUserPassword(userId);
          const decryptedData = await CryptoUtils.decrypt(encryptedData, password);
          const settingsData = JSON.parse(decryptedData);

          // Validate the decrypted data
          if (this.isValidSettingsData(settingsData)) {
            console.log('✅ Legacy settings data retrieved and decrypted successfully');
            return settingsData;
          }
        } catch (error) {
          // Continue trying other possible user IDs
          continue;
        }
      }

      console.warn('⚠️ Could not decrypt legacy settings data');
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve settings data:', error);
      return null;
    }
  }

  /**
   * Update current user in stored settings (DEPRECATED)
   * Use CurrentUserStorage.updateCurrentUser instead
   */
  static async updateCurrentUser(
    currentUser: RMUser,
    authUserId: string,
    subscriptionData?: SubscriptionData | null
  ): Promise<void> {
    console.warn('⚠️ SettingsStorage.updateCurrentUser is deprecated. Use CurrentUserStorage.updateCurrentUser instead.');
    
    try {
      // Get existing data if available
      let existingData = await this.retrieveSettingsData(authUserId);
      
      if (!existingData) {
        existingData = {
          subscriptionData: subscriptionData || null,
          currentUser: null,
          timestamp: Date.now(),
          version: '1.0'
        };
      }

      // Update current user
      existingData.currentUser = currentUser;
      existingData.timestamp = Date.now();

      await this.storeSettingsData(
        existingData.subscriptionData,
        currentUser,
        authUserId
      );

      // Also store current user separately for faster access
      await this.storeCurrentUserDirect(currentUser, authUserId);
    } catch (error) {
      console.error('❌ Failed to update current user:', error);
      throw new Error('Failed to update current user');
    }
  }

  /**
   * Get current user from stored settings (DEPRECATED)
   * Use CurrentUserStorage.retrieveCurrentUser instead
   */
  static async getCurrentUser(authUserId?: string): Promise<RMUser | null> {
    console.warn('⚠️ SettingsStorage.getCurrentUser is deprecated. Use CurrentUserStorage.retrieveCurrentUser instead.');
    
    try {
      // First try direct current user storage for faster access
      const directUser = await this.getCurrentUserDirect(authUserId);
      if (directUser) {
        return directUser;
      }

      // Fallback to full settings data
      const settingsData = await this.retrieveSettingsData(authUserId);
      return settingsData?.currentUser || null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Store current user directly for faster access (DEPRECATED)
   * Use CurrentUserStorage.storeCurrentUser instead
   */
  static async storeCurrentUserDirect(currentUser: RMUser, authUserId: string): Promise<void> {
    console.warn('⚠️ SettingsStorage.storeCurrentUserDirect is deprecated. Use CurrentUserStorage.storeCurrentUser instead.');
    
    try {
      const userData = {
        user: currentUser,
        timestamp: Date.now(),
        version: '1.0'
      };

      const dataString = JSON.stringify(userData);
      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedData = await CryptoUtils.encrypt(dataString, password);

      localStorage.setItem(this.CURRENT_USER_KEY, encryptedData);
      console.log('✅ Current user stored directly (legacy method)');
    } catch (error) {
      console.error('❌ Failed to store current user directly:', error);
    }
  }

  /**
   * Get current user directly for faster access (DEPRECATED)
   * Use CurrentUserStorage.retrieveCurrentUser instead
   */
  static async getCurrentUserDirect(authUserId?: string): Promise<RMUser | null> {
    console.warn('⚠️ SettingsStorage.getCurrentUserDirect is deprecated. Use CurrentUserStorage.retrieveCurrentUser instead.');
    
    try {
      const encryptedData = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!encryptedData) return null;

      // Try with provided user ID first, then with hint
      const userIds = [];
      if (authUserId) userIds.push(authUserId);
      
      const hintUserId = this.getUserIdHint();
      if (hintUserId && !userIds.includes(hintUserId)) {
        userIds.push(hintUserId);
      }

      for (const userId of userIds) {
        try {
          const password = CryptoUtils.generateUserPassword(userId);
          const decryptedData = await CryptoUtils.decrypt(encryptedData, password);
          const userData = JSON.parse(decryptedData);

          if (userData && userData.user && typeof userData.user === 'object') {
            return userData.user;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current user directly:', error);
      return null;
    }
  }

  /**
   * Clear stored settings data
   */
  static clearSettingsData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.BACKUP_KEY);
      localStorage.removeItem(this.USER_HINT_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);
      console.log('✅ Legacy settings data cleared from storage');
    } catch (error) {
      console.error('❌ Failed to clear settings data:', error);
    }
  }

  /**
   * Check if settings data exists in storage
   */
  static hasStoredSettings(): boolean {
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
   * Validate settings data structure
   */
  private static isValidSettingsData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'string' &&
      (data.subscriptionData === null || typeof data.subscriptionData === 'object') &&
      (data.currentUser === null || (
        typeof data.currentUser === 'object' &&
        typeof data.currentUser.name === 'string' &&
        typeof data.currentUser.user_type === 'string'
      ))
    );
  }

  /**
   * Store user ID hint for decryption
   */
  private static storeUserIdHint(userId: string): void {
    try {
      // Store a more robust hint that includes the full user ID
      const hint = btoa(JSON.stringify({
        id: userId,
        timestamp: Date.now()
      }));
      localStorage.setItem(this.USER_HINT_KEY, hint);
    } catch (error) {
      console.error('Failed to store user ID hint:', error);
    }
  }

  /**
   * Retrieve user ID hint for decryption
   */
  private static getUserIdHint(): string | null {
    try {
      const hint = localStorage.getItem(this.USER_HINT_KEY);
      if (!hint) return null;
      
      const decoded = JSON.parse(atob(hint));
      return decoded.id || null;
    } catch (error) {
      console.warn('Failed to retrieve user ID hint:', error.message);
      // Clear the corrupted hint data to prevent recurring errors
      localStorage.removeItem(this.USER_HINT_KEY);
      return null;
    }
  }
}

export default SettingsStorage;