/**
 * ClientGuardian.ts
 * Real-Time Safety Monitor for Leverage Positions
 * 
 * Features:
 * - Monitors price every 5 seconds
 * - Detects stop-loss violations
 * - Audio + Visual alerts
 * - Optional auto-close
 */

import { synthetixService } from '@/lib/blockchain/SynthetixService';

import { safeToFixed, safeToLocaleString } from '@/lib/utils/number-format';
export interface GuardianAlert {
  type: 'STOP_LOSS' | 'LIQUIDATION_WARNING' | 'PROFIT_TARGET';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  position: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    currentPrice: number;
    stopLoss: number;
    liquidationPrice: number;
  };
  timestamp: number;
}

export interface GuardianConfig {
  enabled: boolean;
  autoCloseOnStopLoss: boolean;
  soundAlerts: boolean;
  visualAlerts: boolean;
  checkInterval: number; // milliseconds
}

export class ClientGuardian {
  private positions: Map<number, any> = new Map();
  private config: GuardianConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private alertCallback: ((alert: GuardianAlert) => void) | null = null;
  private audioContext: AudioContext | null = null;

  constructor(config: Partial<GuardianConfig> = {}) {
    this.config = {
      enabled: true,
      autoCloseOnStopLoss: false, // Conservative default
      soundAlerts: true,
      visualAlerts: true,
      checkInterval: 5000, // 5 seconds
      ...config
    };

    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Start monitoring positions
   */
  public start(positions: any[], onAlert: (alert: GuardianAlert) => void) {
    if (this.intervalId) {
      this.stop();
    }

    this.alertCallback = onAlert;
    this.updatePositions(positions);

    this.intervalId = setInterval(() => {
      this.checkPositions();
    }, this.config.checkInterval);

    console.log('[Guardian] ️ Started monitoring', positions.length, 'positions');
  }

  /**
   * Stop monitoring
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.positions.clear();
    console.log('[Guardian]  Stopped monitoring');
  }

  /**
   * Update positions being monitored
   */
  public updatePositions(positions: any[]) {
    this.positions.clear();
    positions.forEach(pos => {
      this.positions.set(pos.marketId, pos);
    });
  }

  /**
   * Check all positions for violations
   */
  private async checkPositions() {
    if (!this.config.enabled) return;

    for (const [marketId, position] of this.positions) {
      // TODO: Fetch real current price from oracle/API
      const currentPrice = await this.getCurrentPrice(position.symbol);
      
      // Update position's current price
      position.currentPrice = currentPrice;

      // Check stop-loss violation
      const stopLossViolated = this.checkStopLoss(position, currentPrice);
      if (stopLossViolated) {
        this.triggerAlert({
          type: 'STOP_LOSS',
          severity: 'CRITICAL',
          message: ` STOP LOSS HIT: ${position.symbol} at $${safeToFixed(currentPrice, 2)}`,
          position: {
            symbol: position.symbol,
            side: position.side,
            currentPrice,
            stopLoss: position.stopLoss,
            liquidationPrice: position.liquidationPrice
          },
          timestamp: Date.now()
        });
      }

      // Check liquidation warning (within 10% of liq price)
      const liquidationWarning = this.checkLiquidationWarning(position, currentPrice);
      if (liquidationWarning) {
        this.triggerAlert({
          type: 'LIQUIDATION_WARNING',
          severity: 'WARNING',
          message: `️ NEAR LIQUIDATION: ${position.symbol} at $${safeToFixed(currentPrice, 2)}`,
          position: {
            symbol: position.symbol,
            side: position.side,
            currentPrice,
            stopLoss: position.stopLoss,
            liquidationPrice: position.liquidationPrice
          },
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Check if stop-loss is violated
   */
  private checkStopLoss(position: any, currentPrice: number): boolean {
    if (!position.stopLoss) return false;

    if (position.side === 'LONG') {
      return currentPrice <= position.stopLoss;
    } else {
      return currentPrice >= position.stopLoss;
    }
  }

  /**
   * Check if near liquidation (within 10%)
   */
  private checkLiquidationWarning(position: any, currentPrice: number): boolean {
    const liqPrice = position.liquidationPrice;
    const threshold = Math.abs(liqPrice - position.entryPrice) * 0.1;

    if (position.side === 'LONG') {
      return currentPrice <= (liqPrice + threshold);
    } else {
      return currentPrice >= (liqPrice - threshold);
    }
  }

  /**
   * Trigger an alert (audio + visual + callback)
   */
  private triggerAlert(alert: GuardianAlert) {
    console.log('[Guardian]', alert.message);

    // Audio alert
    if (this.config.soundAlerts) {
      this.playAlertSound(alert.severity);
    }

    // Callback (for visual alerts)
    if (this.alertCallback) {
      this.alertCallback(alert);
    }

    // Auto-close if enabled
    if (this.config.autoCloseOnStopLoss && alert.type === 'STOP_LOSS') {
      console.log('[Guardian]  AUTO-CLOSE triggered for', alert.position.symbol);
      if (this.closePositionCallback) {
        this.closePositionCallback(alert.position);
      } else {
        console.warn('[Guardian] ️ Auto-close enabled but no closePositionCallback registered!');
      }
    }
  }

  private closePositionCallback: ((position: any) => Promise<void>) | null = null;

  /**
   * Register a callback to handle position closing (from UI/Wallet)
   */
  public onAutoClose(callback: (position: any) => Promise<void>) {
    this.closePositionCallback = callback;
  }

  /**
   * Play audio alert based on severity
   */
  private playAlertSound(severity: 'INFO' | 'WARNING' | 'CRITICAL') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Different frequencies for different severities
    const frequency = severity === 'CRITICAL' ? 800 : severity === 'WARNING' ? 600 : 400;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  /**
   * Get current price for a symbol using the Legendary PriceService
   */
  private async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Import dynamically or ensure it's available
      const { PriceService } = await import('@/lib/blockchain/PriceService');
      
      const prices = await PriceService.getBulkPrices([{
        symbol: symbol.toUpperCase(),
        address: 'native',
        chainId: 8453 // Focused on Base for Synthetix V3
      }]);
      
      const data = prices[symbol.toUpperCase()];
      return data?.price || 0;
    } catch (e) {
      console.warn(`[Guardian] ️ Failed to fetch live price for ${symbol}:`, e);
      return 0;
    }
  }


  /**
   * Update configuration
   */
  public updateConfig(config: Partial<GuardianConfig>) {
    this.config = { ...this.config, ...config };
    console.log('[Guardian] ️ Config updated:', this.config);
  }
}

// Singleton instance
let guardianInstance: ClientGuardian | null = null;

export function getGuardian(): ClientGuardian {
  if (!guardianInstance) {
    guardianInstance = new ClientGuardian();
  }
  return guardianInstance;
}

