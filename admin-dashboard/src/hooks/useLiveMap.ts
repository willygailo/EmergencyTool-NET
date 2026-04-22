import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { updateLocation } from '../store/locationSlice';
import websocketService from '../services/websocketService';

export const useLiveMap = () => {
  const dispatch = useAppDispatch();
  const { locations } = useAppSelector((state: any) => state.location);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

    socket.on('locationUpdate', (data: any) => {
      dispatch(updateLocation(data));
    });

    setIsConnected(true);

    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [dispatch]);

  const refreshLocations = useCallback(async () => {
    // Fetch latest locations from API
  }, []);

  return { locations, isConnected, refreshLocations };
};

export default useLiveMap;