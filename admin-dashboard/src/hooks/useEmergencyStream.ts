import { useEffect } from 'react';
import { useAppDispatch } from './useRedux';
import { addEmergency, updateEmergency } from '../store/emergencySlice';
import websocketService from '../services/websocketService';

export const useEmergencyStream = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

    socket.on('newEmergency', (data: any) => {
      dispatch(addEmergency(data));
    });

    socket.on('emergencyUpdate', (data: any) => {
      dispatch(updateEmergency(data));
    });

    return () => {
      websocketService.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default useEmergencyStream;