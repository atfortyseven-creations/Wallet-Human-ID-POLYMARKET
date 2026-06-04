import { z } from 'zod';

// ============================================================================
// WhaleAlert ID.FI - USER SETTINGS VALIDATION SCHEMA
// ============================================================================

/**
 * Contact Interface
 */
export const ContactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  memo: z.string().max(500).optional(),
});

export type ContactType = z.infer<typeof ContactSchema>;

/**
 * Notifications Config Interface
 */
export const NotificationsConfigSchema = z.object({
  governance: z.boolean(),
  transactional: z.boolean(),
  security: z.boolean(),
});

export type NotificationsConfig = z.infer<typeof NotificationsConfigSchema>;

/**
 * [ABSOLUTE EXTENSION] Analytics & AI Configuration
 */
export const AnalyticsConfigSchema = z.object({
  tacticalThreshold: z.coerce.number().min(0).max(10000000000).default(500000000),
  signalSensitivity: z.coerce.number().min(0).max(1).default(0.8),
  agentAutonomy: z.boolean().default(false),
  alphaAlerts: z.boolean().default(true),
});

export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;

/**
 * [ABSOLUTE EXTENSION] Atomic Execution & Network Configuration
 */
export const ExecutionConfigSchema = z.object({
  gaslessMode: z.boolean().default(true),
  bundlerRef: z.string().default('pimlico-mainnet'),
  sessionKeys: z.boolean().default(false),
  priorityFee: z.enum(['low', 'standard', 'dynamic']).default('dynamic'),
});

export type ExecutionConfig = z.infer<typeof ExecutionConfigSchema>;

/**
 * [ABSOLUTE EXTENSION] Grid UI & Aesthetic Configuration
 */
export const UiConfigSchema = z.object({
  density: z.enum(['compact', 'standard', 'spacious']).default('standard'),
  animations: z.boolean().default(true),
  colorProfile: z.enum(['arctic', 'zenith', 'obsidian']).default('arctic'),
  glassIntensity: z.coerce.number().min(0).max(1).default(0.6),
});

export type UiConfig = z.infer<typeof UiConfigSchema>;


/**
 * Complete User Settings Schema
 * This validates ALL user settings fields for robust data integrity
 */
export const UserSettingsSchema = z.object({
  // Appearance & UI (Relaxed for safety)
  theme: z.enum(['light', 'dark', 'auto']).or(z.string()).default('auto'),
  language: z.enum(['en', 'es', 'fr', 'pt']).or(z.string()).default('en'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'MXN']).or(z.string()).default('USD'),
  searchEngine: z.enum(['Google', 'DuckDuckGo', 'Brave']).or(z.string()).default('Google'),
  tier: z.enum(['basic', 'pro']).default('pro'), // Default to pro for the perfection experience

  // Privacy & Security
  showProfile: z.boolean().default(true),
  showActivity: z.boolean().default(false),
  hideBalances: z.boolean().default(false),
  privacyMode: z.boolean().default(true),
  strictMode: z.boolean().default(false),
  humanMetrics: z.boolean().default(false),

  // Notifications
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  transactionAlerts: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),

  // Telegram Settings
  telegramEnabled: z.boolean().default(false),
  telegramChatId: z.string().nullable().optional(),
  telegramTopicId: z.string().nullable().optional(),
  telegramUsername: z.string().nullable().optional(),
  whaleThreshold: z.coerce.number().min(0).max(10000000000).default(500000000),

  // Trading
  defaultSlippage: z.coerce.number().min(0).max(100).default(0.5),
  defaultGasPrice: z.enum(['low', 'medium', 'high']).or(z.string()).default('medium'),
  confirmTransactions: z.boolean().default(true),

  // Smart Wallet Security
  walletStealthMode: z.boolean().default(false),
  requirePasswordForSigning: z.boolean().default(true),
  autoLockDuration: z.coerce.number().min(1).max(1440).default(15),

  // Advanced Settings
  testNetsEnabled: z.boolean().default(false),
  ipfsGateway: z.string().url().optional().or(z.literal('')).or(z.null()),
  customRPC: z.string().url().nullable().optional().or(z.literal('')),
  stateLogsEnabled: z.boolean().default(false),

  // Contacts
  contacts: z.array(ContactSchema).default([]),

  // Notifications granular
  notifications: NotificationsConfigSchema.optional().default({
    governance: true,
    transactional: true,
    security: true,
  }),

  // Backup
  lastBackupAt: z.coerce.date().nullable().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).or(z.string()).default('weekly'),

  // Absolute Extended Configs
  analyticsConfig: AnalyticsConfigSchema.default({
    tacticalThreshold: 500000000,
    signalSensitivity: 0.8,
    agentAutonomy: false,
    alphaAlerts: true,
  }),
  executionConfig: ExecutionConfigSchema.default({
    gaslessMode: true,
    bundlerRef: 'pimlico-mainnet',
    sessionKeys: false,
    priorityFee: 'dynamic',
  }),
  uiConfig: UiConfigSchema.default({
    density: 'standard',
    animations: true,
    colorProfile: 'arctic',
    glassIntensity: 0.6,
  }),
}).passthrough();

export type UserSettings = z.infer<typeof UserSettingsSchema>;

/**
 * Partial schema for updating individual fields
 */
export const PartialUserSettingsSchema = UserSettingsSchema.partial();

export type PartialUserSettings = z.infer<typeof PartialUserSettingsSchema>;

/**
 * Field-level update schema
 */
export const FieldUpdateSchema = z.object({
  field: z.string(),
  value: z.any(),
});

/**
 * Validate user settings object
 */
export function validateUserSettings(data: unknown): {
  success: boolean;
  data?: UserSettings;
  errors?: z.ZodError;
} {
  try {
    const validated = UserSettingsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Validate partial settings (for PATCH operations)
 */
export function validatePartialSettings(data: unknown): {
  success: boolean;
  data?: Partial<UserSettings>;
  errors?: z.ZodError;
} {
  try {
    const validated = PartialUserSettingsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Get default user settings
 */
export function getDefaultUserSettings(): UserSettings {
  return {
    // Appearance & UI
    theme: 'light',
    language: 'es',
    currency: 'USD',
    searchEngine: 'Google',
    tier: 'pro',

    // Privacy & Security
    showProfile: true,
    showActivity: false,
    hideBalances: false,
    privacyMode: true,
    strictMode: false,
    humanMetrics: false,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    marketingEmails: false,

    // Telegram Settings
    telegramEnabled: false,
    telegramChatId: null,
    telegramTopicId: null,
    telegramUsername: null,
    whaleThreshold: 50000,

    // Trading
    defaultSlippage: 0.5,
    defaultGasPrice: 'medium',
    confirmTransactions: true,

    // Smart Wallet Security
    walletStealthMode: false,
    requirePasswordForSigning: true,
    autoLockDuration: 15,

    // Advanced Settings
    testNetsEnabled: false,
    ipfsGateway: 'https://ipfs.io/ipfs/',
    customRPC: null,
    stateLogsEnabled: false,

    // Contacts
    contacts: [],

    // Notifications granular
    notifications: {
      governance: true,
      transactional: true,
      security: true,
    },

    // Backup
    lastBackupAt: null,
    backupFrequency: 'weekly',

    // Absolute Extended Configs
    analyticsConfig: {
      tacticalThreshold: 500000000,
      signalSensitivity: 0.8,
      agentAutonomy: false,
      alphaAlerts: true,
    },
    executionConfig: {
      gaslessMode: true,
      bundlerRef: 'pimlico-mainnet',
      sessionKeys: false,
      priorityFee: 'dynamic',
    },
    uiConfig: {
      density: 'standard',
      animations: true,
      colorProfile: 'arctic',
      glassIntensity: 0.6,
    },
  };
}

