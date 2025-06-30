import type { RMUser } from '../../../types/subscription';

export type TabType = 'change' | 'add' | 'delete';

export interface UserManagementProps {
  users: RMUser[];
  loading: boolean;
  onUserAdded?: () => void;
}

export interface TabProps {
  users: RMUser[];
  loading: boolean;
  onUserAdded?: () => void;
}

export interface UserCardProps {
  user: RMUser;
  isSelected?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export interface UserTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  className?: string;
}

export interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin?: boolean;
}

export interface CurrentUserDisplayProps {
  currentUser: RMUser | null;
}

export interface UserListProps {
  users: RMUser[];
  currentUser?: RMUser | null;
  onUserSelect?: (user: RMUser) => void;
  selectedUser?: RMUser | null;
  showDeleteButtons?: boolean;
  onUserDelete?: (user: RMUser) => void;
}

export interface FormData {
  name: string;
  user_type: string;
  password: string;
}

export interface ValidationResult {
  success: boolean;
  message: string;
}