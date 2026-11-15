import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppNotification,
  BrowserPushPermission,
  TriggerNotificationInput,
} from '../types/notification';
import {
  INITIAL_NOTIFICATIONS,
  countUnreadNotifications,
  createAppNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../utils/notificationLogic';
import { playNotificationChime } from '../utils/notificationSound';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  permission: BrowserPushPermission;
  isDevicePushEnabled: boolean;
  activeBanner: AppNotification | null;
  triggerNotification: (input: TriggerNotificationInput) => void;
  dismissBanner: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  requestPushPermission: () => Promise<BrowserPushPermission>;
  toggleDevicePush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function readBrowserPermission(): BrowserPushPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [permission, setPermission] = useState<BrowserPushPermission>(() =>
    readBrowserPermission(),
  );
  const [pushOptIn, setPushOptIn] = useState<boolean>(
    () => readBrowserPermission() === 'granted',
  );
  const [activeBanner, setActiveBanner] = useState<AppNotification | null>(null);

  const bannerTimerRef = useRef<number | null>(null);
  const pushOptInRef = useRef(pushOptIn);
  pushOptInRef.current = pushOptIn;

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current !== null) {
        window.clearTimeout(bannerTimerRef.current);
      }
    };
  }, []);

  const dismissBanner = useCallback(() => {
    if (bannerTimerRef.current !== null) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    setActiveBanner(null);
  }, []);

  const requestPushPermission = useCallback(async (): Promise<BrowserPushPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      setPushOptIn(false);
      return 'unsupported';
    }
    try {
      const result = await window.Notification.requestPermission();
      setPermission(result);
      const granted = result === 'granted';
      setPushOptIn(granted);
      return result;
    } catch {
      const current = readBrowserPermission();
      setPermission(current);
      return current;
    }
  }, []);

  const toggleDevicePush = useCallback(async () => {
    if (permission !== 'granted') {
      await requestPushPermission();
      return;
    }
    setPushOptIn((prev) => !prev);
  }, [permission, requestPushPermission]);

  const triggerNotification = useCallback((input: TriggerNotificationInput) => {
    const nextItem = createAppNotification(input);
    setNotifications((prev) => [nextItem, ...prev].slice(0, 50));
    setActiveBanner(nextItem);
    playNotificationChime();

    if (bannerTimerRef.current !== null) {
      window.clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = window.setTimeout(() => {
      setActiveBanner((curr) => (curr?.id === nextItem.id ? null : curr));
      bannerTimerRef.current = null;
    }, 4000);

    if (
      pushOptInRef.current &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'granted'
    ) {
      try {
        new window.Notification(nextItem.title, {
          body: nextItem.message,
          tag: nextItem.id,
        });
      } catch {
        // Safely ignore restricted browser Notification constructor errors
      }
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => markNotificationRead(prev, id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => markAllNotificationsRead(prev));
  }, []);

  const unreadCount = useMemo(
    () => countUnreadNotifications(notifications),
    [notifications],
  );
  const isDevicePushEnabled = permission === 'granted' && pushOptIn;

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      permission,
      isDevicePushEnabled,
      activeBanner,
      triggerNotification,
      dismissBanner,
      markAsRead,
      markAllAsRead,
      requestPushPermission,
      toggleDevicePush,
    }),
    [
      notifications,
      unreadCount,
      permission,
      isDevicePushEnabled,
      activeBanner,
      triggerNotification,
      dismissBanner,
      markAsRead,
      markAllAsRead,
      requestPushPermission,
      toggleDevicePush,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}
