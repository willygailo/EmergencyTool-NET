import { useState, useEffect } from 'react';

export const useOfflineMode = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [queuedReports, setQueuedReports] = useState<any[]>([]);

  useEffect(() => {
    const checkOnlineStatus = () => {
      if (typeof window !== 'undefined') {
        setIsOffline(!navigator.onLine);
      }
    };

    checkOnlineStatus();
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const queueReport = (report: any) => {
    setQueuedReports(prev => [...prev, { ...report, queuedAt: Date.now() }]);
  };

  const uploadQueued = async (apiCall: Function) => {
    for (const report of queuedReports) {
      try {
        await apiCall(report);
      } catch (error) {
        console.error('Failed to upload queued report');
      }
    }
    setQueuedReports([]);
  };

  return { isOffline, queuedReports, queueReport, uploadQueued };
};

export default useOfflineMode;