/**
 * @file lib/store/useSettingsStore.ts
 * Canonical re-export barrel.
 *
 * HISTORY: Two separate settings stores existed:
 *   - lib/store/useSettingsStore.ts  (API-backed, Prisma-synced)
 *   - lib/store/settings-store.ts   (localStorage persisted via Zustand)
 *
 * SOLUTION: components that import from THIS path get the Prisma-synced
 * store (useSettingsStore) so that `settings.hiddenAssets` etc. are available.
 * Components that need the persisted client-only store should import from
 * `@/lib/store/settings-store` directly.
 *
 * This barrel avoids a module duplication runtime conflict.
 */
export { useSettingsStore, type SystemSettings } from './useSettingsStore';
