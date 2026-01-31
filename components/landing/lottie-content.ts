export interface LottieItem {
  id: string;
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  src: string;
  categoryEn: string;
  categoryEs: string;
}

export const LOTTIE_CONTENT: LottieItem[] = [
  // --- CORE FEATURES ---
  {
    id: 'core-1',
    titleEn: 'Human Wallet',
    titleEs: 'Human Wallet',
    subtitleEn: 'The world\'s most human wallet',
    subtitleEs: 'La billetera más humana del mundo',
    src: 'https://lottie.host/0f8c4e3d-9b7a-4f6c-8d2e-1a3b4c5d6e7f/9KJh8G7F6D.lottie',
    categoryEn: 'Core',
    categoryEs: 'Núcleo'
  },
  {
    id: 'core-2',
    titleEn: 'Prediction Markets',
    titleEs: 'Mercados de Predicción',
    subtitleEn: 'Decentralized prediction markets',
    subtitleEs: 'Mercados de predicción descentralizados',
    src: 'https://lottie.host/57803657-6105-4752-921c-308101452631/ShieldSecure.lottie',
    categoryEn: 'Core',
    categoryEs: 'Núcleo'
  },
  {
    id: 'core-3',
    titleEn: 'Yield Farming',
    titleEs: 'Yield Farming',
    subtitleEn: 'Automated and secure returns',
    subtitleEs: 'Rendimientos automatizados y seguros',
    src: 'https://lottie.host/8e4d2f1c-9bfa-4b77-8db5-3c5f1b2e6a9d/RainCoins.lottie',
    categoryEn: 'Core',
    categoryEs: 'Núcleo'
  },
  {
    id: 'core-4',
    titleEn: 'Governance',
    titleEs: 'Gobernanza',
    subtitleEn: 'Your voice decides the future',
    subtitleEs: 'Tu voz decide el futuro',
    src: 'https://lottie.host/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/CoinSwap3D.lottie',
    categoryEn: 'Core',
    categoryEs: 'Núcleo'
  },
  {
    id: 'core-5',
    titleEn: 'Global Settlements',
    titleEs: 'Liquidaciones Globales',
    subtitleEn: 'Instant borderless payments',
    subtitleEs: 'Pagos instantáneos sin fronteras',
    src: 'https://lottie.host/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p/FastLightning.lottie',
    categoryEn: 'Core',
    categoryEs: 'Núcleo'
  },

  // --- LAUNCH 2027 ---
  {
    id: 'launch-1',
    titleEn: 'Neural Interface',
    titleEs: 'Interfaz Neural',
    subtitleEn: 'Direct mental control (Beta 2027)',
    subtitleEs: 'Control mental directo (Beta 2027)',
    src: 'https://lottie.host/0f8c4e3d-9b7a-4f6c-8d2e-1a3b4c5d6e7f/9KJh8G7F6D.lottie', 
    categoryEn: 'Launch 2027',
    categoryEs: 'Lanzamiento 2027'
  },
  {
    id: 'launch-2',
    titleEn: 'Quantum Security',
    titleEs: 'Seguridad Cuántica',
    subtitleEn: 'Standard post-quantum encryption',
    subtitleEs: 'Cifrado post-cuántico estándar',
    src: 'https://lottie.host/57803657-6105-4752-921c-308101452631/ShieldSecure.lottie',
    categoryEn: 'Launch 2027',
    categoryEs: 'Lanzamiento 2027'
  },
  {
    id: 'launch-3',
    titleEn: 'Zero Latency',
    titleEs: 'Latencia Cero',
    subtitleEn: 'Global edge infrastructure',
    subtitleEs: 'Infraestructura global de borde',
    src: 'https://lottie.host/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p/FastLightning.lottie',
    categoryEn: 'Launch 2027',
    categoryEs: 'Lanzamiento 2027'
  },
  {
    id: 'launch-4',
    titleEn: 'Universal ID',
    titleEs: 'ID Universal',
    subtitleEn: 'Sovereign identity across all chains',
    subtitleEs: 'Identidad soberana en todas las cadenas',
    src: 'https://lottie.host/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/CoinSwap3D.lottie',
    categoryEn: 'Launch 2027',
    categoryEs: 'Lanzamiento 2027'
  },
  {
    id: 'launch-5',
    titleEn: 'AI Governance',
    titleEs: 'Gobernanza por IA',
    subtitleEn: 'DAO optimization by AI',
    subtitleEs: 'Optimización de DAO por IA',
    src: 'https://lottie.host/8e4d2f1c-9bfa-4b77-8db5-3c5f1b2e6a9d/RainCoins.lottie',
    categoryEn: 'Launch 2027',
    categoryEs: 'Lanzamiento 2027'
  },

  // --- EXTRAS / FEATURES ---
  {
    id: 'feat-1',
    titleEn: 'Biometrics',
    titleEs: 'Biometría',
    subtitleEn: 'Secure access without passwords',
    subtitleEs: 'Acceso seguro sin contraseñas',
    src: 'https://lottie.host/57803657-6105-4752-921c-308101452631/ShieldSecure.lottie',
    categoryEn: 'Feature',
    categoryEs: 'Función'
  },
  {
    id: 'feat-2',
    titleEn: 'Social Graph',
    titleEs: 'Grafo Social',
    subtitleEn: 'Connect with your trust network',
    subtitleEs: 'Conecta con tu red de confianza',
    src: 'https://lottie.host/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/CoinSwap3D.lottie',
    categoryEn: 'Feature',
    categoryEs: 'Función'
  },
  {
    id: 'feat-3',
    titleEn: 'Privacy Layers',
    titleEs: 'Capas de Privacidad',
    subtitleEn: 'Optional anonymous transactions',
    subtitleEs: 'Transacciones anónimas opcionales',
    src: 'https://lottie.host/57803657-6105-4752-921c-308101452631/ShieldSecure.lottie',
    categoryEn: 'Feature',
    categoryEs: 'Función'
  },
  {
    id: 'feat-4',
    titleEn: 'Cross-chain',
    titleEs: 'Cross-chain',
    subtitleEn: 'Invisible bridge between L1 and L2',
    subtitleEs: 'Puente invisible entre L1 y L2',
    src: 'https://lottie.host/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/CoinSwap3D.lottie',
    categoryEn: 'Feature',
    categoryEs: 'Función'
  },
  {
    id: 'feat-5',
    titleEn: 'Institutional',
    titleEs: 'Institucional',
    subtitleEn: 'Compliance and advanced custody',
    subtitleEs: 'Cumplimiento y custodia avanzada',
    src: 'https://lottie.host/8e4d2f1c-9bfa-4b77-8db5-3c5f1b2e6a9d/RainCoins.lottie',
    categoryEn: 'Feature',
    categoryEs: 'Función'
  }
];
