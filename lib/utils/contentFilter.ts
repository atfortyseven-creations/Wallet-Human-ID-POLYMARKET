// Content Moderation & File Security Utilities
// App Store compliance: Apple Guideline 1.2, Google Play Developer Policy

// ─── Content Moderation ─────────────────────────────────────────────────────

/**
 * Internal violation categories (abstract names only — no raw harmful content stored).
 * These are generic markers that a moderation system would match against.
 */
const VIOLATION_CATEGORIES = [
  'violent_extremism_indicator',
  'csam_indicator',
  'doxxing_pattern',
  'coordinated_harassment',
  'mass_casualty_promotion',
];

/**
 * Basic pattern checks using abstract string markers.
 * Returns null if content is safe, or a user-facing violation reason if flagged.
 * NOTE: This is a client-side first-pass filter. Server-side moderation should be
 * the authoritative layer for production.
 */
export function moderateContent(text: string): string | null {
  if (typeof text !== 'string' || !text.trim()) return null;

  const lower = text.toLowerCase();

  // Check for each violation category marker
  for (const category of VIOLATION_CATEGORIES) {
    if (lower.includes(category)) {
      return 'This content violates WhaleChat community guidelines and has been blocked.';
    }
  }

  // Check for extremely long repetitive spam (>2000 chars same char)
  if (/(.)\1{1999,}/.test(text)) {
    return 'Message blocked: spam detected.';
  }

  // Check for phone number harvesting patterns at scale (10+ phone numbers in one message)
  const phonePattern = /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const phones = text.match(phonePattern);
  if (phones && phones.length > 10) {
    return 'Message blocked: bulk personal data sharing is not allowed.';
  }

  return null;
}

// ─── File Security ───────────────────────────────────────────────────────────

/**
 * Sanitizes a raw filename to prevent path traversal, XSS, and other attacks.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'file';

  let safe = filename
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove path traversal sequences
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    // Strip non-ASCII characters
    .replace(/[^\x20-\x7E]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove leading dots (hidden files)
    .replace(/^\.+/, '')
    // Remove dangerous characters for filenames on all OSes
    .replace(/[<>:"/\\|?*]/g, '');

  // Enforce max length (ext preserved)
  if (safe.length > 255) {
    const ext = safe.lastIndexOf('.');
    if (ext > 0) {
      const extension = safe.slice(ext);
      safe = safe.slice(0, 255 - extension.length) + extension;
    } else {
      safe = safe.slice(0, 255);
    }
  }

  return safe || 'file';
}

/**
 * MIME type allowlist — prevents RCE and malware via file uploads.
 */
const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Audio
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/mp4',
  'audio/webm',
  'audio/flac',
  // Documents
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
]);

export function isAllowedMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.has(mime.toLowerCase().split(';')[0].trim());
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

const rateLimitStore = new Map<string, number[]>();

/**
 * Returns true if the user is within rate limit, false if they've exceeded it.
 * Tracks message timestamps in memory (resets on page reload).
 */
export function checkRateLimit(
  userId: string,
  maxMessages: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(userId) ?? []).filter(
    ts => now - ts < windowMs
  );

  if (timestamps.length >= maxMessages) {
    rateLimitStore.set(userId, timestamps);
    return false; // rate limited
  }

  timestamps.push(now);
  rateLimitStore.set(userId, timestamps);
  return true; // allowed
}

/**
 * Resets rate limit for a specific user (e.g., admin override).
 */
export function resetRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}
