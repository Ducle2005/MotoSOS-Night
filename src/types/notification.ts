import type { AppTab } from './rescue';

export type NotificationType = 'rescue' | 'promo' | 'safety' | 'chat';

export type NotificationFilterTab = 'all' | 'rescue' | 'promo' | 'safety';

export type BrowserPushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  isRead: boolean;
  targetTab: AppTab;
}

export interface TriggerNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  targetTab: AppTab;
}
