import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stmts } from '../db.js';
import config from '../config.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { validateReaction } from '../middleware/validator.js';

const router = Router();

// POST /api/confessions/:id/react — like/unlike toggle
router.post(
  '/:id/react',
  rateLimiter('reaction', config.RATE_LIMITS.REACTIONS_PER_HOUR),
  validateReaction,
  (req, res) => {
    try {
      const confessionId = req.params.id;
      const { sessionId } = req.body;

      const confession = stmts.getConfessionById.get(confessionId);
      if (!confession) return res.status(404).json({ error: 'Confession not found' });

      const existing = stmts.checkReaction.get(confessionId, sessionId);

      if (existing) {
        stmts.deleteReaction.run(confessionId, sessionId);
        stmts.decrementLikes.run(confessionId);
        const updated = stmts.getConfessionById.get(confessionId);
        return res.json({ liked: false, likes: updated.likes });
      } else {
        const id = uuidv4();
        const result = stmts.insertReaction.run(id, confessionId, sessionId);
        if (result.changes > 0) {
          stmts.incrementLikes.run(confessionId);
        }
        const updated = stmts.getConfessionById.get(confessionId);
        return res.json({ liked: true, likes: updated.likes });
      }
    } catch (err) {
      console.error('Error processing reaction:', err.message);
      res.status(500).json({ error: 'Failed to process reaction' });
    }
  }
);

export default router;
