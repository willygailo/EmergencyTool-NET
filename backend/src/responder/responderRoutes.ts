import { Router, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

// Protect all responder routes with auth
router.use(authMiddleware);

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

router.get('/assignments/:id', async (req, res: Response) => {
  try {
    const responderId = (req as any).user?.userId;
    const result = await pool.query(
      `SELECT e.id, e.type, e.description, e.status, e.created_at as "createdAt",
        json_build_object('lat', e.latitude, 'lng', e.longitude, 'address', e.address) as location,
        json_build_object('name', u.first_name || ' ' || COALESCE(u.last_name, ''), 'phone', COALESCE(u.phone, '')) as caller
       FROM emergencies e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.id = $1 AND e.responder_id = $2`,
      [req.params.id, responderId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    
    // Convert to expected frontend format
    res.json({
       id: result.rows[0].id,
       emergency: {
         type: result.rows[0].type,
         description: result.rows[0].description,
         location: result.rows[0].location,
         caller: result.rows[0].caller
       },
       status: result.rows[0].status,
       createdAt: result.rows[0].createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

router.put('/assignments/:id/status', async (req, res: Response) => {
  try {
    const responderId = (req as any).user?.userId;
    const { status } = req.body;
    await pool.query(
      'UPDATE emergencies SET status = $1, updated_at = NOW() WHERE id = $2 AND responder_id = $3',
      [status, req.params.id, responderId]
    );
    res.json({ message: 'Assignment status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment status' });
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