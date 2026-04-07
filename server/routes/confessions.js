import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { stmts } from '../db.js';
import config from '../config.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { validateConfession, validateFeedQuery } from '../middleware/validator.js';
import { moderate } from '../services/moderation.js';
import { detectSpam } from '../services/spam.js';

const router = Router();

// GET /api/confessions — public feed
router.get('/', validateFeedQuery, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'latest';
    const category = req.query.category;
    const limit = config.PAGE_SIZE;
    const offset = (page - 1) * limit;

    let confessions;
    let total;

    if (category) {
      confessions = stmts.getConfessionsByCategory.all(category, limit, offset);
      total = stmts.getTotalCountByCategory.get(category).count;
    } else if (sort === 'trending') {
      confessions = stmts.getConfessionsTrending.all(limit, offset);
      total = stmts.getTotalCount.get().count;
    } else {
      confessions = stmts.getConfessionsLatest.all(limit, offset);
      total = stmts.getTotalCount.get().count;
    }

    res.json({
      confessions,
      pagination: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error fetching confessions:', err.message);
    res.status(500).json({ error: 'Failed to fetch confessions' });
  }
});

// GET /api/confessions/:id — single confession with replies
router.get('/:id', (req, res) => {
  try {
    const confession = stmts.getConfessionById.get(req.params.id);
    if (!confession) return res.status(404).json({ error: 'Confession not found' });
    const replies = stmts.getReplies.all(req.params.id);
    res.json({ ...confession, replies });
  } catch (err) {
    console.error('Error fetching confession:', err.message);
    res.status(500).json({ error: 'Failed to fetch confession' });
  }
});

// POST /api/confessions — submit new confession
router.post(
  '/',
  rateLimiter('confession', config.RATE_LIMITS.CONFESSIONS_PER_HOUR),
  validateConfession,
  (req, res) => {
    try {
      const { body: confessionBody, category = 'general' } = req.body;

      const spamResult = detectSpam(confessionBody);
      if (spamResult.spam) {
        return res.status(400).json({ error: 'Your confession was flagged as spam', reason: spamResult.reason });
      }

      const modResult = moderate(confessionBody);
      if (!modResult.safe) {
        return res.status(400).json({ error: 'Your confession was flagged by our content filter', reason: modResult.reason });
      }

      const id = uuidv4();
      stmts.insertConfession.run(id, confessionBody, category);
      const confession = stmts.getConfessionById.get(id);
      res.status(201).json(confession);
    } catch (err) {
      console.error('Error creating confession:', err.message);
      res.status(500).json({ error: 'Failed to create confession' });
    }
  }
);

export default router;
