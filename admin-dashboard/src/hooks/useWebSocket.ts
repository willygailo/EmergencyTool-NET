import { useState, useEffect, useCallback } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    websocketService.connect(url);

    websocketService.on('connect', () => setIsConnected(true));
    websocketService.on('disconnect', () => setIsConnected(false));

    return () => {
      websocketService.disconnect();
    };
  }, [url]);

  const subscribe = useCallback((event: string, callback: (...args: any[]) => void) => {
    websocketService.on(event, callback);
  }, []);

  const unsubscribe = useCallback((event: string) => {
    websocketService.off(event);
  }, []);

  return { isConnected, subscribe, unsubscribe };
};

export default useWebSocket;