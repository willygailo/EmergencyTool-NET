import { Request, Response } from 'express';
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const broadcastController = {
  getBroadcasts: async (req: Request, res: Response) => {
    try {
      const { barangay, limit = 50 } = req.query;
      let query = 'SELECT * FROM broadcasts';
      const params: any[] = [];
      
      if (barangay) {
        query += ' WHERE barangay = $1 OR barangay IS NULL';
        params.push(barangay);
      }
      
      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
      params.push(limit);
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch broadcasts' });
    }
  },

  getActiveBroadcasts: async (req: Request, res: Response) => {
    try {
      const { barangay } = req.query;
      let query = `SELECT * FROM broadcasts WHERE (expires_at IS NULL OR expires_at > NOW())`;
      const params: any[] = [];
      
      if (barangay) {
        query += ' AND (barangay = $1 OR barangay IS NULL)';
        params.push(barangay);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active broadcasts' });
    }
  },

  createBroadcast: async (req: Request, res: Response) => {
    try {
      const { title, message, barangay, type = 'alert', priority = 'normal', targetAll = false } = req.body;
      const userId = (req as any).user?.userId;
      
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }
      
      const id = uuidv4();
      
      const result = await pool.query(
        `INSERT INTO broadcasts (id, title, message, barangay, type, priority, created_by, target_all) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [id, title, message, targetAll ? null : barangay, type, priority, userId, targetAll]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create broadcast error:', error);
      res.status(500).json({ error: 'Failed to create broadcast' });
    }
  },

  deleteBroadcast: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      
      await pool.query('DELETE FROM broadcasts WHERE id = $1 AND created_by = $2', [id, userId]);
      
      res.json({ message: 'Broadcast deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete broadcast' });
    }
  },
};

export default broadcastController;