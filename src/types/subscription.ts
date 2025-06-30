export interface RMUser {
  name: string;
  user_type: string;
}

export interface SubscriptionData {
  id: number;
  rm_users: RMUser[];
  rm_expiration_date: string | null;
  is_one_time: boolean;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isLifetime: boolean;
  isExpired: boolean;
  expirationDate: string | null;
  message: string;
}