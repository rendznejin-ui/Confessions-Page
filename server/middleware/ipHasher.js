import crypto from 'crypto';
import config from '../config.js';

export default function ipHasher(req, res, next) {
  const rawIp = req.ip || req.connection?.remoteAddress || 'unknown';

  req.ipHash = crypto
    .createHash('sha256')
    .update(rawIp + config.IP_PEPPER)
    .digest('hex');

  Object.defineProperty(req, 'ip', {
    get: () => '[redacted]',
    configurable: false,
  });

  next();
}
