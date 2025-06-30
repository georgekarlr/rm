import CryptoUtils from './encryption';
import type { RMUser } from '../types/subscription';

/**
 * Dedicated encrypted storage for current user data
 * Stores name and user_type as separate encrypted key-value pairs
 */

class CurrentUserStorage {
  private static readonly USER_NAME_KEY = 'rm_current_user_name';
  private static readonly USER_TYPE_KEY = 'rm_current_user_type';
  private static readonly USER_TIMESTAMP_KEY = 'rm_current_user_timestamp';
  private static readonly USER_HINT_KEY = 'rm_current_user_hint';

  /**
   * Store current user data as separate encrypted key-value pairs
   */
  static async storeCurrentUser(user: RMUser, authUserId: string): Promise<void> {
    try {
      if (!authUserId) {
        throw new Error('Auth user ID is required for encryption');
      }

      if (!user || !user.name || !user.user_type) {
        throw new Error('Invalid user data provided');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const timestamp = Date.now().toString();

      // Encrypt each field separately
      const encryptedName = await CryptoUtils.encrypt(user.name, password);
      const encryptedType = await CryptoUtils.encrypt(user.user_type, password);
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);

      // Store each encrypted value with its own key
      localStorage.setItem(this.USER_NAME_KEY, encryptedName);
      localStorage.setItem(this.USER_TYPE_KEY, encryptedType);
      localStorage.setItem(this.USER_TIMESTAMP_KEY, encryptedTimestamp);
      
      // Store user ID hint for decryption
      this.storeUserIdHint(authUserId);

      console.log('✅ Current user stored as separate encrypted key-value pairs:', {
        name: user.name,
        user_type: user.user_type
      });
    } catch (error) {
      console.error('❌ Failed to store current user:', error);
      throw new Error('Failed to store current user securely');
    }
  }

  /**
   * Retrieve and decrypt current user data from separate key-value pairs
   */
  static async retrieveCurrentUser(authUserId?: string): Promise<RMUser | null> {
    try {
      // Get encrypted data from separate keys
      const encryptedName = localStorage.getItem(this.USER_NAME_KEY);
      const encryptedType = localStorage.getItem(this.USER_TYPE_KEY);
      const encryptedTimestamp = localStorage.getItem(this.USER_TIMESTAMP_KEY);

      if (!encryptedName || !encryptedType) {
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
          
          // Decrypt each field separately
          const name = await CryptoUtils.decrypt(encryptedName, password);
          const user_type = await CryptoUtils.decrypt(encryptedType, password);
          
          // Validate decrypted data
          if (name && user_type && this.isValidUserData({ name, user_type })) {
            console.log('✅ Current user retrieved from separate encrypted storage:', {
              name,
              user_type
            });
            
            return { name, user_type };
          }
        } catch (error) {
          // Continue trying other possible user IDs
          continue;
        }
      }

      console.warn('⚠️ Could not decrypt current user data');
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve current user:', error);
      return null;
    }
  }

  /**
   * Update current user data
   */
  static async updateCurrentUser(user: RMUser, authUserId: string): Promise<void> {
    await this.storeCurrentUser(user, authUserId);
  }

  /**
   * Clear current user data from all separate keys
   */
  static clearCurrentUser(): void {
    try {
      localStorage.removeItem(this.USER_NAME_KEY);
      localStorage.removeItem(this.USER_TYPE_KEY);
      localStorage.removeItem(this.USER_TIMESTAMP_KEY);
      localStorage.removeItem(this.USER_HINT_KEY);
      console.log('✅ Current user data cleared from separate storage');
    } catch (error) {
      console.error('❌ Failed to clear current user data:', error);
    }
  }

  /**
   * Check if current user data exists in storage
   */
  static hasStoredUser(): boolean {
    return !!(localStorage.getItem(this.USER_NAME_KEY) && localStorage.getItem(this.USER_TYPE_KEY));
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo(): { 
    hasName: boolean; 
    hasType: boolean; 
    hasTimestamp: boolean;
    nameSize: number;
    typeSize: number;
  } {
    const nameData = localStorage.getItem(this.USER_NAME_KEY);
    const typeData = localStorage.getItem(this.USER_TYPE_KEY);
    const timestampData = localStorage.getItem(this.USER_TIMESTAMP_KEY);
    
    return {
      hasName: !!nameData,
      hasType: !!typeData,
      hasTimestamp: !!timestampData,
      nameSize: nameData ? nameData.length : 0,
      typeSize: typeData ? typeData.length : 0,
    };
  }

  /**
   * Get current user name only (for quick access)
   */
  static async getCurrentUserName(authUserId?: string): Promise<string | null> {
    try {
      const encryptedName = localStorage.getItem(this.USER_NAME_KEY);
      if (!encryptedName) return null;

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
          const name = await CryptoUtils.decrypt(encryptedName, password);
          
          if (name && typeof name === 'string' && name.trim().length > 0) {
            return name;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current user name:', error);
      return null;
    }
  }

  /**
   * Get current user type only (for quick access)
   */
  static async getCurrentUserType(authUserId?: string): Promise<string | null> {
    try {
      const encryptedType = localStorage.getItem(this.USER_TYPE_KEY);
      if (!encryptedType) return null;

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
          const user_type = await CryptoUtils.decrypt(encryptedType, password);
          
          if (user_type && typeof user_type === 'string' && user_type.trim().length > 0) {
            return user_type;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get current user type:', error);
      return null;
    }
  }

  /**
   * Update only the user name (keeping user_type unchanged)
   */
  static async updateUserName(name: string, authUserId: string): Promise<void> {
    try {
      if (!authUserId || !name) {
        throw new Error('Auth user ID and name are required');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedName = await CryptoUtils.encrypt(name, password);
      
      localStorage.setItem(this.USER_NAME_KEY, encryptedName);
      
      // Update timestamp
      const timestamp = Date.now().toString();
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);
      localStorage.setItem(this.USER_TIMESTAMP_KEY, encryptedTimestamp);
      
      console.log('✅ User name updated separately:', name);
    } catch (error) {
      console.error('❌ Failed to update user name:', error);
      throw new Error('Failed to update user name');
    }
  }

  /**
   * Update only the user type (keeping name unchanged)
   */
  static async updateUserType(user_type: string, authUserId: string): Promise<void> {
    try {
      if (!authUserId || !user_type) {
        throw new Error('Auth user ID and user type are required');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedType = await CryptoUtils.encrypt(user_type, password);
      
      localStorage.setItem(this.USER_TYPE_KEY, encryptedType);
      
      // Update timestamp
      const timestamp = Date.now().toString();
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);
      localStorage.setItem(this.USER_TIMESTAMP_KEY, encryptedTimestamp);
      
      console.log('✅ User type updated separately:', user_type);
    } catch (error) {
      console.error('❌ Failed to update user type:', error);
      throw new Error('Failed to update user type');
    }
  }

  /**
   * Validate user data structure
   */
  private static isValidUserData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      typeof data.user_type === 'string' &&
      data.name.trim().length > 0 &&
      data.user_type.trim().length > 0 &&
      ['viewer', 'leaser', 'admin'].includes(data.user_type)
    );
  }

  /**
   * Store user ID hint for decryption
   */
  private static storeUserIdHint(userId: string): void {
    try {
      const hint = btoa(JSON.stringify({
        id: userId,
        timestamp: Date.now(),
        version: '2.0'
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

export default CurrentUserStorage;