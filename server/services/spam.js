import crypto from 'crypto';

const recentHashes = new Map();
const HASH_EXPIRY = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [hash, timestamp] of recentHashes) {
    if (now - timestamp > HASH_EXPIRY) {
      recentHashes.delete(hash);
    }
  }
}, 60 * 1000);

export function detectSpam(text) {
  if (!text || typeof text !== 'string') {
    return { spam: true, reason: 'Invalid content' };
  }

  const trimmed = text.trim();

  const urlCount = (trimmed.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (urlCount > 2) {
    return { spam: true, reason: 'Too many URLs detected' };
  }

  if (/(.)\1{15,}/i.test(trimmed)) {
    return { spam: true, reason: 'Excessive repeated characters' };
  }

  const words = trimmed.toLowerCase().split(/\s+/);
  if (words.length >= 5) {
    const wordCounts = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    const maxRepeat = Math.max(...Object.values(wordCounts));
    if (maxRepeat / words.length > 0.6) {
      return { spam: true, reason: 'Excessive word repetition detected' };
    }
  }

  const contentHash = crypto.createHash('md5').update(trimmed.toLowerCase()).digest('hex');
  if (recentHashes.has(contentHash)) {
    return { spam: true, reason: 'Duplicate submission detected' };
  }
  recentHashes.set(contentHash, Date.now());

  const specialCount = (trimmed.match(/[^a-zA-Z0-9\s.,!?'"()-]/g) || []).length;
  if (trimmed.length > 10 && specialCount / trimmed.length > 0.5) {
    return { spam: true, reason: 'Excessive special characters' };
  }

  return { spam: false, reason: null };
}
