import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './auth/authRoutes';
import userRoutes from './users/userRoutes';
import emergencyRoutes from './emergency/emergencyRoutes';
import locationRoutes from './location/locationRoutes';
import broadcastRoutes from './barangay/broadcastRoutes';
import familyRoutes from './family/familyRoutes';
import hazardRoutes from './hazard/hazardRoutes';
import responderRoutes from './responder/responderRoutes';
import analyticsRoutes from './analytics/analyticsRoutes';
import { database } from './config/database';
import { ensureEmergencySchema } from './emergency/emergencySchema';
import { uploadsRootDir } from './emergency/emergencyUpload';
import { ensureUserSchema } from './users/userSchema';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

fs.mkdirSync(uploadsRootDir, { recursive: true });

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(uploadsRootDir)));

app.get('/', (_req, res) => {
  res.json({
    service: 'EmergencyTool Backend API',
    status: 'ok',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      emergency: '/api/emergency',
      location: '/api/location',
      broadcasts: '/api/broadcasts',
      family: '/api/family',
      hazard: '/api/hazard',
      responders: '/api/responders',
      analytics: '/api/analytics',
      uploads: '/uploads',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/hazard', hazardRoutes);
app.use('/api/responders', responderRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.set('io', io);

io.on('connection', (socket: any) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('join:admin', () => socket.join('admin'));
  socket.on('join:emergency', (id: string) => socket.join(`emergency:${id}`));
  socket.on('join:family', (id: string) => socket.join(`family:${id}`));
  
  socket.on('location:update', (data: any) => io.to('admin').emit('location:update', data));
  socket.on('emergency:new', (data: any) => io.to('admin').emit('emergency:new', data));
  socket.on('newEmergency', (data: any) => io.to('admin').emit('newEmergency', data));
  socket.on('emergencyUpdate', (data: any) => io.to('admin').emit('emergencyUpdate', data));
  socket.on('broadcast:new', (data: any) => io.emit('broadcast:new', data));
  
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await database.connect();
    await ensureUserSchema();
    await ensureEmergencySchema();
    console.log('✅ Database connected');
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();
