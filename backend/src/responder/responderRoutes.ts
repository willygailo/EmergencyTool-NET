import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM responders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

router.get('/assignments', async (req, res: Response) => {
  try {
    const responderId = (req as any).user?.userId;
    const result = await pool.query(
      'SELECT e.* FROM emergencies e WHERE e.responder_id = $1 ORDER BY e.created_at DESC',
      [responderId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

router.put('/status', async (req, res: Response) => {
  try {
    const responderId = (req as any).user?.userId;
    const { status, latitude, longitude } = req.body;
    
    await pool.query(
      'UPDATE responders SET status = $1, latitude = $2, longitude = $3 WHERE user_id = $4',
      [status, latitude, longitude, responderId]
    );
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;