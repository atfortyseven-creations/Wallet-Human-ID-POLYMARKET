/**
 * Enterprise WEBSOCKET CIRCUIT BREAKER
 *
 * Implements the Circuit Breaker pattern for WebSocket connections to RPC providers.
 * Prevents cascading failures when upstream providers become unstable.
 *
 * States:
 *   CLOSED    Normal operation. Requests flow through.
 *   OPEN      Failure threshold exceeded. Requests rejected immediately.
 *   HALF_OPEN  Probe state. One request allowed to test if upstream recovered.
 *
 * Integration: Wrap ResilientProvider WebSocket calls with CircuitBreaker.execute()
 *
 * Reference: Michael Nygard, "Release It!" (2007)  Circuit Breaker pattern
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit */
  failureThreshold: number;
  /** Milliseconds to wait in OPEN state before transitioning to HALF_OPEN */
  openDurationMs: number;
  /** Milliseconds between heartbeat probes (only in CLOSED state) */
  heartbeatIntervalMs: number;
  /** Identifier for this circuit (used in logs) */
  name: string;
}

export interface CircuitMetrics {
  state: CircuitState;
  consecutiveFailures: number;
  totalFailures: number;
  totalSuccesses: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  openedAt: number | null;
  name: string;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  openDurationMs: 30_000,   // 30 seconds in OPEN before probing
  heartbeatIntervalMs: 15_000,
  name: 'system-ws',
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private lastFailureAt: number | null = null;
  private lastSuccessAt: number | null = null;
  private openedAt: number | null = null;
  private readonly config: CircuitBreakerConfig;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private onStateChange?: (prev: CircuitState, next: CircuitState, name: string) => void;

  constructor(
    config: Partial<CircuitBreakerConfig> = {},
    onStateChange?: (prev: CircuitState, next: CircuitState, name: string) => void
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onStateChange = onStateChange;
  }

  /** Get current circuit state and metrics */
  getMetrics(): CircuitMetrics {
    return {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      lastFailureAt: this.lastFailureAt,
      lastSuccessAt: this.lastSuccessAt,
      openedAt: this.openedAt,
      name: this.config.name,
    };
  }

  /** Execute a function through the circuit breaker */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      const elapsed = Date.now() - (this.openedAt ?? 0);
      if (elapsed < this.config.openDurationMs) {
        throw new Error(
          `[CircuitBreaker:${this.config.name}] Circuit OPEN. ` +
          `Retry in ${Math.ceil((this.config.openDurationMs - elapsed) / 1000)}s.`
        );
      }
      // Transition to HALF_OPEN for probe
      this.transition('HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }

  /** Record a successful operation */
  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.totalSuccesses++;
    this.lastSuccessAt = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Upstream recovered  close the circuit
      this.transition('CLOSED');
    }
  }

  /** Record a failed operation */
  private onFailure(err: unknown): void {
    this.consecutiveFailures++;
    this.totalFailures++;
    this.lastFailureAt = Date.now();

    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[CircuitBreaker:${this.config.name}] Failure ${this.consecutiveFailures}/${this.config.failureThreshold}: ${msg}`
    );

    if (
      this.state === 'HALF_OPEN' ||
      this.consecutiveFailures >= this.config.failureThreshold
    ) {
      this.transition('OPEN');
    }
  }

  /** Transition to a new state and emit the change */
  private transition(next: CircuitState): void {
    const prev = this.state;
    if (prev === next) return;

    this.state = next;

    if (next === 'OPEN') {
      this.openedAt = Date.now();
      this.stopHeartbeat();
      console.error(
        `[CircuitBreaker:${this.config.name}]  Circuit OPENED after ` +
        `${this.consecutiveFailures} failures. Pausing ${this.config.openDurationMs / 1000}s.`
      );
    } else if (next === 'CLOSED') {
      this.openedAt = null;
      this.consecutiveFailures = 0;
      this.startHeartbeat();
      console.log(`[CircuitBreaker:${this.config.name}]  Circuit CLOSED  upstream recovered.`);
    } else if (next === 'HALF_OPEN') {
      console.log(`[CircuitBreaker:${this.config.name}]  Circuit HALF_OPEN  probing upstream.`);
    }

    this.onStateChange?.(prev, next, this.config.name);
  }

  /** Start heartbeat timer (emits periodic health logs in CLOSED state) */
  startHeartbeat(probe?: () => Promise<boolean>): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(async () => {
      if (this.state !== 'CLOSED') return;
      if (probe) {
        try {
          const alive = await probe();
          if (!alive) this.onFailure(new Error('Heartbeat probe returned false'));
        } catch (err) {
          this.onFailure(err);
        }
      }
      // Always emit metrics on heartbeat for external monitoring
      const m = this.getMetrics();
      console.debug(
        `[CircuitBreaker:${m.name}]  CLOSED | successes=${m.totalSuccesses} failures=${m.totalFailures} consec=${m.consecutiveFailures}`
      );
    }, this.config.heartbeatIntervalMs);
  }

  /** Stop heartbeat timer */
  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /** Manual circuit reset (for admin/operator use) */
  reset(): void {
    this.stopHeartbeat();
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
    this.openedAt = null;
    this.lastFailureAt = null;
    console.log(`[CircuitBreaker:${this.config.name}]  Manually reset to CLOSED.`);
  }

  /** Dispose: clear timers */
  destroy(): void {
    this.stopHeartbeat();
  }
}

// Pre-configured breakers for each RPC provider used by the Whale Worker
export const baseCircuitBreaker = new CircuitBreaker(
  { name: 'rpc-base', failureThreshold: 3, openDurationMs: 30_000 },
  (prev, next, name) => {
    if (next === 'OPEN') {
      console.error(`[System] RPC provider "${name}" circuit opened. Failover to backup RPC.`);
    }
  }
);

export const ethereumCircuitBreaker = new CircuitBreaker(
  { name: 'rpc-ethereum', failureThreshold: 3, openDurationMs: 30_000 }
);

export const bscCircuitBreaker = new CircuitBreaker(
  { name: 'rpc-bsc', failureThreshold: 3, openDurationMs: 30_000 }
);

export const neo4jCircuitBreaker = new CircuitBreaker(
  { name: 'neo4j', failureThreshold: 2, openDurationMs: 60_000 },
  (prev, next) => {
    if (next === 'OPEN') {
      console.warn('[System] Neo4j circuit opened. Memory Grid mode activated.');
    }
    if (next === 'CLOSED') {
      console.log('[System] Neo4j recovered. Switching back from Memory Grid.');
    }
  }
);
