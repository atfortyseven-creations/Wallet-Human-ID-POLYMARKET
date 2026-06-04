import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogType = 'info' | 'success' | 'warning' | 'error';

export interface ActivityLog {
    id: string;
    time: string;
    msg: string;
    type: LogType;
}

interface DashboardState {
    logs: ActivityLog[];
    addLog: (msg: string, type?: LogType) => void;
    clearLogs: () => void;
}

export const useDashboardStore = create<DashboardState>()(
    (set) => ({
        logs: [],
        addLog: (msg, type = 'info') => set((state) => {
            const now = new Date();
            const newLog: ActivityLog = {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + (typeof performance !== 'undefined' ? performance.now().toString(36).replace('.', '') : '0'),
                time: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' }),
                msg,
                type,
            };
            // Keep only last 100 logs
            return { logs: [newLog, ...state.logs].slice(0, 100) };
        }),
        clearLogs: () => set({ logs: [] }),
    })
);
