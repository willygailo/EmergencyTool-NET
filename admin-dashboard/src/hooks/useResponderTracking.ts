import { useEffect } from 'react';
import { useAppDispatch } from './useRedux';
import { updateResponder } from '../store/responderSlice';
import websocketService from '../services/websocketService';

export const useResponderTracking = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = websocketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000');

    socket.on('responderUpdate', (data: any) => {
      dispatch(updateResponder(data));
    });

    return () => {
      websocketService.disconnect();
    };
  }, [dispatch]);

  return null;
};

export default useResponderTracking;