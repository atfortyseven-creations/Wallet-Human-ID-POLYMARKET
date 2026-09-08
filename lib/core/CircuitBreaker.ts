/**
 * AEGIS CIRCUIT BREAKER
 * Prevents catastrophic app failure. If a service (XMTP, WebRTC, Livepeer) fails repeatedly,
 * the circuit "opens" and safely degrades the UI instead of crashing.
 */
export class CircuitBreaker {
  private failureThreshold: number;
  private recoveryTimeout: number;
  private failures: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt: number = 0;

  constructor(failureThreshold = 3, recoveryTimeoutMs = 10000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeoutMs;
  }

  public async execute<T>(action: () => Promise<T>, fallback: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        console.warn("[CIRCUIT BREAKER] Circuit is OPEN. Executing safe fallback.");
        return fallback();
      }
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      return fallback();
    }
  }

  private recordFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
      console.error(`[CIRCUIT BREAKER] Threshold reached (${this.failures}). Circuit OPENED.`);
    }
  }

  private reset() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}