import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/', async (req, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM hazards ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hazards' });
  }
});

router.post('/', async (req, res: Response) => {
  try {
    const { type, latitude, longitude, description } = req.body;
    const result = await pool.query(
      'INSERT INTO hazards (type, latitude, longitude, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [type, latitude, longitude, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hazard report' });
  }
});

router.post('/:id/vote', async (req, res: Response) => {
  try {
    const { vote } = req.body;
    const column = vote === 'up' ? 'votes' : 'votes';
    await pool.query(`UPDATE hazards SET votes = votes + 1 WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

export default router;