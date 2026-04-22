import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setStats, setLoading, setError } from '../store/analyticsSlice';
import analyticsService from '../services/analyticsService';

export const useAnalytics = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state: any) => state.analytics);

  const fetchStats = async () => {
    dispatch(setLoading(true));
    try {
      const data = await analyticsService.getStats();
      dispatch(setStats(data));
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};

export default useAnalytics;