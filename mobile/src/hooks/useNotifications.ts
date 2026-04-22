import { useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const getNotificationsModule = (): NotificationsModule | null => {
  try {
    return require('expo-notifications') as NotificationsModule;
  } catch {
    return null;
  }
};

const notificationsModule = getNotificationsModule();
const isExpoGo = Constants.executionEnvironment === 'storeClient';
let hasConfiguredNotificationHandler = false;

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

interface NotificationType {
  id: string;
  title: string;
  body: string;
  type: 'alert' | 'warning' | 'info' | 'emergency';
  data?: any;
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    configureNotificationHandler();
    registerForPushNotificationsAsync();
    subscriptionRef.current = notificationListener();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    try {
      if (!notificationsModule) {
        setPermissionStatus('unavailable');
        return;
      }

      const { status: existingStatus } = await notificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await notificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications');
        return;
      }

      if (Platform.OS === 'android') {
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

      if (isExpoGo) {
        setExpoPushToken('');
        return;
      }

      const { data: token } = await notificationsModule.getExpoPushTokenAsync();
      setExpoPushToken(token);
      console.log('Push token:', token);
    } catch (e) {
      console.log('Error setting up notifications:', e);
      setPermissionStatus('unavailable');
    }
  };

  const notificationListener = () => {
    if (!notificationsModule) {
      return null;
    }

    const subscription = notificationsModule.addNotificationReceivedListener((notification) => {
      const newNotification: NotificationType = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        type: 'info',
        data: notification.request.content.data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    });

    return subscription;
  };

  const sendLocalNotification = async (title: string, body: string, type: NotificationType['type'] = 'info', data?: any) => {
    if (!notificationsModule) {
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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    expoPushToken,
    permissionStatus,
    sendLocalNotification,
    markAsRead,
    clearAll,
    unreadCount,
  };
};

export default useNotifications;
