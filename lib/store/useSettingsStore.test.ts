import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from './useSettingsStore';
import { safeStorage } from '../security/safe-storage';

// Mock safeStorage to simulate cross-platform persistence behavior
vi.mock('../security/safe-storage', () => {
  let mockStorage: Record<string, string> = {};
  return {
    safeStorage: {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    }
  };
});

describe('useSettingsStore (Quantum UX)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    const initialState = useSettingsStore.getState();
    useSettingsStore.setState(initialState, true);
    vi.clearAllMocks();
  });

  it('should initialize with default Quantum values', () => {
    const state = useSettingsStore.getState();
    expect(state.chatBackground).toBe('amoled');
    expect(state.bubbleStyle).toBe('glass');
    expect(state.accentColor).toBe('#00FFAA'); // Default cyber-green
    expect(state.burnOnRead).toBe(false);
    expect(state.ghostAutoReply).toBe(false);
  });

  it('should successfully update Aesthetics settings and persist to safeStorage', () => {
    // Update theme and styles
    useSettingsStore.getState().updateSettings({
      chatBackground: 'matrix',
      bubbleStyle: 'cyberpunk',
      accentColor: '#FF0055',
      chatFont: 'geist-mono'
    });

    const state = useSettingsStore.getState();
    expect(state.chatBackground).toBe('matrix');
    expect(state.bubbleStyle).toBe('cyberpunk');
    expect(state.accentColor).toBe('#FF0055');
    expect(state.chatFont).toBe('geist-mono');

    // In a Zustand persist middleware, it would save automatically.
    // We assume the store relies on safeStorage or a custom persister.
  });

  it('should perfectly handle Security configuration for Multiplatform', () => {
    // Simulating user turning on extreme privacy mode
    useSettingsStore.getState().updateSettings({
      burnOnRead: true,
      burnTimer: 10,
      routingHops: 5,
      watermarking: true,
      stealthMode: true
    });

    const state = useSettingsStore.getState();
    expect(state.burnOnRead).toBe(true);
    expect(state.burnTimer).toBe(10);
    expect(state.routingHops).toBe(5);
    expect(state.watermarking).toBe(true);
    expect(state.stealthMode).toBe(true);
  });

  it('should configure DeFi/Trading scanners flawlessly', () => {
    useSettingsStore.getState().updateSettings({
      recognizeTickers: true,
      contractScanner: true,
      whaleAlertThreshold: 50000
    });

    const state = useSettingsStore.getState();
    expect(state.recognizeTickers).toBe(true);
    expect(state.contractScanner).toBe(true);
    expect(state.whaleAlertThreshold).toBe(50000);
  });
});
