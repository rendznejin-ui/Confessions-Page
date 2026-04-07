import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stmts } from '../db.js';
import config from '../config.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { validateReply } from '../middleware/validator.js';
import { moderate } from '../services/moderation.js';
import { detectSpam } from '../services/spam.js';

const router = Router();

// POST /api/confessions/:id/replies
router.post(
  '/:id/replies',
  rateLimiter('reply', config.RATE_LIMITS.REPLIES_PER_HOUR),
  validateReply,
  (req, res) => {
    try {
      const confessionId = req.params.id;
      const { body: replyBody } = req.body;

      const confession = stmts.getConfessionById.get(confessionId);
      if (!confession) return res.status(404).json({ error: 'Confession not found' });

      const spamResult = detectSpam(replyBody);
      if (spamResult.spam) {
        return res.status(400).json({ error: 'Your reply was flagged as spam', reason: spamResult.reason });
      }

      const modResult = moderate(replyBody);
      if (!modResult.safe) {
        return res.status(400).json({ error: 'Your reply was flagged by our content filter', reason: modResult.reason });
      }

      const id = uuidv4();
      stmts.insertReply.run(id, confessionId, replyBody);
      stmts.incrementReplyCount.run(confessionId);

      res.status(201).json({
        id,
        confession_id: confessionId,
        body: replyBody,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error creating reply:', err.message);
      res.status(500).json({ error: 'Failed to create reply' });
    }
  }
);

export default router;
