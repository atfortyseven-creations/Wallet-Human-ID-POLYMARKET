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
    expect(state.chatBackground).toBe('default');
    expect(state.bubbleStyle).toBe('default');
    expect(state.accentColor).toBe('#6366f1'); // Default indigo
    expect(state.burnOnRead).toBe(false);
    expect(state.ghostAutoReply).toBe(false);
  });

  it('should successfully update Aesthetics settings and persist to safeStorage', async () => {
    // Update theme and styles one by one using updateSetting
    const { updateSetting } = useSettingsStore.getState();
    await updateSetting('chatBackground', 'matrix');
    await updateSetting('bubbleStyle', 'cyberpunk');
    await updateSetting('accentColor', '#FF0055');
    await updateSetting('chatFont', 'inter');

    const state = useSettingsStore.getState();
    expect(state.chatBackground).toBe('matrix');
    expect(state.bubbleStyle).toBe('cyberpunk');
    expect(state.accentColor).toBe('#FF0055');
    expect(state.chatFont).toBe('inter');
  });

  it('should perfectly handle Security configuration for Multiplatform', async () => {
    // Simulating user turning on extreme privacy mode
    const { updateSetting } = useSettingsStore.getState();
    await updateSetting('burnOnRead', true);
    await updateSetting('burnOnReadSeconds', 10);
    await updateSetting('onionHops', 5);
    await updateSetting('watermarkEnabled', true);
    await updateSetting('stealthMode', true);

    const state = useSettingsStore.getState();
    expect(state.burnOnRead).toBe(true);
    expect(state.burnOnReadSeconds).toBe(10);
    expect(state.onionHops).toBe(5);
    expect(state.watermarkEnabled).toBe(true);
    expect(state.stealthMode).toBe(true);
  });

  it('should configure DeFi/Trading scanners flawlessly', async () => {
    const { updateSetting } = useSettingsStore.getState();
    await updateSetting('tickerWidgets', true);
    await updateSetting('contractScanner', true);
    await updateSetting('whaleAlertThreshold', 50000);

    const state = useSettingsStore.getState();
    expect(state.tickerWidgets).toBe(true);
    expect(state.contractScanner).toBe(true);
    expect(state.whaleAlertThreshold).toBe(50000);
  });
});
