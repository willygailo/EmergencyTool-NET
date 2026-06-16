import { Router } from 'express';
import { aiController } from './aiController';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

// Chatbot route (requires user authentication)
router.post('/chat', authMiddleware, aiController.chat);

// Manually trigger or re-run report analysis
router.post('/analyze/:id', authMiddleware, aiController.analyzeReport);

export default router;
