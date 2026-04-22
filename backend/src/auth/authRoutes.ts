import { Router, Request, Response } from 'express';
import { authController } from './authController';
import { authMiddleware } from './authMiddleware';
import { roleMiddleware } from './roleMiddleware';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/logout', authMiddleware, authController.logout);

export default router;