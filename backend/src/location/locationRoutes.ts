import { Router } from 'express';
import { locationController } from './locationController';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

router.post('/share', authMiddleware, locationController.shareLocation);
router.get('/current', authMiddleware, locationController.getCurrentLocation);
router.get('/history', authMiddleware, locationController.getLocationHistory);
router.post('/tracking/start', authMiddleware, locationController.startTracking);
router.post('/tracking/stop', authMiddleware, locationController.stopTracking);
router.get('/live/:userId', locationController.getLiveLocation);
router.post('/shareable-link', authMiddleware, locationController.generateShareableLink);
router.get('/shared/:token', locationController.getSharedLocation);

export default router;