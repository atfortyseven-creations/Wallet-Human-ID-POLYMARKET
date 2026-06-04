/**
 * Custom Error Classes for better error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ExternalAPIError extends Error {
  constructor(
    message: string,
    public service: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExternalAPIError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Retry logic for external API calls
 */
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    shouldRetry = (error) => {
      // Retry on network errors and 5xx status codes
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') return true;
      if (error.statusCode >= 500 && error.statusCode < 600) return true;
      if (error.name === 'ExternalAPIError') return true;
      return false;
    },
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${waitTime}ms...`,
        (error as any).message
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Circuit breaker pattern for failing services
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if we should move to HALF_OPEN
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('[CircuitBreaker] Moving to HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();

      // Success - reset the circuit
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        console.log('[CircuitBreaker] Moving to CLOSED state');
      }
      this.failures = 0;

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        console.error(`[CircuitBreaker] OPEN - ${this.failures} failures detected`);
      }

      throw error;
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    console.log('[CircuitBreaker] Manual reset to CLOSED state');
  }
}

// Global circuit breakers for external services
export const circuitBreakers = {
  // Alchemy breakers split per chain to avoid cross-chain downtime
  alchemy: {
    mainnet: new CircuitBreaker(5, 60000),
    polygon: new CircuitBreaker(5, 60000),
    base: new CircuitBreaker(5, 60000),
    arbitrum: new CircuitBreaker(5, 60000),
    optimism: new CircuitBreaker(5, 60000),
    general: new CircuitBreaker(5, 60000),
  },
  bybit: new CircuitBreaker(5, 30000),
  coingecko: new CircuitBreaker(5, 60000),
};

/**
 * Error response formatter for API routes
 */
export function formatErrorResponse(error: any) {
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: error.message,
      fields: error.fields,
      statusCode: 400,
    };
  }

  if (error instanceof RateLimitError) {
    return {
      error: error.message,
      retryAfter: error.retryAfter,
      statusCode: 429,
    };
  }

  if (error instanceof ExternalAPIError) {
    return {
      error: `External service error: ${error.service}`,
      message: error.message,
      statusCode: error.statusCode || 502,
    };
  }

  // Generic error
  return {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    statusCode: 500,
  };
}
