import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/security/safe-storage';

export interface SystemSettings {
    // 1. General Settings
    theme: 'light' | 'dark' | 'system';
    density: 'relaxed' | 'compact' | 'dense';
    language: 'en' | 'es-ES';
    currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';
    timeFormat: '12h' | '24h';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
    addressFormat: 'truncated' | 'full';
    
    // 2. Display & Hardware
    defaultTimeframe: '1D' | '1W' | '1M' | 'ALL';
    displayUnit: 'FIAT' | 'BTC' | 'ETH';
    showBalances: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
    hardwareAcceleration: boolean;
    
    // 3. Network & RPC
    gasPreset: 'ECONOMY' | 'STANDARD' | 'FAST' | 'INSTANT';
    maxSlippage: number;
    customRpcUrl: string;
    mevProtection: boolean;
    testnetMode: boolean;

    // 4. Sonar Alerts
    emailAlerts: boolean;
    telegramAlerts: boolean;
    audioAlerts: boolean;
    whaleAlertThreshold: number;
    email: string;

    // 5. Privacy & Security
    inactivityLockMinutes: number;
    autoDisconnectTimer: '15m' | '1h' | '24h' | 'never';
    stealthMode: boolean;
    requireSignForExports: boolean;
    allowAnalytics: boolean;

    // 6. Execution Rules & Whale Chat
    chatName: string;
    chatBio: string;
    qrLabel: string;
    hiddenAssets?: string; // JSON array of symbols/addresses
}

export interface SettingsState extends SystemSettings {
    settings: SystemSettings | null; // Legacy compat
    isSettingsOpen: boolean;
    isLoading: boolean;
    isUpdating: boolean;
    
    // API Sync Methods
    fetchSettings: () => Promise<void>;
    syncDOM: () => void;
    updateSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => Promise<void>;

    // Individual setters for backwards compatibility
    setTheme: (theme: SettingsState['theme']) => void;
    setTimeFormat: (format: SettingsState['timeFormat']) => void;
    setDateFormat: (format: SettingsState['dateFormat']) => void;
    setAddressFormat: (format: SettingsState['addressFormat']) => void;
    setEmail: (email: string) => void;
    setChatName: (name: string) => void;
    setChatBio: (bio: string) => void;
    
    setCurrency: (currency: SettingsState['currency']) => void;
    setLayoutDensity: (density: SettingsState['density']) => void;
    setTestnetMode: (mode: boolean) => void;
    setAudioAlerts: (audio: boolean) => void;
    setStealthMode: (stealth: boolean) => void;
    setShowBalances: (show: boolean) => void;
    setAllowAnalytics: (allow: boolean) => void;
    setAutoDisconnectTimer: (timer: SettingsState['autoDisconnectTimer']) => void;
    setHardwareAcceleration: (val: boolean) => void;
    setHapticFeedback: (val: boolean) => void;
    setHiddenAssets: (val: string) => void;
    setSettingsOpen: (open: boolean) => void;
    clearAppData: () => void;
}

const applyDOMClasses = (state: Partial<SystemSettings>) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;

    //  Theme Enforcement 
    if (state.theme) {
        const resolvedDark =
            state.theme === 'dark' ||
            (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (resolvedDark) {
            html.classList.add('dark');
            html.setAttribute('data-theme', 'dark');
            // Immediate background flush  prevents flash-of-wrong-color
            html.style.backgroundColor = '#0A0A0A';
            html.style.color = '#F5F5F5';
        } else {
            html.classList.remove('dark');
            html.setAttribute('data-theme', 'light');
            html.style.backgroundColor = '#FFFFFF';
            html.style.color = '#1C1917';
        }
    }

    //  UI Density 
    if (state.density) {
        const d = state.density;
        html.classList.remove('ui-relaxed', 'ui-compact', 'ui-dense');
        if (d === 'compact') html.classList.add('ui-compact');
        else if (d === 'dense') html.classList.add('ui-dense');
        else html.classList.add('ui-relaxed');
    }

    //  Stealth Mode: blur all [data-balance] elements 
    if (state.stealthMode !== undefined) {
        if (state.stealthMode) html.classList.add('stealth-active');
        else html.classList.remove('stealth-active');
    }

    //  Show Balances: hide-balances class when showBalances is false 
    if (state.showBalances !== undefined) {
        if (!state.showBalances) html.classList.add('hide-balances');
        else html.classList.remove('hide-balances');
    }

    //  Hardware Acceleration: disable GPU compositing hints when off 
    if (state.hardwareAcceleration !== undefined) {
        if (!state.hardwareAcceleration) html.classList.add('no-hw-accel');
        else html.classList.remove('no-hw-accel');
    }
};


export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Default Values
            theme: 'dark',
            density: 'compact',
            language: 'en',
            currency: 'USD',
            timeFormat: '24h',
            dateFormat: 'DD/MM/YYYY',
            addressFormat: 'truncated',
            
            defaultTimeframe: '1D',
            displayUnit: 'FIAT',
            showBalances: true,
            soundEffects: true,
            hapticFeedback: true,
            hardwareAcceleration: true,

            gasPreset: 'STANDARD',
            maxSlippage: 0.5,
            customRpcUrl: '',
            mevProtection: false,
            testnetMode: false,

            emailAlerts: false,
            telegramAlerts: false,
            audioAlerts: true,
            whaleAlertThreshold: 1000000,
            email: '',

            inactivityLockMinutes: 15,
            autoDisconnectTimer: '1h',
            stealthMode: false,
            requireSignForExports: false,
            allowAnalytics: false,

            chatName: 'Whale User',
            chatBio: '',
            qrLabel: 'Scan My Wallet',
            hiddenAssets: '[]',

            settings: null,
            isSettingsOpen: false,
            isLoading: false,
            isUpdating: false,

            syncDOM: () => {
                applyDOMClasses(get());
            },

            fetchSettings: async () => {
                // Apply locally persisted classes immediately on boot
                get().syncDOM();
                
                try {
                    set({ isLoading: true });
                    const res = await fetch('/api/user/settings');
                    if (res.ok) {
                        const data = await res.json();
                        set({ ...data, settings: data });
                        applyDOMClasses(data);
                    }
                } catch (e) {
                    console.error('Failed to fetch system settings', e);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateSetting: async (key, value) => {
                // Optimistic Local Update
                set({ [key]: value, isUpdating: true } as any);
                applyDOMClasses({ [key]: value });

                try {
                    // Push to API
                    await fetch('/api/user/settings', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [key]: value })
                    });
                } catch (e) {
                    console.error('Failed to sync setting to DB', e);
                } finally {
                    set({ isUpdating: false });
                }
            },

            setTheme: (val) => get().updateSetting('theme', val),
            setTimeFormat: (val) => get().updateSetting('timeFormat', val),
            setDateFormat: (val) => get().updateSetting('dateFormat', val),
            setAddressFormat: (val) => get().updateSetting('addressFormat', val),
            setEmail: (val) => get().updateSetting('email', val),
            setChatName: (val) => get().updateSetting('chatName', val),
            setChatBio: (val) => get().updateSetting('chatBio', val),
            
            setCurrency: (val) => get().updateSetting('currency', val),
            setLayoutDensity: (val) => get().updateSetting('density', val),
            setTestnetMode: (val) => get().updateSetting('testnetMode', val),
            setAudioAlerts: (val) => get().updateSetting('audioAlerts', val),
            setStealthMode: (val) => get().updateSetting('stealthMode', val),
            setShowBalances: (val) => get().updateSetting('showBalances', val),
            setAllowAnalytics: (val) => get().updateSetting('allowAnalytics', val),
            setAutoDisconnectTimer: (val) => get().updateSetting('autoDisconnectTimer', val),
            setHardwareAcceleration: (val) => get().updateSetting('hardwareAcceleration', val),
            setHapticFeedback: (val) => get().updateSetting('hapticFeedback', val),
            setHiddenAssets: (val) => get().updateSetting('hiddenAssets', val),

            setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
            clearAppData: () => {
                if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                }
            }
        }),
        {
            name: 'system-settings-store-v4',
            storage: createJSONStorage(() => safeStorage),
            partialize: (state) => ({
                theme: state.theme,
                density: state.density,
                language: state.language,
                currency: state.currency,
                timeFormat: state.timeFormat,
                dateFormat: state.dateFormat,
                addressFormat: state.addressFormat,
                
                defaultTimeframe: state.defaultTimeframe,
                displayUnit: state.displayUnit,
                showBalances: state.showBalances,
                soundEffects: state.soundEffects,
                hapticFeedback: state.hapticFeedback,
                hardwareAcceleration: state.hardwareAcceleration,

                gasPreset: state.gasPreset,
                maxSlippage: state.maxSlippage,
                customRpcUrl: state.customRpcUrl,
                mevProtection: state.mevProtection,
                testnetMode: state.testnetMode,

                emailAlerts: state.emailAlerts,
                telegramAlerts: state.telegramAlerts,
                audioAlerts: state.audioAlerts,
                whaleAlertThreshold: state.whaleAlertThreshold,
                email: state.email,

                inactivityLockMinutes: state.inactivityLockMinutes,
                autoDisconnectTimer: state.autoDisconnectTimer,
                stealthMode: state.stealthMode,
                requireSignForExports: state.requireSignForExports,
                allowAnalytics: state.allowAnalytics,

                chatName: state.chatName,
                chatBio: state.chatBio,
                qrLabel: state.qrLabel,
                hiddenAssets: state.hiddenAssets
            })
        }
    )
);
