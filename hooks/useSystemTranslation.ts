import { useSettingsStore } from '@/lib/store/useSettingsStore';

const dictionaries = {
    en: {
        // General
        'GENERAL_SETTINGS': 'GENERAL SETTINGS',
        'APPEARANCE': 'APPEARANCE',
        'PRIVACY_SECURITY': 'PRIVACY & SECURITY',
        'SETTINGS': 'SETTINGS',
        'PREFERENCES': 'PREFERENCES',
        'MANAGE_CONFIG': 'MANAGE YOUR TERMINAL CONFIGURATION AND PERSONAL PREFERENCES.',
        'TOTAL_DISCONNECT': 'TOTAL DISCONNECT',
        'ALL_SESSIONS_TERMINATED': 'ALL SESSIONS TERMINATED.',

        // Settings Toggles
        'LANGUAGE': 'Language',
        'INTERFACE_LANGUAGE': 'Interface display language.',
        'BASE_CURRENCY': 'Base Currency',
        'DEFAULT_CURRENCY': 'Default currency for balances.',
        'TIME_FORMAT': 'Time Format',
        'TIME_LAYOUT': 'Time display layout.',
        'DATE_FORMAT': 'Date Format',
        'DATE_ORDERING': 'Day, month, and year ordering.',
        'ADDRESS_FORMAT': 'Address Format',
        'CRYPTO_RENDER': 'How cryptographic addresses are rendered.',
        'DENSITY': 'Density',
        'SPACING_DENSITY': 'Spacing density of the interface.',
        'SHOW_BALANCES': 'Show Balances',
        'DISPLAY_PORTFOLIO': 'Display portfolio balances on-screen.',
        'HW_ACCELERATION': 'Hardware Acceleration',
        'ENABLE_GPU': 'Enables high-performance GPU-accelerated rendering.',
        'INACTIVITY_TIMEOUT': 'Inactivity Timeout',
        'MINUTES_LOCK': 'Minutes of inactivity before auto-locking.',
        'STEALTH_MODE': 'Stealth Mode',
        'OBFUSCATE_VIS': 'Obfuscates all visible wallet and contract addresses.',
        'EXPORT_AUTH': 'Export Authorization',
        'REQ_CRYPTO_SIGN': 'Requires cryptographic signature validation before exporting ledger data.',
        
        // Navigation
        'NAV_DASHBOARD': 'Dashboard',
        'NAV_WHALE_CHAT': 'Whale Chat',
        'NAV_PORTFOLIO': 'Portfolio',
        'NAV_COMMUNITY': 'Community',
        'NAV_NEWS': 'News',
        'NAV_ACADEMY': 'Academy',
        'NAV_FORUM': 'Forum',
        'NAV_CAREERS': 'Careers',
        'NAV_PRICING': 'Pricing',
        'NAV_STATUS': 'Status',
        'NAV_PRIVACY': 'Privacy',

        // Enum Labels
        'ENGLISH': 'English',
        'SPANISH': 'Spanish (ES)',
        'USD_DOLLAR': 'USD - Dollar',
        'EUR_EURO': 'EUR - Euro',
        'GBP_POUND': 'GBP - Pound',
        'JPY_YEN': 'JPY - Yen',
        '12_HOURS': '12 Hours (AM/PM)',
        '24_HOURS': '24 Hours',
        'ABBREVIATED': 'Abbreviated (0x1...ABCD)',
        'FULL_ADDRESS': 'Full Address',
        'RELAXED': 'Relaxed',
        'COMPACT': 'Compact',
        'DENSE': 'Dense',
        'MIN': 'MIN'
    },
    'es-ES': {
        // General
        'GENERAL_SETTINGS': 'AJUSTES GENERALES',
        'APPEARANCE': 'APARIENCIA',
        'PRIVACY_SECURITY': 'PRIVACIDAD Y SEGURIDAD',
        'SETTINGS': 'AJUSTES',
        'PREFERENCES': 'PREFERENCIAS',
        'MANAGE_CONFIG': 'GESTIONA LA CONFIGURACIÓN DE TU TERMINAL Y PREFERENCIAS PERSONALES.',
        'TOTAL_DISCONNECT': 'DESCONEXIÓN TOTAL',
        'ALL_SESSIONS_TERMINATED': 'TODAS LAS SESIONES TERMINADAS.',

        // Settings Toggles
        'LANGUAGE': 'Idioma',
        'INTERFACE_LANGUAGE': 'Idioma de la interfaz.',
        'BASE_CURRENCY': 'Moneda Base',
        'DEFAULT_CURRENCY': 'Moneda por defecto para balances.',
        'TIME_FORMAT': 'Formato de Tiempo',
        'TIME_LAYOUT': 'Distribución visual del reloj.',
        'DATE_FORMAT': 'Formato de Fecha',
        'DATE_ORDERING': 'Orden de día, mes y año.',
        'ADDRESS_FORMAT': 'Formato de Billetera',
        'CRYPTO_RENDER': 'Renderizado de direcciones criptográficas.',
        'DENSITY': 'Densidad',
        'SPACING_DENSITY': 'Espaciado general de la interfaz.',
        'SHOW_BALANCES': 'Mostrar Saldos',
        'DISPLAY_PORTFOLIO': 'Muestra saldos del portafolio en pantalla.',
        'HW_ACCELERATION': 'Aceleración por Hardware',
        'ENABLE_GPU': 'Habilita renderizado de alto rendimiento por GPU.',
        'INACTIVITY_TIMEOUT': 'Bloqueo por Inactividad',
        'MINUTES_LOCK': 'Minutos de inactividad antes del auto-bloqueo.',
        'STEALTH_MODE': 'Modo Sigilo (Stealth)',
        'OBFUSCATE_VIS': 'Ofusca visualmente carteras y contratos.',
        'EXPORT_AUTH': 'Autorización de Exportación',
        'REQ_CRYPTO_SIGN': 'Requiere firma criptográfica antes de exportar datos.',
        
        // Navigation
        'NAV_DASHBOARD': 'Panel Principal',
        'NAV_WHALE_CHAT': 'Chat Cuántico',
        'NAV_PORTFOLIO': 'Portafolio',
        'NAV_COMMUNITY': 'Comunidad',
        'NAV_NEWS': 'Noticias',
        'NAV_ACADEMY': 'Academia',
        'NAV_FORUM': 'Foro',
        'NAV_CAREERS': 'Carreras',
        'NAV_PRICING': 'Precios',
        'NAV_STATUS': 'Estado de Red',
        'NAV_PRIVACY': 'Privacidad',

        // Enum Labels
        'ENGLISH': 'Inglés',
        'SPANISH': 'Español (ES)',
        'USD_DOLLAR': 'USD - Dólar',
        'EUR_EURO': 'EUR - Euro',
        'GBP_POUND': 'GBP - Libra',
        'JPY_YEN': 'JPY - Yen',
        '12_HOURS': '12 Horas (AM/PM)',
        '24_HOURS': '24 Horas',
        'ABBREVIATED': 'Abreviado (0x1...ABCD)',
        'FULL_ADDRESS': 'Dirección Completa',
        'RELAXED': 'Relajado',
        'COMPACT': 'Compacto',
        'DENSE': 'Denso',
        'MIN': 'MIN'
    }
};

export type TranslationKey = keyof typeof dictionaries['en'];

export function useSystemTranslation() {
    const { settings } = useSettingsStore();
    const lang = settings?.language === 'es-ES' ? 'es-ES' : 'en';

    const t = (key: TranslationKey): string => {
        return dictionaries[lang][key] || dictionaries['en'][key] || key;
    };

    return { t, lang };
}
