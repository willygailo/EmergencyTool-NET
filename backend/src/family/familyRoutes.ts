import { Router, Response } from 'express';
import { pool } from '../config/database';
import { authMiddleware } from '../auth/authMiddleware';

const router = Router();

// Apply auth middleware to ALL family routes
router.use(authMiddleware);

// Helper to get or create family
const getOrCreateFamily = async (userId: string) => {
  let result = await pool.query('SELECT * FROM families WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await pool.query(
      'INSERT INTO families (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, 'My Family']
    );
  }
  return result.rows[0];
};

router.get('/circle', async (req, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const family = await getOrCreateFamily(userId);
    
    const membersResult = await pool.query(
      'SELECT id, name, email, phone, status, relationship FROM family_members WHERE family_id = $1',
      [family.id]
    );
    
    res.json({ ...family, members: membersResult.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get family circle' });
  }
});

router.post('/members', async (req, res: Response) => {
  try {
    const { name, phone, relationship } = req.body;
    const userId = (req as any).user?.userId;
    const family = await getOrCreateFamily(userId);

    const result = await pool.query(
      'INSERT INTO family_members (family_id, name, phone, relationship) VALUES ($1, $2, $3, $4) RETURNING *',
      [family.id, name, phone, relationship]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

router.delete('/members/:id', async (req, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const family = await getOrCreateFamily(userId);

    await pool.query(
      'DELETE FROM family_members WHERE id = $1 AND family_id = $2',
      [req.params.id, family.id]
    );
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

router.post('/circle/:memberId/checkin', async (req, res: Response) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user?.userId;
    const family = await getOrCreateFamily(userId);

    await pool.query(
      'UPDATE family_members SET status = $1, last_checkin = NOW() WHERE id = $2 AND family_id = $3',
      [status, req.params.memberId, family.id]
    );
    res.json({ message: 'Check-in recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// GET /family/status — returns aggregate safety status for the user's family circle
router.get('/status', async (req, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const family = await getOrCreateFamily(userId);

    const membersResult = await pool.query(
      'SELECT status FROM family_members WHERE family_id = $1',
      [family.id]
    );

    const members = membersResult.rows;
    const total = members.length;
    const safeCount = members.filter((m: any) => m.status === 'safe').length;
    const unsafeCount = members.filter((m: any) => m.status === 'unsafe').length;

    let overallStatus = 'pending';
    if (total > 0) {
      if (safeCount === total) overallStatus = 'all_safe';
      else if (unsafeCount > 0) overallStatus = 'warning';
    }

    res.json({ total, safeCount, unsafeCount, overallStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get family status' });
  }
});

export default router;