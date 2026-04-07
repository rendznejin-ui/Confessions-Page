import { body, param, query, validationResult } from 'express-validator';
import config from '../config.js';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => e.msg),
    });
  }
  next();
};

export const validateConfession = [
  body('body')
    .trim()
    .isLength({ min: config.CONFESSION_MIN_LENGTH, max: config.CONFESSION_MAX_LENGTH })
    .withMessage(`Confession must be between ${config.CONFESSION_MIN_LENGTH} and ${config.CONFESSION_MAX_LENGTH} characters`)
    .escape(),
  body('category')
    .optional()
    .isIn(config.CATEGORIES)
    .withMessage(`Category must be one of: ${config.CATEGORIES.join(', ')}`),
  handleValidation,
];

export const validateReply = [
  body('body')
    .trim()
    .isLength({ min: 1, max: config.REPLY_MAX_LENGTH })
    .withMessage(`Reply must be between 1 and ${config.REPLY_MAX_LENGTH} characters`)
    .escape(),
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Confession ID is required'),
  handleValidation,
];

export const validateReaction = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Confession ID is required'),
  body('sessionId')
    .isString()
    .notEmpty()
    .withMessage('Session ID is required'),
  handleValidation,
];

export const validateFeedQuery = [
  query('sort')
    .optional()
    .isIn(['latest', 'trending'])
    .withMessage('Sort must be "latest" or "trending"'),
  query('category')
    .optional()
    .isIn(config.CATEGORIES)
    .withMessage(`Category must be one of: ${config.CATEGORIES.join(', ')}`),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  handleValidation,
];
