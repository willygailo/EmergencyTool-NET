import { Router } from 'express';
import { emergencyController } from './emergencyController';
import { authMiddleware } from '../auth/authMiddleware';
import { emergencyMediaUpload } from './emergencyUpload';

const router = Router();

router.post('/reports', authMiddleware, emergencyMediaUpload, emergencyController.createReport);
router.get('/reports', emergencyController.getReports);
router.get('/reports/active', emergencyController.getActiveReports);
router.get('/reports/:id', emergencyController.getReportById);
router.put('/reports/:id/status', authMiddleware, emergencyController.updateStatus);
router.post('/reports/:id/assign', authMiddleware, emergencyController.assignResponder);
router.get('/reports/:id/history', emergencyController.getReportHistory);
router.get('/types', emergencyController.getEmergencyTypes);

export default router;
