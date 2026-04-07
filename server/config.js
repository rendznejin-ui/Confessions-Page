import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  PORT: process.env.PORT || 3001,
  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'data', 'confessions.db'),
  IP_PEPPER: process.env.IP_PEPPER || 'hck-conf-pepper-2026-change-me',
  RATE_LIMITS: {
    CONFESSIONS_PER_HOUR: 5,
    REPLIES_PER_HOUR: 20,
    REACTIONS_PER_HOUR: 50,
  },
  CONFESSION_MIN_LENGTH: 1,
  CONFESSION_MAX_LENGTH: 2000,
  REPLY_MAX_LENGTH: 500,
  CATEGORIES: ['general', 'crush', 'rant', 'advice', 'funny', 'regret', 'secret', 'gratitude'],
  PAGE_SIZE: 20,
  RATE_LIMIT_WINDOW: 60 * 60 * 1000,
  POST_COOLDOWN: 30 * 1000,
};

export default config;
