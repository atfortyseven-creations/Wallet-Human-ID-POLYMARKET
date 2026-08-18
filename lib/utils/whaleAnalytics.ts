// Privacy-first, fully local analytics — zero external data transfer
// All events stay on-device in localStorage. No telemetry servers.

export interface WhaleEvent {
  type: string;
  timestamp: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface WhaleReport {
  totalMessages: number;
  totalCalls: number;
  totalContacts: number;
  avgSessionMinutes: number;
  topFeatures: string[];
  totalEvents: number;
}

const STORAGE_KEY = 'whale_analytics';
const MAX_EVENTS = 500;

export class WhaleAnalytics {
  private events: WhaleEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.events = JSON.parse(raw);
      }
    } catch {
      this.events = [];
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      // Keep only the last MAX_EVENTS
      const toStore = this.events.slice(-MAX_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {}
  }

  /**
   * Track a user event locally.
   */
  track(type: string, metadata?: Record<string, string | number | boolean>): void {
    const event: WhaleEvent = {
      type,
      timestamp: Date.now(),
      ...(metadata ? { metadata } : {}),
    };
    this.events.push(event);
    // Rotate oldest if over limit
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
    this.persistToStorage();
  }

  /**
   * Generate a local analytics report.
   */
  getReport(): WhaleReport {
    const countByType = new Map<string, number>();
    for (const e of this.events) {
      countByType.set(e.type, (countByType.get(e.type) ?? 0) + 1);
    }

    const topFeatures = Array.from(countByType.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type);

    let avgSessionMinutes = 0;
    if (this.events.length >= 2) {
      const first = this.events[0].timestamp;
      const last = this.events[this.events.length - 1].timestamp;
      avgSessionMinutes = Math.round((last - first) / (60 * 1000));
    }

    return {
      totalMessages: countByType.get('message_sent') ?? 0,
      totalCalls: (countByType.get('call_started') ?? 0) + (countByType.get('call_answered') ?? 0),
      totalContacts: countByType.get('contact_added') ?? 0,
      avgSessionMinutes,
      topFeatures,
      totalEvents: this.events.length,
    };
  }

  /**
   * Export all events as JSON (for debug/backup).
   */
  exportJSON(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clear all analytics data.
   */
  clear(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }

  /**
   * Get event count for a specific type.
   */
  getCount(type: string): number {
    return this.events.filter(e => e.type === type).length;
  }
}

export const whaleAnalytics = new WhaleAnalytics();

// ─── Convenience Tracking Functions ─────────────────────────────────────────

export const trackMessageSent = (peerAddress?: string) =>
  whaleAnalytics.track('message_sent', peerAddress ? { peer: peerAddress.slice(0, 10) } : undefined);

export const trackCallStarted = (type: 'audio' | 'video') =>
  whaleAnalytics.track('call_started', { type });

export const trackCallAnswered = (type: 'audio' | 'video', durationSeconds?: number) =>
  whaleAnalytics.track('call_answered', { type, ...(durationSeconds ? { durationSeconds } : {}) });

export const trackAttachmentSent = (mimeType: string) =>
  whaleAnalytics.track('attachment_sent', { mime: mimeType.split('/')[0] });

export const trackContactAdded = () =>
  whaleAnalytics.track('contact_added');

export const trackStatusPosted = () =>
  whaleAnalytics.track('status_posted');

export const trackFeatureUsed = (feature: string) =>
  whaleAnalytics.track('feature_used', { feature });
