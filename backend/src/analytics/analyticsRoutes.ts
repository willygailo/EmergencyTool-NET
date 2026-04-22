import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/stats', async (req, res: Response) => {
  try {
    const total = await pool.query('SELECT COUNT(*) as count FROM emergencies');
    const pending = await pool.query("SELECT COUNT(*) as count FROM emergencies WHERE status = 'pending'");
    const dispatched = await pool.query("SELECT COUNT(*) as count FROM emergencies WHERE status = 'dispatched'");
    const resolved = await pool.query("SELECT COUNT(*) as count FROM emergencies WHERE status = 'resolved'");
    
    const byType = await pool.query(
      'SELECT type, COUNT(*) as count FROM emergencies GROUP BY type ORDER BY count DESC'
    );
    
    res.json({
      total: parseInt(total.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      dispatched: parseInt(dispatched.rows[0].count),
      resolved: parseInt(resolved.rows[0].count),
      byType: byType.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/heatmap', async (req, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT latitude, longitude, type FROM emergencies WHERE latitude IS NOT NULL AND longitude IS NOT NULL'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

router.get('/monthly-report', async (req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, type, COUNT(*) as count 
       FROM emergencies 
       GROUP BY DATE_TRUNC('month', created_at), type 
       ORDER BY month DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
});

export default router;