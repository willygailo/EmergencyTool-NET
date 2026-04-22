import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface OfflineItem {
  id: string;
  type: 'emergency' | 'family_checkin' | 'location_share' | 'hazard_report';
  data: any;
  createdAt: number;
  synced: boolean;
}

const STORAGE_KEYS = {
  EMERGENCIES: '@offline_emergencies',
  FAMILY_CHECKINS: '@offline_family_checkins',
  LOCATION_SHARES: '@offline_location_shares',
  HAZARD_REPORTS: '@offline_hazard_reports',
  USER_DATA: '@offline_user_data',
  SETTINGS: '@offline_settings',
};

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<OfflineItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      if (online && pendingItems.length > 0) {
        syncPendingItems();
      }
    });

    loadPendingItems();

    return () => unsubscribe();
  }, [isOnline, pendingItems]);

  const loadPendingItems = async () => {
    try {
      const allKeys = Object.values(STORAGE_KEYS);
      let items: OfflineItem[] = [];

      for (const key of allKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          items = [...items, ...parsed];
        }
      }

      setPendingItems(items.filter(item => !item.synced));
    } catch (error) {
      console.error('Error loading pending items:', error);
    }
  };

  const saveOfflineItem = async (type: OfflineItem['type'], data: any) => {
    const item: OfflineItem = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      createdAt: Date.now(),
      synced: false,
    };

    try {
      const storageKey = getStorageKey(type);
      const existing = await AsyncStorage.getItem(storageKey);
      const items = existing ? JSON.parse(existing) : [];
      items.push(item);
      await AsyncStorage.setItem(storageKey, JSON.stringify(items));

      setPendingItems(prev => [...prev, item]);

      if (isOnline) {
        await syncItem(item);
      }

      return item;
    } catch (error) {
      console.error('Error saving offline item:', error);
      throw error;
    }
  };

  const syncItem = async (item: OfflineItem): Promise<boolean> => {
    try {
      console.log('Syncing item:', item.type, item.data);
      
      const storageKey = getStorageKey(item.type);
      const existing = await AsyncStorage.getItem(storageKey);
      if (existing) {
        const items = JSON.parse(existing);
        const updated = items.map((i: OfflineItem) =>
          i.id === item.id ? { ...i, synced: true } : i
        );
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      }

      setPendingItems(prev => prev.filter(i => i.id !== item.id));
      return true;
    } catch (error) {
      console.error('Error syncing item:', error);
      return false;
    }
  };

  const syncPendingItems = async () => {
    if (isSyncing || !isOnline || pendingItems.length === 0) return;

    setIsSyncing(true);

    for (const item of pendingItems) {
      await syncItem(item);
    }

    setIsSyncing(false);
  };

  const getStorageKey = (type: OfflineItem['type']): string => {
    switch (type) {
      case 'emergency': return STORAGE_KEYS.EMERGENCIES;
      case 'family_checkin': return STORAGE_KEYS.FAMILY_CHECKINS;
      case 'location_share': return STORAGE_KEYS.LOCATION_SHARES;
      case 'hazard_report': return STORAGE_KEYS.HAZARD_REPORTS;
      default: return STORAGE_KEYS.EMERGENCIES;
    }
  };

  const clearAllPending = async () => {
    try {
      const allKeys = Object.values(STORAGE_KEYS);
      for (const key of allKeys) {
        await AsyncStorage.removeItem(key);
      }
      setPendingItems([]);
    } catch (error) {
      console.error('Error clearing pending items:', error);
    }
  };

  return {
    isOnline,
    pendingItems,
    isSyncing,
    pendingCount: pendingItems.length,
    saveOfflineItem,
    syncPendingItems,
    clearAllPending,
  };
};

export default useOfflineStorage;