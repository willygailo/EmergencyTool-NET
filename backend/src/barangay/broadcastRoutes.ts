import { Router, Response } from 'express';
import { broadcastController } from './broadcastController';
import { authMiddleware } from '../auth/authMiddleware';
import { roleMiddleware } from '../auth/roleMiddleware';

const router = Router();

router.get('/', broadcastController.getBroadcasts);
router.get('/active', broadcastController.getActiveBroadcasts);
router.post('/', authMiddleware, roleMiddleware(['admin', 'barangay_admin']), broadcastController.createBroadcast);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'barangay_admin']), broadcastController.deleteBroadcast);

export default router;