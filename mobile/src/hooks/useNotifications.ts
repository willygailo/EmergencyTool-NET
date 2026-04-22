import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

export interface NotificationType {
  id: string;
  title: string;
  body: string;
  type: 'alert' | 'warning' | 'info' | 'emergency';
  data?: any;
  timestamp: string;
  read: boolean;
}

type NotificationsSnapshot = {
  notifications: NotificationType[];
  expoPushToken: string;
  permissionStatus: string;
};

const NOTIFICATIONS_STORAGE_KEY = 'emergencytool_notifications';
const isExpoGo = Constants.executionEnvironment === 'storeClient';

const getNotificationsModule = (): NotificationsModule | null => {
  if (isExpoGo) {
    return null;
  }

  try {
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
};

const notificationsModule = getNotificationsModule();
let hasConfiguredNotificationHandler = false;
let notificationsState: NotificationType[] = [];
let expoPushTokenState = '';
let permissionStatusState = 'undetermined';
let initPromise: Promise<void> | null = null;
let listenerSubscription: { remove: () => void } | null = null;

const subscribers = new Set<(snapshot: NotificationsSnapshot) => void>();

const createSnapshot = (): NotificationsSnapshot => ({
  notifications: notificationsState,
  expoPushToken: expoPushTokenState,
  permissionStatus: permissionStatusState,
});

const emitSnapshot = () => {
  const snapshot = createSnapshot();
  subscribers.forEach((listener) => listener(snapshot));
};

const configureNotificationHandler = () => {
  if (!notificationsModule || hasConfiguredNotificationHandler) {
    return;
  }

  notificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  hasConfiguredNotificationHandler = true;
};

const normalizeStoredNotifications = (rawValue: string | null): NotificationType[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item?.id && item?.title && item?.body && item?.timestamp)
      .map((item) => ({
        id: String(item.id),
        title: String(item.title),
        body: String(item.body),
        type: item.type || 'info',
        data: item.data,
        timestamp: String(item.timestamp),
        read: Boolean(item.read),
      }));
  } catch {
    return [];
  }
};

const persistNotifications = async () => {
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notificationsState));
};

const updateNotifications = async (updater: (items: NotificationType[]) => NotificationType[]) => {
  notificationsState = updater(notificationsState);
  await persistNotifications();
  emitSnapshot();
};

const addInAppNotification = async (
  title: string,
  body: string,
  type: NotificationType['type'] = 'info',
  data?: any
) => {
  const newNotification: NotificationType = {
    id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    type,
    data,
    timestamp: new Date().toISOString(),
    read: false,
  };

  await updateNotifications((items) => [newNotification, ...items].slice(0, 50));
  return newNotification;
};

const refreshNotificationPermissions = async () => {
  try {
    if (isExpoGo) {
      permissionStatusState = 'unsupported_in_expo_go';
      expoPushTokenState = '';
      emitSnapshot();
      return;
    }

    if (!notificationsModule) {
      permissionStatusState = 'unavailable';
      expoPushTokenState = '';
      emitSnapshot();
      return;
    }

    const { status: existingStatus } = await notificationsModule.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notificationsModule.requestPermissionsAsync();
      finalStatus = status;
    }

    permissionStatusState = finalStatus;

    if (finalStatus === 'granted' && Platform.OS === 'android') {
      await notificationsModule.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: notificationsModule.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ef4444',
      });

      await notificationsModule.setNotificationChannelAsync('barangay', {
        name: 'Barangay Alerts',
        importance: notificationsModule.AndroidImportance.HIGH,
      });
    }

    if (finalStatus === 'granted') {
      const { data: token } = await notificationsModule.getExpoPushTokenAsync();
      expoPushTokenState = token;
    } else {
      expoPushTokenState = '';
    }
  } catch (error) {
    console.log('Error setting up notifications:', error);
    permissionStatusState = 'unavailable';
    expoPushTokenState = '';
  }

  emitSnapshot();
};

const initializeNotifications = async () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    notificationsState = normalizeStoredNotifications(storedNotifications);
    emitSnapshot();

    configureNotificationHandler();
    await refreshNotificationPermissions();

    if (notificationsModule && !listenerSubscription) {
      listenerSubscription = notificationsModule.addNotificationReceivedListener((notification) => {
        void addInAppNotification(
          notification.request.content.title || 'New Alert',
          notification.request.content.body || 'You have a new notification.',
          'info',
          notification.request.content.data
        );
      });
    }
  })().finally(() => {
    initPromise = null;
  });

  return initPromise;
};

export const useNotifications = () => {
  const [snapshot, setSnapshot] = useState<NotificationsSnapshot>(createSnapshot());

  useEffect(() => {
    let isMounted = true;

    const handleSnapshot = (nextSnapshot: NotificationsSnapshot) => {
      if (isMounted) {
        setSnapshot({
          notifications: [...nextSnapshot.notifications],
          expoPushToken: nextSnapshot.expoPushToken,
          permissionStatus: nextSnapshot.permissionStatus,
        });
      }
    };

    subscribers.add(handleSnapshot);
    handleSnapshot(createSnapshot());
    void initializeNotifications();

    return () => {
      isMounted = false;
      subscribers.delete(handleSnapshot);
    };
  }, []);

  const sendLocalNotification = async (
    title: string,
    body: string,
    type: NotificationType['type'] = 'info',
    data?: any
  ) => {
    await addInAppNotification(title, body, type, data);

    if (!notificationsModule || permissionStatusState !== 'granted') {
      return;
    }

    await notificationsModule.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  };

  const markAsRead = async (id: string) => {
    await updateNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = async () => {
    await updateNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const clearAll = async () => {
    await updateNotifications(() => []);
  };

  return {
    notifications: snapshot.notifications,
    expoPushToken: snapshot.expoPushToken,
    permissionStatus: snapshot.permissionStatus,
    unreadCount: snapshot.notifications.filter((item) => !item.read).length,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotificationStatus: refreshNotificationPermissions,
  };
};

export default useNotifications;
