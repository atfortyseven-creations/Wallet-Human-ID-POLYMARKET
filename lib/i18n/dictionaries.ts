export type Locale = 'en' | 'es';

export const dictionaries = {
  en: {
    nav: {
      wallet: 'Wallet',
      portfolio: 'Portfolio',
      earn: 'Earn',
      activity: 'Activity',
      whales: 'Whales',
      cards: 'Cards',
      nfc: 'NFC',
      referrals: 'Referrals',
      settings: 'Settings'
    },
    common: {
      loading: 'Loading...',
      copy: 'Copy',
      copied: 'Copied',
      error: 'Error',
      success: 'Success',
      back: 'Back',
      continue: 'Continue',
      cancel: 'Cancel',
      confirm: 'Confirm'
    },
    cards: {
      title: 'The Human Card',
      subtitle: 'Spend your crypto instantly, anywhere.',
      designBtn: 'Design Your Card',
      features: {
        global: 'Global acceptance via Visa network',
        applePay: 'Instant Apple Pay & Google Pay',
        security: 'Bank-grade security with freeze toggle'
      }
    },
    nfc: {
        title: 'Tap to Pair',
        subtitle: 'Turn your Human Card into a hardware key.',
        start: 'Start Pairing',
        scanning: 'Scanning...',
        instruction: 'Hold your Human Card against the back of your device.',
        success: 'Paired'
    },
    vault: {
        title: 'Institutional Grade Security',
        status: 'Vault Secured',
        description: 'Your assets are protected by rigorous spending limits and time locks.',
        activeProtection: 'Protection Level',
        dailyLimit: 'Daily Limit',
        advancedSettings: 'Advanced Controls',
        timeLock: '24h Time Lock',
        biometric: 'Biometric Enforcer'
    }
  },
  es: {
    nav: {
      wallet: 'Billetera',
      portfolio: 'Portafolio',
      earn: 'Ganar',
      activity: 'Actividad',
      whales: 'Ballenas',
      cards: 'Tarjetas',
      vault: 'Bóveda',
      nfc: 'NFC',
      referrals: 'Referidos',
      settings: 'Ajustes'
    },
    common: {
      loading: 'Cargando...',
      copy: 'Copiar',
      copied: 'Copiado',
      error: 'Error',
      success: 'Éxito',
      back: 'Atrás',
      continue: 'Continuar',
      cancel: 'Cancelar',
      confirm: 'Confirmar'
    },
    cards: {
      title: 'La Tarjeta Human',
      subtitle: 'Gasta tus cripto al instante, donde sea.',
      designBtn: 'Diseña tu Tarjeta',
      features: {
        global: 'Aceptación global vía red Visa',
        applePay: 'Apple Pay y Google Pay instantáneo',
        security: 'Seguridad bancaria con bloqueo'
      }
    },
    nfc: {
        title: 'Toca para Vincular',
        subtitle: 'Convierte tu Tarjeta Human en llave física.',
        start: 'Iniciar Vinculación',
        scanning: 'Escaneando...',
        instruction: 'Mantén tu Tarjeta Human contra el reverso de tu dispositivo.',
        success: 'Vinculado'
    },
    vault: {
        title: 'Seguridad Institucional',
        status: 'Bóveda Asegurada',
        description: 'Tus activos están protegidos por límites de gasto rigurosos y bloqueos de tiempo.',
        activeProtection: 'Nivel de Protección',
        dailyLimit: 'Límite Diario',
        advancedSettings: 'Controles Avanzados',
        timeLock: 'Bloqueo 24h',
        biometric: 'Biometría Forzada'
    }
  }
} as const;
