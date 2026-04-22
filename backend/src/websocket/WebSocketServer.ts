import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export class WebSocketServer {
  io: Server;
  
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: { origin: '*' }
    });
    
    this.setupHandlers();
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`Client connected: ${socket.id}`);
      
      socket.on('join:emergency', (emergencyId: string) => {
        socket.join(`emergency:${emergencyId}`);
      });
      
      socket.on('join:family', (familyId: string) => {
        socket.join(`family:${familyId}`);
      });
      
      socket.on('join:admin', () => {
        socket.join('admin');
      });
      
      socket.on('location:update', (data: any) => {
        this.io.to('admin').emit('location:update', data);
      });
      
      socket.on('emergency:new', (data: any) => {
        this.io.to('admin').emit('emergency:new', data);
      });
      
      socket.on('family:status', (data: any) => {
        this.io.to(`family:${data.familyId}`).emit('family:status', data);
      });
      
      socket.on('broadcast:new', (data: any) => {
        this.io.emit('broadcast:new', data);
      });
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
  
  emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }
  
  emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }
}
