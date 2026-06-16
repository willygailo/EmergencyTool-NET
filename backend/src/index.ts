import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

import authRoutes from './auth/authRoutes';
import userRoutes from './users/userRoutes';
import emergencyRoutes from './emergency/emergencyRoutes';
import locationRoutes from './location/locationRoutes';
import broadcastRoutes from './barangay/broadcastRoutes';
import familyRoutes from './family/familyRoutes';
import hazardRoutes from './hazard/hazardRoutes';
import responderRoutes from './responder/responderRoutes';
import analyticsRoutes from './analytics/analyticsRoutes';
import aiRoutes from './ai/aiRoutes';
import { database } from './config/database';
import { ensureAppSchema } from './config/schemaBootstrap';
import { uploadsRootDir } from './emergency/emergencyUpload';

const app = express();
const httpServer = createServer(app);

// Restrict CORS to allowed origins (add your prod domains here)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173', // Admin dashboard
  'http://localhost:8081', // Expo metro
  'exp://*', // Expo Go
];
const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

fs.mkdirSync(uploadsRootDir, { recursive: true });

app.use(cors({ origin: allowedOrigins }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'], // Allow uploaded media
    },
  },
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts' },
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

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
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.set('io', io);

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('join:admin', () => socket.join('admin'));
  socket.on('join:emergency', (id: string) => socket.join(`emergency:${id}`));
  socket.on('join:family', (id: string) => socket.join(`family:${id}`));
  
  socket.on('location:update', (data: Record<string, unknown>) => io.to('admin').emit('location:update', data));
  socket.on('emergency:new', (data: Record<string, unknown>) => io.to('admin').emit('emergency:new', data));
  socket.on('emergencyUpdate', (data: Record<string, unknown>) => io.to('admin').emit('emergencyUpdate', data));
  socket.on('broadcast:new', (data: Record<string, unknown>) => io.emit('broadcast:new', data));
  
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err.stack);
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await database.connect();
    await ensureAppSchema();
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
