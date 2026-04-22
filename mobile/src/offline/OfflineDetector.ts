import { useState, useEffect } from 'react';

export const useOfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await fetch('https://www.google.com', { method: 'HEAD' });
        setIsOnline(state.ok);
      } catch {
        setIsOnline(false);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline };
};

export default useOfflineDetector;