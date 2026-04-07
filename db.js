import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import config from './config.js';

const dataDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS confessions (
    id TEXT PRIMARY KEY,
    body TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    likes INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    is_flagged INTEGER NOT NULL DEFAULT 0,
    is_hidden INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    confession_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_flagged INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (confession_id) REFERENCES confessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,
    confession_id TEXT NOT NULL,
    session_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (confession_id) REFERENCES confessions(id) ON DELETE CASCADE,
    UNIQUE(confession_id, session_hash)
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_confessions_created ON confessions(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_confessions_likes ON confessions(likes DESC);
  CREATE INDEX IF NOT EXISTS idx_confessions_category ON confessions(category);
  CREATE INDEX IF NOT EXISTS idx_replies_confession ON replies(confession_id);
  CREATE INDEX IF NOT EXISTS idx_rate_limits_hash ON rate_limits(ip_hash, action);
  CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON rate_limits(created_at);
`);

const stmts = {
  insertConfession: db.prepare(`INSERT INTO confessions (id, body, category) VALUES (?, ?, ?)`),
  getConfessionsLatest: db.prepare(`SELECT id, body, category, created_at, likes, reply_count FROM confessions WHERE is_hidden = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getConfessionsTrending: db.prepare(`SELECT id, body, category, created_at, likes, reply_count FROM confessions WHERE is_hidden = 0 ORDER BY likes DESC, created_at DESC LIMIT ? OFFSET ?`),
  getConfessionsByCategory: db.prepare(`SELECT id, body, category, created_at, likes, reply_count FROM confessions WHERE is_hidden = 0 AND category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`),
  getConfessionById: db.prepare(`SELECT id, body, category, created_at, likes, reply_count FROM confessions WHERE id = ? AND is_hidden = 0`),
  incrementLikes: db.prepare(`UPDATE confessions SET likes = likes + 1 WHERE id = ?`),
  decrementLikes: db.prepare(`UPDATE confessions SET likes = likes - 1 WHERE id = ? AND likes > 0`),
  incrementReplyCount: db.prepare(`UPDATE confessions SET reply_count = reply_count + 1 WHERE id = ?`),
  getTotalCount: db.prepare(`SELECT COUNT(*) as count FROM confessions WHERE is_hidden = 0`),
  getTotalCountByCategory: db.prepare(`SELECT COUNT(*) as count FROM confessions WHERE is_hidden = 0 AND category = ?`),
  insertReply: db.prepare(`INSERT INTO replies (id, confession_id, body) VALUES (?, ?, ?)`),
  getReplies: db.prepare(`SELECT id, body, created_at FROM replies WHERE confession_id = ? AND is_flagged = 0 ORDER BY created_at ASC`),
  insertReaction: db.prepare(`INSERT OR IGNORE INTO reactions (id, confession_id, session_hash) VALUES (?, ?, ?)`),
  deleteReaction: db.prepare(`DELETE FROM reactions WHERE confession_id = ? AND session_hash = ?`),
  checkReaction: db.prepare(`SELECT id FROM reactions WHERE confession_id = ? AND session_hash = ?`),
  insertRateLimit: db.prepare(`INSERT INTO rate_limits (ip_hash, action) VALUES (?, ?)`),
  countRateLimits: db.prepare(`SELECT COUNT(*) as count FROM rate_limits WHERE ip_hash = ? AND action = ? AND created_at > datetime('now', '-1 hour')`),
  getLastAction: db.prepare(`SELECT created_at FROM rate_limits WHERE ip_hash = ? AND action = ? ORDER BY created_at DESC LIMIT 1`),
  purgeOldRateLimits: db.prepare(`DELETE FROM rate_limits WHERE created_at < datetime('now', '-24 hours')`),
};

setInterval(() => {
  try { stmts.purgeOldRateLimits.run(); } catch (e) { /* non-critical */ }
}, 60 * 60 * 1000);

stmts.purgeOldRateLimits.run();

export { db, stmts };
