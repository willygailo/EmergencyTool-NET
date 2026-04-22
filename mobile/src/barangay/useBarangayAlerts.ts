import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getApiErrorMessage } from '../services/apiErrors';
import { BroadcastAlert, broadcastApi } from './broadcastApi';

interface UseBarangayAlertsOptions {
  barangay?: string | null;
  autoLoad?: boolean;
  refreshOnFocus?: boolean;
}

const normalizeBarangay = (barangay?: string | null) => barangay?.trim() || '';

export const useBarangayAlerts = ({
  barangay,
  autoLoad = true,
  refreshOnFocus = false,
}: UseBarangayAlertsOptions = {}) => {
  const normalizedBarangay = normalizeBarangay(barangay);
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCompletedInitialLoadRef = useRef(false);

  const loadAlerts = useCallback(
    async ({ showLoader = false, isRefreshing = false }: { showLoader?: boolean; isRefreshing?: boolean } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      if (isRefreshing) {
        setRefreshing(true);
      }

      try {
        const nextAlerts = await broadcastApi.getAlerts(normalizedBarangay || undefined);
        setAlerts(nextAlerts);
        setError(null);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Failed to load barangay alerts.'));
      } finally {
        hasCompletedInitialLoadRef.current = true;

        if (showLoader) {
          setLoading(false);
        }

        if (isRefreshing) {
          setRefreshing(false);
        }
      }
    },
    [normalizedBarangay]
  );

  useEffect(() => {
    if (!autoLoad) {
      setLoading(false);
      return;
    }

    void loadAlerts({ showLoader: true });
  }, [autoLoad, loadAlerts]);

  useFocusEffect(
    useCallback(() => {
      if (!refreshOnFocus) {
        return undefined;
      }

      if (autoLoad && !hasCompletedInitialLoadRef.current) {
        return undefined;
      }

      void loadAlerts({ showLoader: alerts.length === 0 });
      return undefined;
    }, [alerts.length, autoLoad, loadAlerts, refreshOnFocus])
  );

  const refreshAlerts = useCallback(async () => {
    await loadAlerts({ isRefreshing: true });
  }, [loadAlerts]);

  const reloadAlerts = useCallback(async () => {
    await loadAlerts({ showLoader: true });
  }, [loadAlerts]);

  return {
    alerts,
    error,
    hasBarangay: Boolean(normalizedBarangay),
    latestAlert: alerts[0] || null,
    loading,
    refreshing,
    refreshAlerts,
    reloadAlerts,
    activeAlertCount: alerts.length,
    barangayLabel: normalizedBarangay || 'your community',
  };
};

export default useBarangayAlerts;
