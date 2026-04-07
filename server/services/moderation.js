const BLOCKED_TERMS = [
  'kill yourself', 'kys', 'go die',
  'school shooting', 'bomb threat', 'i will hurt',
  'white power', 'white supremacy', 'heil hitler',
  'gas the', 'lynch',
];

const THREAT_PATTERNS = [
  /i('m| am) going to (kill|hurt|shoot|bomb|attack)/i,
  /i('ll| will) (kill|hurt|shoot|bomb|attack)/i,
  /you (should|deserve to) die/i,
  /i (want|wish) you (were )?dead/i,
  /threat(en)? to/i,
  /bomb\s*(the|a|this)/i,
  /school\s*shoot/i,
  /mass\s*(shoot|murder|kill)/i,
];

const HARASSMENT_PATTERNS = [
  /you('re| are) (a |)(worthless|pathetic|disgusting|trash|garbage)/i,
  /nobody (loves|likes|cares about) you/i,
  /everyone hates you/i,
  /you('re| are) (going to|gonna) (regret|pay)/i,
];

export function moderate(text) {
  if (!text || typeof text !== 'string') {
    return { safe: false, reason: 'Empty or invalid content', severity: 'error' };
  }

  const lowerText = text.toLowerCase().trim();

  for (const term of BLOCKED_TERMS) {
    if (lowerText.includes(term)) {
      return { safe: false, reason: 'Content contains prohibited language', severity: 'high' };
    }
  }

  for (const pattern of THREAT_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Content contains threatening language', severity: 'critical' };
    }
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Content contains harassing language', severity: 'high' };
    }
  }

  if (text.length > 10) {
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.7) {
      return { safe: false, reason: 'Excessive use of caps lock. Please rewrite calmly.', severity: 'low' };
    }
  }

  return { safe: true, reason: null, severity: null };
}
