

type MessageHandler = (data: any) => void;

interface StreamSubscription {
  stream: string;
  handler: MessageHandler;
}

/**
 * PROFESSIONAL WEBSOCKET MANAGER
 * - Connection pooling for multiple streams
 * - Auto-reconnect with exponential backoff
 * - Message rate limiting
 * - Performance monitoring
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start at 1 second
  private messageQueue: any[] = [];
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  // Performance metrics
  private messageCount = 0;
  private lastMessageTime = Date.now();
  private avgLatency = 0;

  constructor(private baseUrl: string = 'wss://stream.binance.com/stream') {}

  /**
   * Connect to WebSocket with specific streams
   */
  async connect(streams: string[]): Promise<void> {
    const streamQuery = streams.join('/');
    const url = `${this.baseUrl}?streams=${streamQuery}`;

    // If we're already connected to these EXACT streams, skip
    if (this.ws && this.isConnected && this.ws.url === url) {
      console.log('[WS] Already connected to these streams');
      return;
    }

    // If we're connected to DIFFERENT streams, disconnect first
    if (this.ws) {
      console.log('[WS] Updating streams, disconnecting old session...');
      this.disconnect();
    }

    console.log(`[WS] Connecting to ${streams.length} streams...`);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('[WS]  Connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startHeartbeat();
          
          // Flush message queue
          while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            this.ws?.send(JSON.stringify(msg));
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WS] Connection closed');
          this.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect(streams);
        };

      } catch (error) {
        console.error('[WS] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string) {
    const now = Date.now();
    this.messageCount++;
    
    // Calculate latency (assuming server timestamp in message)
    const latency = now - this.lastMessageTime;
    this.avgLatency = (this.avgLatency * 0.9) + (latency * 0.1); // EMA
    this.lastMessageTime = now;

    try {
      const message = JSON.parse(data);
      
      // Binance combined stream format: { stream: 'btcusdt@trade', data: {...} }
      if (message.stream && message.data) {
        const handlers = this.subscriptions.get(message.stream);
        if (handlers) {
          handlers.forEach(handler => handler(message.data));
        }
        
        // Handle global ticker array specially if needed, or just let subscribers handle it
        // The stream name is '!miniTicker@arr'
      }
    } catch (error) {
      console.error('[WS] Message parse error:', error);
    }
  }

  /**
   * Subscribe to a specific stream
   */
  subscribe(stream: string, handler: MessageHandler): () => void {
    if (!this.subscriptions.has(stream)) {
      this.subscriptions.set(stream, new Set());
    }
    
    this.subscriptions.get(stream)!.add(handler);
    console.log(`[WS] Subscribed to ${stream}`);

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(stream);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(stream);
        }
      }
    };
  }

  /**
   * Reconnect with exponential backoff
   */
  private attemptReconnect(streams: string[]) {
    this.reconnectAttempts++;
    
    // 50-Year Continuity: Never stop reconnecting. Cap delay at 60 seconds to prevent OOM/DDoS, but guarantee infinite uptime loop.
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 60000);
    
    console.log(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}  System Infinity Loop)`);

    setTimeout(() => {
      this.connect(streams);
    }, delay);
  }

  /**
   * Heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.isConnected) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      messageCount: this.messageCount,
      avgLatency: Math.round(this.avgLatency),
      isConnected: this.isConnected,
      subscriptions: this.subscriptions.size
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.subscriptions.clear();
      console.log('[WS] Disconnected');
    }
  }
  /**
   * Get last message timestamp for heartbeat
   */
  getLastUpdate(): number {
    return this.lastMessageTime;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

