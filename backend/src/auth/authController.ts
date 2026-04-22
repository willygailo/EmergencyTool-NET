import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Server as SocketIOServer } from 'socket.io';
import { pool } from '../config/database';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizePhone = (phone?: string | null) => {
  if (!phone) {
    return null;
  }

  const cleanedPhone = phone.trim().replace(/[^\d+]/g, '');
  return cleanedPhone || null;
};

const normalizeText = (value?: string | null) => value?.trim() || null;

const toAuthUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  phone: user.phone || '',
  role: user.role,
  barangay: user.barangay || '',
  createdAt: user.created_at || null,
  lastLoginAt: user.last_login_at || null,
});

const toManagedLoginUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.first_name || '',
  lastName: user.last_name || '',
  name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  phone: user.phone || '',
  barangay: user.barangay || '',
  role: user.role || 'user',
  createdAt: user.created_at || null,
  updatedAt: user.updated_at || null,
  lastLoginAt: user.last_login_at || null,
  passwordStatus: 'Secured',
});

const emitUserLoginEvent = (req: Request, user: any) => {
  const io = req.app.get('io') as SocketIOServer | undefined;
  if (!io) {
    return;
  }

  io.to('admin').emit('user:login', toManagedLoginUser(user));
};

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const normalizedEmail = normalizeEmail(email);
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const updatedUserResult = await pool.query(
        `UPDATE users
         SET last_login_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, first_name, last_name, phone, barangay, role, created_at, updated_at, last_login_at`,
        [user.id]
      );

      const authenticatedUser = updatedUserResult.rows[0] || user;
      
      const token = jwt.sign(
        { userId: authenticatedUser.id, role: authenticatedUser.role, email: authenticatedUser.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      emitUserLoginEvent(req, authenticatedUser);
      
      res.json({
        token,
        user: toAuthUser(authenticatedUser),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, phone, barangay } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
      }

      const normalizedEmail = normalizeEmail(email);
      const normalizedPhone = normalizePhone(phone);
      const normalizedFirstName = firstName.trim();
      const normalizedLastName = lastName.trim();
      const normalizedBarangay = normalizeText(barangay);

      const duplicateUser = normalizedPhone
        ? await pool.query(
            'SELECT id, email, phone FROM users WHERE email = $1 OR phone = $2 LIMIT 1',
            [normalizedEmail, normalizedPhone]
          )
        : await pool.query('SELECT id, email, phone FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);

      if (duplicateUser.rows.length > 0) {
        const existing = duplicateUser.rows[0];

        if (existing.email === normalizedEmail) {
          return res.status(409).json({ error: 'Email already exists' });
        }

        if (normalizedPhone && existing.phone === normalizedPhone) {
          return res.status(409).json({ error: 'Phone number already exists' });
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, barangay, role) 
         VALUES ($1, $2, $3, $4, $5, $6, 'user') 
         RETURNING id, email, first_name, last_name, phone, barangay, role, created_at`,
        [
          normalizedEmail,
          hashedPassword,
          normalizedFirstName,
          normalizedLastName,
          normalizedPhone,
          normalizedBarangay,
        ]
      );
      
      const user = result.rows[0];
      const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        token,
        user: toAuthUser(user),
      });
    } catch (error) {
      if ((error as any)?.code === '23505') {
        const message = `${(error as any)?.detail || ''} ${(error as any)?.constraint || ''}`.toLowerCase();

        if (message.includes('phone')) {
          return res.status(409).json({ error: 'Phone number already exists' });
        }

        if (message.includes('email')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, phone, barangay, role, created_at, last_login_at FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName, phone, barangay } = req.body;
      const normalizedPhone = normalizePhone(phone);
      const normalizedFirstName = firstName?.trim();
      const normalizedLastName = lastName?.trim();
      const normalizedBarangay = normalizeText(barangay);

      if (normalizedPhone) {
        const duplicatePhone = await pool.query(
          'SELECT id FROM users WHERE phone = $1 AND id <> $2 LIMIT 1',
          [normalizedPhone, userId]
        );

        if (duplicatePhone.rows.length > 0) {
          return res.status(409).json({ error: 'Phone number already exists' });
        }
      }

      const result = await pool.query(
        `UPDATE users SET first_name = $1, last_name = $2, phone = $3, barangay = $4, updated_at = NOW() 
         WHERE id = $5 
         RETURNING id, email, first_name, last_name, phone, barangay, role, created_at, updated_at, last_login_at`,
        [normalizedFirstName, normalizedLastName, normalizedPhone, normalizedBarangay, userId]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      if ((error as any)?.code === '23505') {
        return res.status(409).json({ error: 'Phone number already exists' });
      }

      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;
      
      const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
      
      if (user.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
      
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },

  logout: async (req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' });
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      
      const newToken = jwt.sign(
        { userId, role: userRole },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      res.json({ token: newToken });
    } catch (error) {
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  },
};

export default authController;
