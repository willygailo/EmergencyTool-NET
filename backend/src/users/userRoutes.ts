import { Router } from 'express';
import { userController } from './userController';
import { authMiddleware } from '../auth/authMiddleware';
import { roleMiddleware } from '../auth/roleMiddleware';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), userController.listUsers);
router.get('/profile', authMiddleware, userController.getProfile);
router.get('/household', authMiddleware, userController.getHousehold);
router.put('/household', authMiddleware, userController.updateHousehold);
router.get('/emergency-contacts', authMiddleware, userController.getEmergencyContacts);
router.post('/emergency-contacts', authMiddleware, userController.addEmergencyContact);
router.delete('/emergency-contacts/:contactId', authMiddleware, userController.removeEmergencyContact);
router.put('/fcm-token', authMiddleware, userController.updateFcmToken);
router.put('/expo-push-token', authMiddleware, userController.updateExpoPushToken);

export default router;
