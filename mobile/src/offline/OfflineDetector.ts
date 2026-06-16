import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineDetector = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      // isInternetReachable is true when connected to network and internet is available
      setIsOnline(state.isInternetReachable ?? state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isOnline };
};

export default useOfflineDetector;