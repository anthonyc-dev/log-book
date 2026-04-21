export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>'"]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .substring(0, 10000);
}

export function containsSensitiveContent(body: Record<string, unknown>): boolean {
  const SENSITIVE_PATTERNS = [
    /(\$\{|\$\()/,
    /require\s*\(/,
    /import\s+.*\s+from\s+['\"]/,
    /eval\s*\(/,
    /exec\s*\(/,
  ];

  const checkValue = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return SENSITIVE_PATTERNS.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  return checkValue(body);
}