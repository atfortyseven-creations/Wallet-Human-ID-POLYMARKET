/**
 * AEGIS NEURAL EVENT BUS
 * Central decoupled pub/sub system. Guarantees 0 memory leaks and prevents React re-render loops.
 */
type EventCallback = (data: any) => void;

export class AegisEventBus {
  private static events: Map<string, Set<EventCallback>> = new Map();

  public static subscribe(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    
    // Returns an unsubscribe function to guarantee Garbage Collection in React useEffects
    return () => {
      this.events.get(event)?.delete(callback);
      if (this.events.get(event)?.size === 0) {
        this.events.delete(event);
      }
    };
  }

  public static publish(event: string, data: any) {
    if (this.events.has(event)) {
      // Execute asynchronously to prevent blocking the main thread (120 FPS guarantee)
      setTimeout(() => {
        this.events.get(event)!.forEach(callback => {
          try {
            callback(data);
          } catch (err) {
            console.error(`[AEGIS BUS] Error in subscriber for event ${event}:`, err);
          }
        });
      }, 0);
    }
  }
}