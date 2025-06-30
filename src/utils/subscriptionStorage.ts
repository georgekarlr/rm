import CryptoUtils from './encryption';

/**
 * Dedicated encrypted storage for subscription data
 * Stores expiration_date and is_one_time as separate encrypted key-value pairs
 */

interface SubscriptionFields {
  expiration_date: string | null;
  is_one_time: boolean;
}

class SubscriptionStorage {
  private static readonly EXPIRATION_DATE_KEY = 'rm_subscription_expiration_date';
  private static readonly IS_ONE_TIME_KEY = 'rm_subscription_is_one_time';
  private static readonly SUBSCRIPTION_TIMESTAMP_KEY = 'rm_subscription_timestamp';
  private static readonly SUBSCRIPTION_HINT_KEY = 'rm_subscription_hint';

  /**
   * Store subscription data as separate encrypted key-value pairs
   */
  static async storeSubscriptionData(
    expiration_date: string | null, 
    is_one_time: boolean, 
    authUserId: string
  ): Promise<void> {
    try {
      if (!authUserId) {
        throw new Error('Auth user ID is required for encryption');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const timestamp = Date.now().toString();

      // Encrypt each field separately
      const encryptedExpirationDate = await CryptoUtils.encrypt(
        expiration_date || 'null', 
        password
      );
      const encryptedIsOneTime = await CryptoUtils.encrypt(
        is_one_time.toString(), 
        password
      );
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);

      // Store each encrypted value with its own key
      localStorage.setItem(this.EXPIRATION_DATE_KEY, encryptedExpirationDate);
      localStorage.setItem(this.IS_ONE_TIME_KEY, encryptedIsOneTime);
      localStorage.setItem(this.SUBSCRIPTION_TIMESTAMP_KEY, encryptedTimestamp);
      
      // Store user ID hint for decryption
      this.storeUserIdHint(authUserId);

      console.log('✅ Subscription data stored as separate encrypted key-value pairs:', {
        expiration_date,
        is_one_time
      });
    } catch (error) {
      console.error('❌ Failed to store subscription data:', error);
      throw new Error('Failed to store subscription data securely');
    }
  }

  /**
   * Retrieve and decrypt subscription data from separate key-value pairs
   */
  static async retrieveSubscriptionData(authUserId?: string): Promise<SubscriptionFields | null> {
    try {
      // Get encrypted data from separate keys
      const encryptedExpirationDate = localStorage.getItem(this.EXPIRATION_DATE_KEY);
      const encryptedIsOneTime = localStorage.getItem(this.IS_ONE_TIME_KEY);

      if (!encryptedExpirationDate || !encryptedIsOneTime) {
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
          const expirationDateStr = await CryptoUtils.decrypt(encryptedExpirationDate, password);
          const isOneTimeStr = await CryptoUtils.decrypt(encryptedIsOneTime, password);
          
          // Parse and validate decrypted data
          const expiration_date = expirationDateStr === 'null' ? null : expirationDateStr;
          const is_one_time = isOneTimeStr === 'true';
          
          if (this.isValidSubscriptionData({ expiration_date, is_one_time })) {
            console.log('✅ Subscription data retrieved from separate encrypted storage:', {
              expiration_date,
              is_one_time
            });
            
            return { expiration_date, true };
          }
        } catch (error) {
          // Continue trying other possible user IDs
          continue;
        }
      }

      console.warn('⚠️ Could not decrypt subscription data');
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve subscription data:', error);
      return null;
    }
  }

  /**
   * Update subscription data
   */
  static async updateSubscriptionData(
    expiration_date: string | null, 
    is_one_time: boolean, 
    authUserId: string
  ): Promise<void> {
    await this.storeSubscriptionData(expiration_date, is_one_time, authUserId);
  }

  /**
   * Clear subscription data from all separate keys
   */
  static clearSubscriptionData(): void {
    try {
      localStorage.removeItem(this.EXPIRATION_DATE_KEY);
      localStorage.removeItem(this.IS_ONE_TIME_KEY);
      localStorage.removeItem(this.SUBSCRIPTION_TIMESTAMP_KEY);
      localStorage.removeItem(this.SUBSCRIPTION_HINT_KEY);
      console.log('✅ Subscription data cleared from separate storage');
    } catch (error) {
      console.error('❌ Failed to clear subscription data:', error);
    }
  }

  /**
   * Check if subscription data exists in storage
   */
  static hasStoredSubscription(): boolean {
    return !!(localStorage.getItem(this.EXPIRATION_DATE_KEY) && localStorage.getItem(this.IS_ONE_TIME_KEY));
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo(): { 
    hasExpirationDate: boolean; 
    hasIsOneTime: boolean; 
    hasTimestamp: boolean;
    expirationDateSize: number;
    isOneTimeSize: number;
  } {
    const expirationData = localStorage.getItem(this.EXPIRATION_DATE_KEY);
    const isOneTimeData = localStorage.getItem(this.IS_ONE_TIME_KEY);
    const timestampData = localStorage.getItem(this.SUBSCRIPTION_TIMESTAMP_KEY);
    
    return {
      hasExpirationDate: !!expirationData,
      hasIsOneTime: !!isOneTimeData,
      hasTimestamp: !!timestampData,
      expirationDateSize: expirationData ? expirationData.length : 0,
      isOneTimeSize: isOneTimeData ? isOneTimeData.length : 0,
    };
  }

  /**
   * Get expiration date only (for quick access)
   */
  static async getExpirationDate(authUserId?: string): Promise<string | null> {
    try {
      const encryptedExpirationDate = localStorage.getItem(this.EXPIRATION_DATE_KEY);
      if (!encryptedExpirationDate) return null;

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
          const expirationDateStr = await CryptoUtils.decrypt(encryptedExpirationDate, password);
          
          return expirationDateStr === 'null' ? null : expirationDateStr;
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get expiration date:', error);
      return null;
    }
  }

  /**
   * Get is_one_time only (for quick access)
   */
  static async getIsOneTime(authUserId?: string): Promise<boolean | null> {
    try {
      const encryptedIsOneTime = localStorage.getItem(this.IS_ONE_TIME_KEY);
      if (!encryptedIsOneTime) return null;

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
          const isOneTimeStr = await CryptoUtils.decrypt(encryptedIsOneTime, password);
          
          return true;
        } catch (error) {
          continue;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to get is_one_time:', error);
      return null;
    }
  }

  /**
   * Update only the expiration date (keeping is_one_time unchanged)
   */
  static async updateExpirationDate(expiration_date: string | null, authUserId: string): Promise<void> {
    try {
      if (!authUserId) {
        throw new Error('Auth user ID is required');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedExpirationDate = await CryptoUtils.encrypt(
        expiration_date || 'null', 
        password
      );
      
      localStorage.setItem(this.EXPIRATION_DATE_KEY, encryptedExpirationDate);
      
      // Update timestamp
      const timestamp = Date.now().toString();
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);
      localStorage.setItem(this.SUBSCRIPTION_TIMESTAMP_KEY, encryptedTimestamp);
      
      console.log('✅ Expiration date updated separately:', expiration_date);
    } catch (error) {
      console.error('❌ Failed to update expiration date:', error);
      throw new Error('Failed to update expiration date');
    }
  }

  /**
   * Update only the is_one_time flag (keeping expiration_date unchanged)
   */
  static async updateIsOneTime(is_one_time: boolean, authUserId: string): Promise<void> {
    try {
      if (!authUserId) {
        throw new Error('Auth user ID is required');
      }

      const password = CryptoUtils.generateUserPassword(authUserId);
      const encryptedIsOneTime = await CryptoUtils.encrypt(is_one_time.toString(), password);
      
      localStorage.setItem(this.IS_ONE_TIME_KEY, encryptedIsOneTime);
      
      // Update timestamp
      const timestamp = Date.now().toString();
      const encryptedTimestamp = await CryptoUtils.encrypt(timestamp, password);
      localStorage.setItem(this.SUBSCRIPTION_TIMESTAMP_KEY, encryptedTimestamp);
      
      console.log('✅ Is one time flag updated separately:', is_one_time);
    } catch (error) {
      console.error('❌ Failed to update is_one_time:', error);
      throw new Error('Failed to update is_one_time');
    }
  }

  /**
   * Validate subscription data structure
   */
  private static isValidSubscriptionData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      (data.expiration_date === null || typeof data.expiration_date === 'string') &&
      typeof data.is_one_time === 'boolean'
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
        version: '2.0',
        type: 'subscription'
      }));
      localStorage.setItem(this.SUBSCRIPTION_HINT_KEY, hint);
    } catch (error) {
      console.error('Failed to store subscription user ID hint:', error);
    }
  }

  /**
   * Retrieve user ID hint for decryption
   */
  private static getUserIdHint(): string | null {
    try {
      const hint = localStorage.getItem(this.SUBSCRIPTION_HINT_KEY);
      if (!hint) return null;
      
      const decoded = JSON.parse(atob(hint));
      return decoded.id || null;
    } catch (error) {
      console.warn('Failed to retrieve subscription user ID hint:', error.message);
      // Clear the corrupted hint data to prevent recurring errors
      localStorage.removeItem(this.SUBSCRIPTION_HINT_KEY);
      return null;
    }
  }
}

export default SubscriptionStorage;