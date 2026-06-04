import { NextRequest } from 'next/server';

/**
 * Server-Sent Events (SSE) for Portfolio Updates
 * Enables real-time serverclient push notifications
 */

// In-memory event emitter for portfolio events
class PortfolioEventEmitter {
  private clients: Map<string, ReadableStreamDefaultController> = new Map();

  addClient(walletAddress: string, controller: ReadableStreamDefaultController) {
    this.clients.set(walletAddress, controller);
    console.log(`[SSE] Client connected: ${walletAddress}`);
  }

  removeClient(walletAddress: string) {
    this.clients.delete(walletAddress);
    console.log(`[SSE] Client disconnected: ${walletAddress}`);
  }

  emit(walletAddress: string, event: any) {
    const controller = this.clients.get(walletAddress);
    if (controller) {
      try {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        console.log(`[SSE] Event sent to ${walletAddress}:`, event.type);
      } catch (error) {
        console.error('[SSE] Failed to send event:', error);
        this.removeClient(walletAddress);
      }
    }
  }

  broadcast(event: any) {
    this.clients.forEach((controller, address) => {
      this.emit(address, event);
    });
  }
}

// Global emitter instance
const portfolioEmitter = new PortfolioEventEmitter();

// Expose to global scope for webhook integration
if (typeof global !== 'undefined') {
  (global as any).sseEmitter = portfolioEmitter;
}

/**
 * GET /api/sse/portfolio?address=0x...
 * Opens an SSE connection for real-time portfolio updates
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('address');

  if (!walletAddress) {
    return new Response('Missing wallet address', { status: 400 });
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(new TextEncoder().encode(': connected\n\n'));

      // Register this client
      portfolioEmitter.addClient(walletAddress, controller);

      // Send keep-alive ping every 30 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch (error) {
          clearInterval(interval);
          portfolioEmitter.removeClient(walletAddress);
        }
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        portfolioEmitter.removeClient(walletAddress);
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}

/**
 * Helper function to send events to SSE clients
 * Can be called from anywhere in the backend
 */
function emitPortfolioEvent(walletAddress: string, event: any) {
  portfolioEmitter.emit(walletAddress, event);
}

function broadcastPortfolioEvent(event: any) {
  portfolioEmitter.broadcast(event);
}

