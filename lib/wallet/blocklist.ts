// lib/wallet/blocklist.ts
// Local blocklist enforcement for App Store / Google Play compliance

const BLOCKLIST_KEY = 'whale_blocklist';

export function getBlocklist(myAddress: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${BLOCKLIST_KEY}_${myAddress.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function blockUser(myAddress: string, peerAddress: string): void {
  const blocked = new Set(getBlocklist(myAddress));
  blocked.add(peerAddress.toLowerCase());
  try {
    localStorage.setItem(
      `${BLOCKLIST_KEY}_${myAddress.toLowerCase()}`,
      JSON.stringify(Array.from(blocked))
    );
  } catch {}
}

export function unblockUser(myAddress: string, peerAddress: string): void {
  const blocked = new Set(getBlocklist(myAddress));
  blocked.delete(peerAddress.toLowerCase());
  try {
    localStorage.setItem(
      `${BLOCKLIST_KEY}_${myAddress.toLowerCase()}`,
      JSON.stringify(Array.from(blocked))
    );
  } catch {}
}

export function isBlocked(myAddress: string, peerAddress: string): boolean {
  return getBlocklist(myAddress).includes(peerAddress.toLowerCase());
}

// ─── Reporting ──────────────────────────────────────────────────────────

const REPORT_KEY = 'whale_reports';

export interface UserReport {
  id: string;
  reporterAddress: string;
  reportedAddress: string;
  messageId?: string;
  reason: string;
  timestamp: number;
}

/**
 * Stores reports locally. In a decentralized app, reports are either kept local
 * (for personal moderation) or forwarded to a decentralized governance protocol.
 * To satisfy App Store review, we MUST have a block & report flow.
 */
export function reportUser(
  reporter: string,
  reported: string,
  reason: string,
  messageId?: string
): void {
  const report: UserReport = {
    id: crypto.randomUUID(),
    reporterAddress: reporter.toLowerCase(),
    reportedAddress: reported.toLowerCase(),
    messageId,
    reason,
    timestamp: Date.now(),
  };

  try {
    const raw = localStorage.getItem(REPORT_KEY) || '[]';
    const reports: UserReport[] = JSON.parse(raw);
    reports.push(report);
    localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
  } catch {}

  // Automatically block upon reporting (standard best practice)
  blockUser(reporter, reported);
}
