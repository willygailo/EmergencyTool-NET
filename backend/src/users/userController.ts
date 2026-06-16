import { Request, Response } from 'express';
import { pool } from '../config/database';

const formatManagedUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  phone: user.phone || '',
  barangay: user.barangay || '',
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at || null,
  lastLoginAt: user.last_login_at || null,
  passwordStatus: 'Secured',
});

export const userController = {
  listUsers: async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, phone, barangay, role, created_at, updated_at, last_login_at
         FROM users
         ORDER BY created_at DESC`
      );

      res.json(result.rows.map(formatManagedUser));
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: 'Failed to load users' });
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, phone, barangay, role, created_at, last_login_at
         FROM users WHERE id = $1`,
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  },

  getHousehold: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const result = await pool.query(
        'SELECT * FROM households WHERE user_id = $1',
        [userId]
      );
      res.json(result.rows[0] || null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get household' });
    }
  },

  updateHousehold: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { address, members, hasPwd, hasSenior, hasPregnant } = req.body;
      
      const existing = await pool.query('SELECT id FROM households WHERE user_id = $1', [userId]);
      
      if (existing.rows.length > 0) {
        const result = await pool.query(
          `UPDATE households SET address = $1, members = $2, has_pwd = $3, has_senior = $4, has_pregnant = $5, updated_at = NOW() 
           WHERE user_id = $6 
           RETURNING *`,
          [address, members, hasPwd, hasSenior, hasPregnant, userId]
        );
        res.json(result.rows[0]);
      } else {
        const result = await pool.query(
          `INSERT INTO households (user_id, address, members, has_pwd, has_senior, has_pregnant) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [userId, address, members, hasPwd, hasSenior, hasPregnant]
        );
        res.status(201).json(result.rows[0]);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update household' });
    }
  },

  getEmergencyContacts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const result = await pool.query(
        'SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY is_primary DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get emergency contacts' });
    }
  },

  addEmergencyContact: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { name, phone, relationship, isPrimary } = req.body;
      
      if (isPrimary) {
        await pool.query('UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = $1', [userId]);
      }
      
      const result = await pool.query(
        `INSERT INTO emergency_contacts (user_id, name, phone, relationship, is_primary) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [userId, name, phone, relationship, isPrimary]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add emergency contact' });
    }
  },

  removeEmergencyContact: async (req: Request, res: Response) => {
    try {
      const { contactId } = req.params;
      await pool.query('DELETE FROM emergency_contacts WHERE id = $1', [contactId]);
      res.json({ message: 'Contact removed' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove contact' });
    }
  },

  updateFcmToken: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { fcmToken } = req.body;
      
      await pool.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [fcmToken, userId]);
      res.json({ message: 'FCM token updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update FCM token' });
    }
  },

  updateExpoPushToken: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { expoPushToken } = req.body;
      
      await pool.query('UPDATE users SET expo_push_token = $1 WHERE id = $2', [expoPushToken, userId]);
      res.json({ message: 'Expo Push token updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update Expo Push token' });
    }
  },
};

export default userController;
