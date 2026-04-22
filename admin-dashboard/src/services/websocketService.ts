import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private activeUrl: string | null = null;
  private subscriberCount = 0;

  connect(url: string) {
    if (this.socket && this.activeUrl === url) {
      this.subscriberCount += 1;
      return this.socket;
    }

    if (this.socket && this.activeUrl !== url) {
      this.socket.disconnect();
      this.socket = null;
      this.activeUrl = null;
      this.subscriberCount = 0;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });
    this.activeUrl = url;
    this.subscriberCount = 1;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.subscriberCount = Math.max(0, this.subscriberCount - 1);

    if (this.subscriberCount === 0) {
      this.socket.disconnect();
      this.socket = null;
      this.activeUrl = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
