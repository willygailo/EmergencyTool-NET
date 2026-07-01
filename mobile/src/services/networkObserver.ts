import NetInfo from '@react-native-community/netinfo';
import { getQueuedItems, removeFromQueue } from '../offline/SyncQueue';
import api from './api';

let isSyncing = false;

const flushQueue = async () => {
  if (isSyncing) return;
  isSyncing = true;
  
  try {
    const items = await getQueuedItems();
    if (items.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`Flushing ${items.length} offline items to server...`);
    
    for (const item of items) {
      try {
        const payload = JSON.parse(item.payload);
        
        // Route payload based on type
        if (item.type === 'EMERGENCY_REPORT') {
          // Send to emergency endpoint
          await api.post('/emergency', payload);
        } else if (item.type === 'AI_CHAT') {
          // Optional: Sync AI chats, maybe not strictly needed for emergencies but good for history
          // await api.post('/ai/chat', payload);
        }
        
        // Remove from local queue on success
        await removeFromQueue(item.id);
        console.log(`Synced offline item ${item.id}`);
      } catch (err) {
        console.error(`Failed to sync item ${item.id}`, err);
        // Break early if server is still unreachable or error occurs
        break;
      }
    }
  } catch (error) {
    console.error('Error in flushQueue', error);
  } finally {
    isSyncing = false;
  }
};

export const initNetworkObserver = () => {
  NetInfo.addEventListener(state => {
    if (state.isInternetReachable) {
      flushQueue();
    }
  });
};
