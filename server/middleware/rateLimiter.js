import { stmts } from '../db.js';
import config from '../config.js';

export default function rateLimiter(action, maxPerHour) {
  return (req, res, next) => {
    const ipHash = req.ipHash;
    if (!ipHash) {
      return res.status(500).json({ error: 'IP hash not available' });
    }

    const { count } = stmts.countRateLimits.get(ipHash, action);
    if (count >= maxPerHour) {
      return res.status(429).json({
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: '1 hour',
      });
    }

    if (action === 'confession' || action === 'reply') {
      const last = stmts.getLastAction.get(ipHash, action);
      if (last) {
        const lastTime = new Date(last.created_at + 'Z').getTime();
        const elapsed = Date.now() - lastTime;
        if (elapsed < config.POST_COOLDOWN) {
          const waitSec = Math.ceil((config.POST_COOLDOWN - elapsed) / 1000);
          return res.status(429).json({
            error: `Please wait ${waitSec} seconds before posting again.`,
            retryAfter: `${waitSec} seconds`,
            cooldownRemaining: waitSec,
          });
        }
      }
    }

    stmts.insertRateLimit.run(ipHash, action);
    next();
  };
}
