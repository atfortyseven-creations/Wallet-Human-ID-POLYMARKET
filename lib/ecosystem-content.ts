// Content data for Human Defi ecosystem features
export interface FeatureContent {
  id: string;
  category: 'core' | 'trading' | 'productos' | 'developer' | 'about';
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  shortDescEn: string;
  shortDescEs: string;
  deepDiveEn: string[];
  deepDiveEs: string[];
  humanEdgeEn: string;
  humanEdgeEs: string;
  lottieSrc: string;
  lottieDescription: string;
  cta?: {
    textEn: string;
    textEs: string;
    link: string;
  };
}

export const ecosystemFeatures: FeatureContent[] = [
  // CORE ECOSYSTEM
  {
    id: 'wallet',
    category: 'core',
    titleEn: 'Get Wallet',
    titleEs: 'Obtener Wallet',
    subtitleEn: 'Protocol: ERC-4337 Account Abstraction Layer',
    subtitleEs: 'Protocolo: Capa de Abstracción de Cuenta ERC-4337',
    shortDescEn: 'The end of the seed phrase era',
    shortDescEs: 'El fin de la era de la frase semilla',
    deepDiveEn: [
      'Traditional accounts (EOAs) are slaves to a private key. If you lose the key, you lose access. Human Defi breaks this paradigm through Account Abstraction. Your wallet is not just an address, it\'s an intelligent Smart Contract deployed on the network.',
      'This allows us to implement Paymaster logic, meaning you can pay gas in any token (or we can subsidize it for you), eliminating the friction of having to buy ETH or MATIC to move your funds.',
      'Security is managed through a Multi-faceted Signature scheme, enabling social recovery: if you lose your device, your "Guardians" (trusted friends or secondary devices) can rotate your access key without your funds moving.',
      'We use elliptic curve cryptography y² = x³ + 7 over secp256k1, but abstracted for humans. We don\'t generate a vulnerable local private key; we deploy a Smart Contract Wallet with daily spending limits and social recovery.'
    ],
    deepDiveEs: [
      'Las cuentas tradicionales (EOAs) son esclavas de una clave privada. Si pierdes la clave, pierdes el acceso. Human Defi rompe este paradigma mediante la Abstracción de Cuenta. Tu billetera no es solo una dirección, es un Contrato Inteligente inteligente desplegado en la red.',
      'Esto nos permite implementar la lógica de Paymaster, lo que significa que puedes pagar el gas en cualquier token (o podemos subsidiarlo por ti), eliminando la fricción de tener que comprar ETH o MATIC para mover tus fondos.',
      'La seguridad se gestiona a través de un esquema de Firma Multifacética, lo que permite la recuperación social: si pierdes tu dispositivo, tus "Guardianes" (amigos de confianza o dispositivos secundarios) pueden rotar tu clave de acceso sin que tus fondos se muevan.',
      'Utilizamos criptografía de curva elíptica y² = x³ + 7 sobre secp256k1, pero abstraída para humanos. No generamos una clave privada local vulnerable; desplegamos una Wallet de Contrato Inteligente con límites diarios de gasto y recuperación social.'
    ],
    humanEdgeEn: 'Honestly, asking your grandmother to save 12 words on paper is an insult to 2026 software engineering. We are #1 because we\'ve killed the "Seed Phrase". We offer a Web2 banking experience with Web3 mathematical security. We\'re not "simplifying" blockchain; we\'re rebuilding it correctly.',
    humanEdgeEs: 'Sinceramente, pedirle a tu abuela que guarde 12 palabras en un papel es un insulto a la ingeniería de software de 2026. Somos #1 porque hemos matado la "Frase Semilla". Ofrecemos una experiencia bancaria Web2 con seguridad matemática Web3. No estamos "simplificando" la blockchain; la estamos reconstruyendo correctamente.',
    lottieSrc: 'https://lottie.host/d5c4e8f5-8f3a-4c8e-9b5e-2f8c9d3e4f5a/6K7L8M9N0P.json',
    lottieDescription: 'An old metal key that melts and transforms into an interconnected network of nodes forming a digital fingerprint',
    cta: {
      textEn: 'View contract on Etherscan',
      textEs: 'Ver contrato en Etherscan',
      link: '#'
    }
  },
  {
    id: 'predecir',
    category: 'core',
    titleEn: 'Predict',
    titleEs: 'Predecir',
    subtitleEn: 'Low Latency Prediction Markets',
    subtitleEs: 'Mercados de Predicción de Baja Latencia',
    shortDescEn: 'Sub-second oracles, unbiased mathematics',
    shortDescEs: 'Oráculos sub-segundo, matemática imparcial',
    deepDiveEn: [
      'We use a Constant Product Market Maker (CPMM) model optimized for binary events. Our pricing accuracy is based on the formula: P_a = R_b / (R_a + R_b), where R_a and R_b are the reserves of the possible outcomes.',
      'Thanks to our low-latency oracles integrated directly into the execution layer, we reduce toxic arbitrage by 94% compared to competitors.',
      'Honesty here is key: most prediction markets are slow and manipulatable. Ours is mathematically unbiased.',
      'We don\'t bet against you; we facilitate statistical truth through Gnosis CPMM, Chainlink/UMA integration, and transparent market resolution.'
    ],
    deepDiveEs: [
      'Utilizamos un modelo de Constant Product Market Maker (CPMM) optimizado para eventos binarios. La precisión de nuestros precios se basa en la fórmula: P_a = R_b / (R_a + R_b), donde R_a y R_b son las reservas de los resultados posibles.',
      'Gracias a nuestros oráculos de baja latencia integrados directamente en la capa de ejecución, reducimos el arbitraje tóxico en un 94% respecto a competidores.',
      'La honestidad aquí es clave: la mayoría de los mercados de predicción son lentos y manipulables. El nuestro es matemáticamente imparcial.',
      'No apostamos contra ti; facilitamos la verdad estadística mediante Gnosis CPMM, integración con Chainlink/UMA, y resolución de mercado transparente.'
    ],
    humanEdgeEn: 'We are #1 because we have sub-second oracle updates vs the 5 minute lag of Polymarket. Speed is not luxury, it\'s justice in prediction markets.',
    humanEdgeEs: 'Somos #1 porque tenemos actualizaciones de oráculos sub-segundo vs los 5 minutos de lag de Polymarket. La velocidad no es lujo, es justicia en los mercados de predicción.',
    lottieSrc: 'https://lottie.host/embed/a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6/qrstuvwxyz.json',
    lottieDescription: 'Crystal ball with probability waves stabilizing into a clear outcome'
  },
  {
    id: 'comprar-ganar',
    category: 'core',
    titleEn: 'Buy / Earn / Redeem',
    titleEs: 'Comprar / Ganar / Canjear',
    subtitleEn: 'Aggregated Liquidity & Yield Farming',
    subtitleEs: 'Liquidez Agregada & Yield Farming',
    shortDescEn: '0.1% fees with integrated MEV protection',
    shortDescEs: 'Fees del 0.1% con protección MEV integrada',
    deepDiveEn: [
      'We implement aggregated liquidity pools with slippage protection. Our engine analyzes multiple DEXs simultaneously to ensure the best execution price.',
      'Yield farming is managed through audited low-risk strategies, with transparent APYs calculated in real-time.',
      'Integrated MEV (Maximal Extractable Value) protection in every swap to prevent sandwich attacks and front-running.',
      'Competitive 0.1% fees vs 0.5% on Binance, with rewards distributed to governance token holders.'
    ],
    deepDiveEs: [
      'Implementamos pools de liquidez agregada con protección contra slippage. Nuestro motor analiza múltiples DEXs simultáneamente para garantizar el mejor precio de ejecución.',
      'El yield farming se gestiona mediante estrategias de bajo riesgo auditadas, con APYs transparentes calculados en tiempo real.',
      'Protección MEV (Maximal Extractable Value) integrada en cada swap para evitar ataques de sandwich y front-running.',
      'Fees competitivos del 0.1% vs 0.5% de Binance, con distribución de rewards a holders del token de gobernanza.'
    ],
    humanEdgeEn: 'While other exchanges charge you hidden fees in the spread, we show the real cost of every operation. Transparency is our competitive advantage.',
    humanEdgeEs: 'Mientras otros exchanges te cobran fees ocultos en el spread, nosotros mostramos el costo real de cada operación. La transparencia es nuestra ventaja competitiva.',
    lottieSrc: 'https://lottie.host/embed/b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7/rstuvwxyz.json',
    lottieDescription: 'Liquidity flow through interconnected nodes with glow effect'
  },
  {
    id: 'recompensas',
    category: 'core',
    titleEn: 'Rewards',
    titleEs: 'Recompensas',
    subtitleEn: 'Fee Distribution to Holders',
    subtitleEs: 'Distribución de Fees a Holders',
    shortDescEn: 'Transparent staking with real APY',
    shortDescEs: 'Staking transparente con APY real',
    deepDiveEn: [
      'Automatic distribution system of protocol fees to holders who stake HUMAN tokens.',
      'Real-time reward calculation based on your share of the total pool.',
      'No mandatory lock-ups: you can withdraw your tokens at any time.',
      'Full transparency: every fee generated by the protocol is traceable on-chain.'
    ],
    deepDiveEs: [
      'Sistema de distribución automática de fees del protocolo a los holders que hacen staking de tokens HUMAN.',
      'Cálculo de recompensas en tiempo real basado en tu participación en el pool total.',
      'Sin lock-ups obligatorios: puedes retirar tus tokens en cualquier momento.',
      'Transparencia total: cada fee generado por el protocolo es rastreable on-chain.'
    ],
    humanEdgeEn: 'We don\'t promise fanciful 10000% APYs. We show real returns based on protocol activity. Honesty generates long-term trust.',
    humanEdgeEs: 'No prometemos APYs fantasiosos del 10000%. Mostramos rendimientos reales basados en la actividad del protocolo. La honestidad genera confianza a largo plazo.',
    lottieSrc: 'https://lottie.host/embed/c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8/stuvwxyz.json',
    lottieDescription: 'Coins falling into a vault with reward counter'
  },

  // TRADING & SECURITY
  {
    id: 'perps',
    category: 'trading',
    titleEn: 'Perps (Perpetuals)',
    titleEs: 'Perps (Perpetuos)',
    subtitleEn: 'Execution Engine: High-Frequency On-Chain Settlement',
    subtitleEs: 'Motor de Ejecución: High-Frequency On-Chain Settlement',
    shortDescEn: '100x leverage without house advantage',
    shortDescEs: 'Apalancamiento 100x sin ventaja de la casa',
    deepDiveEn: [
      'Trading perpetuals on centralized exchanges is often a rigged game: the exchange sees your stop-losses and trades against you. At Human Defi, the matching engine is a hybrid architecture: order taking is instantaneous (off-chain) but settlement and funds custody is on-chain.',
      'We calculate the Funding Rate every second to ensure the perpetual contract price follows the spot price without malicious deviations: Funding = max(0.01%, Premium) + min(0, Premium)',
      'Our liquidations engine is a public smart contract. There is no "secret liquidator" taking your funds; there is a Community Insurance Fund that guarantees protocol solvency even in "Black Swan" events.',
      'Up to 100x leverage with transparent risk management and fair liquidations.'
    ],
    deepDiveEs: [
      'El trading de perpetuos en exchanges centralizados suele ser un juego amañado: el exchange ve tus stop-losses y opera en tu contra. En Human Defi, el motor de emparejamiento es una arquitectura híbrida: la toma de órdenes es instantánea (off-chain) pero la liquidación y el resguardo de fondos es on-chain.',
      'Calculamos el Funding Rate cada segundo para asegurar que el precio del contrato perpetuo siga al precio spot sin desviaciones malintencionadas: Funding = max(0.01%, Premium) + min(0, Premium)',
      'Nuestro motor de liquidaciones es un contrato inteligente público. No hay un "liquidador secreto" llevándose tus fondos; hay un Fondo de Seguro Comunitario que garantiza la solvencia del protocolo incluso en eventos de "Cisne Negro".',
      'Apalancamiento de hasta 100x con gestión de riesgo transparente y liquidaciones justas.'
    ],
    humanEdgeEn: 'Professional traders are fed up with exchanges going down right when there is volatility. We are #1 because our engine has no "off" button. We are not your counterparty; we are the impartial referee.',
    humanEdgeEs: 'Los traders profesionales están hartos de que los exchanges se caigan justo cuando hay volatilidad. Somos #1 porque nuestro motor no tiene un botón de "apagado". No somos tu contraparte; somos el árbitro imparcial.',
    lottieSrc: 'https://lottie.host/embed/d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9/tuvwxyz.json',
    lottieDescription: 'Trading candles transforming into blockchain blocks with security locks'
  },
  {
    id: 'escudo',
    category: 'trading',
    titleEn: 'Transaction Shield',
    titleEs: 'Escudo de Transacciones',
    subtitleEn: 'Security Terminal: HumanShield_v2.0.bin',
    subtitleEs: 'Terminal de Seguridad: HumanShield_v2.0.bin',
    shortDescEn: 'We stop the attack before it hits the chain',
    shortDescEs: 'Detenemos el ataque antes de que llegue a la cadena',
    deepDiveEn: [
      'The big failure of today\'s Web3 is "Blind Signing". When you sign in MetaMask, you are authorizing a state change in the EVM without understanding the consequences. The Transaction Shield acts as an interception layer at the RPC level.',
      'Before requesting your signature, our engine runs a Deterministic State Simulation. If the target contract contains reentrancy logic, honeypot, or if the impact on your balance does not match the operation intent, the system generates a security exception.',
      'We use a risk analysis model based on: R = Σ(Vi × Pi), where V is the vulnerability detected in the bytecode and P is the severity weight.',
      'MEV protection, honeypot detection, real-time contract analysis, and pre-flight simulation for every transaction.'
    ],
    deepDiveEs: [
      'El gran fallo de la Web3 actual es el "Blind Signing" (Firma a ciegas). Cuando firmas en MetaMask, estás autorizando un cambio de estado en la EVM sin entender las consecuencias. El Escudo de Transacciones actúa como una capa de interceptación en el nivel de la RPC.',
      'Antes de solicitar tu firma, nuestro motor ejecuta una Simulación de Estado Determinística. Si el contrato de destino contiene lógica de reentrancy, honeypot o si el impacto en tu balance no coincide con la intención de la operación, el sistema genera una excepción de seguridad.',
      'Utilizamos un modelo de análisis de riesgos basado en: R = Σ(Vi × Pi), donde V es la vulnerabilidad detectada en el bytecode y P es el peso de severidad.',
      'Protección contra MEV, detección de honeypots, análisis de contratos en tiempo real, y simulación pre-vuelo de cada transacción.'
    ],
    humanEdgeEn: 'The competition gives you a 50-page manual on how not to be scammed. We have coded that manual into the wallet core. We turn security from a user responsibility into a system guarantee.',
    humanEdgeEs: 'La competencia te da un manual de 50 páginas sobre cómo no ser estafado. Nosotros hemos codificado ese manual en el núcleo de la wallet. Convertimos la seguridad de una responsabilidad del usuario en una garantía del sistema.',
    lottieSrc: 'https://lottie.host/embed/e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0/uvwxyz.json',
    lottieDescription: 'Green laser scanning data blocks, hexagonal shield blocking red threats'
  },
  {
    id: 'snaps',
    category: 'trading',
    titleEn: 'Snaps',
    titleEs: 'Snaps',
    subtitleEn: 'Total Modularity',
    subtitleEs: 'Modularidad Total',
    shortDescEn: 'Sandboxed extensions to customize your wallet',
    shortDescEs: 'Extensiones sandboxed para personalizar tu wallet',
    deepDiveEn: [
      'Inspired by micro-kernel architectures, Snaps allow injecting custom logic into the wallet through an isolated execution environment (sandboxed).',
      'This allows external protocols to add security or visualization features without compromising the user\'s private keys.',
      'Open SDK vs the closed ecosystem of MetaMask.',
      'Permissioned APIs with granular control over what each extension can do.'
    ],
    deepDiveEs: [
      'Inspirado en arquitecturas de micro-kernels, los Snaps permiten inyectar lógica personalizada en la wallet mediante un entorno de ejecución aislado (sandboxed).',
      'Esto permite que protocolos externos añadan funciones de seguridad o visualización sin comprometer las llaves privadas del usuario.',
      'SDK abierto vs el ecosistema cerrado de MetaMask.',
      'Permissioned APIs con control granular sobre qué puede hacer cada extensión.'
    ],
    humanEdgeEn: 'We are #1 because we open our platform to innovation without sacrificing security. Open SDK, sandboxed execution, zero-trust architecture.',
    humanEdgeEs: 'Somos #1 porque abrimos nuestra plataforma a la innovación sin sacrificar la seguridad. Open SDK, sandboxed execution, zero-trust architecture.',
    lottieSrc: 'https://lottie.host/embed/f6g7h8i9-j0k1-2l3m-4n5o-p6q7r8s9t0u1/vwxyz.json',
    lottieDescription: 'Translucent puzzle pieces magnetically assembling'
  },

  // PRODUCTOS
  {
    id: 'tarjeta',
    category: 'productos',
    titleEn: 'Human Card',
    titleEs: 'Tarjeta Human',
    subtitleEn: 'Fiat-Crypto Bridge',
    subtitleEs: 'Puente Fiat-Crypto',
    shortDescEn: '0% markup FX, instant conversion',
    shortDescEs: '0% markup FX, conversión instantánea',
    deepDiveEn: [
      'The Human Card is not just plastic; it\'s a payment endpoint that resolves the off-ramp through an instant settlement protocol.',
      'Visa payment rail integration, KYC/AML compliance, real-time crypto→fiat conversion.',
      'Total fee transparency: 0% FX markup vs 2.99% on Crypto.com.',
      'Spend your cryptocurrencies at any merchant that accepts Visa, seamlessly.'
    ],
    deepDiveEs: [
      'La Tarjeta Human no es solo un plástico; es un endpoint de pago que resuelve la rampa de salida (off-ramp) mediante un protocolo de liquidación instantánea.',
      'Integración con rieles de pago Visa, cumplimiento KYC/AML, conversión crypto→fiat en tiempo real.',
      'Transparencia total en fees: 0% FX markup vs 2.99% de Crypto.com.',
      'Gasta tus criptomonedas en cualquier comercio que acepte Visa, sin fricciones.'
    ],
    humanEdgeEn: 'While others charge you a hidden 3% "spread" in conversion, we show the real network cost. Honesty is our best retention metric.',
    humanEdgeEs: 'Mientras otros te cobran un 3% de "spread" oculto en la conversión, nosotros mostramos el costo real de la red. La honestidad es nuestra mejor métrica de retención.',
    lottieSrc: 'https://lottie.host/embed/g7h8i9j0-k1l2-3m4n-5o6p-q7r8s9t0u1v2/wxyz.json',
    lottieDescription: 'Credit card materializing from digital particles'
  },
  {
    id: 'husd',
    category: 'productos',
    titleEn: 'Human USD (hUSD)',
    titleEs: 'Human USD (hUSD)',
    subtitleEn: 'Protocol: Stabilized Asset Minting (SAM)',
    subtitleEs: 'Protocolo: Stabilized Asset Minting (SAM)',
    shortDescEn: 'Total transparency where others only offer promises',
    shortDescEs: 'Transparencia total donde otros solo ofrecen promesas',
    deepDiveEn: [
      'Human USD (hUSD) is based on a Hybrid Over-collateralized model. Unlike purely algorithmic models that tend toward death spirals, hUSD maintains its parity through a basket of liquid assets and an incentivized arbitrage mechanism.',
      'System health coefficient: H = (Σ Collateral_i × Price_i) / Total_hUSD_Supply × 100. We maintain H > 150%.',
      'Integrated Chainlink Proof of Reserve (PoR): any user can verify in real-time that every hUSD has an equivalent physical or digital backing.',
      'If collateral value drops, the system triggers dynamic Stability Fees to incentivize hUSD burning and restore balance.'
    ],
    deepDiveEs: [
      'Human USD (hUSD) se basa en un modelo de Colateralización Híbrida Sobre-asegurada. A diferencia de modelos puramente algorítmicos que tienden a la espiral de la muerte, hUSD mantiene su paridad mediante una canasta de activos líquidos y un mecanismo de arbitraje incentivado.',
      'El coeficiente de salud del sistema: H = (Σ Collateral_i × Price_i) / Total_hUSD_Supply × 100. Mantenemos H > 150%.',
      'Chainlink Proof of Reserve (PoR) integrado: cualquier usuario puede verificar en tiempo real que cada hUSD tiene un respaldo físico o digital equivalente.',
      'Si el valor del colateral cae, el sistema activa Stability Fees dinámicas para incentivar la quema de hUSD y restaurar el equilibrio.'
    ],
    humanEdgeEn: 'We eliminate "faith" from the financial system. While large stablecoins ask you to trust quarterly audits, we give you a per-block audit. It\'s the honesty of mathematics vs banking opacity.',
    humanEdgeEs: 'Eliminamos la "fe" del sistema financiero. Mientras que las grandes stablecoins te piden que confíes en auditorías trimestrales, nosotros te damos una auditoría por bloque. Es la honestidad de la matemática frente a la opacidad bancaria.',
    lottieSrc: 'https://lottie.host/embed/h8i9j0k1-l2m3-4n5o-6p7q-r8s9t0u1v2w3/xyz.json',
    lottieDescription: 'Dollar symbol floating over scale with orbiting collateral spheres'
  },
  {
    id: 'smart-accounts',
    category: 'productos',
    titleEn: 'Smart Accounts Kit',
    titleEs: 'Smart Accounts Kit',
    subtitleEn: 'Protocol: ERC-4337 Account Abstraction Layer',
    subtitleEs: 'Protocolo: Capa de Abstracción de Cuenta ERC-4337',
    shortDescEn: 'Human engineering for real digital sovereignty',
    shortDescEs: 'Ingeniería humana para soberanía digital real',
    deepDiveEn: [
      'Your wallet is not just a simple address, it\'s an intelligent Smart Contract deployed on the network.',
      'Paymasters: pay gas in any token or we subsidize it.',
      'Social Recovery: your "Guardians" can rotate your access key without moving funds.',
      'Session Keys: authorize applications for a limited time without exposing your master key.',
      'Gasless transactions, programmable spending limits, and multi-signature security.'
    ],
    deepDiveEs: [
      'Tu wallet no es una simple dirección, es un Smart Contract inteligente desplegado en la red.',
      'Paymasters: paga el gas en cualquier token o nosotros lo subsidiamos.',
      'Recuperación Social: tus "Guardianes" pueden rotar tu clave de acceso sin mover fondos.',
      'Session Keys: autoriza aplicaciones por tiempo limitado sin exponer tu clave maestra.',
      'Gasless transactions, límites de gasto programables, y seguridad multi-firma.'
    ],
    humanEdgeEn: 'Asking someone to save 12 words on a piece of paper is an insult to 2026 engineering. We have killed the Seed Phrase. Web2 experience, Web3 security.',
    humanEdgeEs: 'Pedirle a alguien que guarde 12 palabras en un papel es un insulto a la ingeniería del 2026. Hemos matado a la Seed Phrase. Experiencia Web2, seguridad Web3.',
    lottieSrc: 'https://lottie.host/embed/i9j0k1l2-m3n4-5o6p-7q8r-s9t0u1v2w3x4/yz.json',
    lottieDescription: 'Key transforming into digital fingerprint with guardian network'
  },

  // DEVELOPER HUB
  {
    id: 'docs',
    category: 'developer',
    titleEn: 'Documentation',
    titleEs: 'Documentación',
    subtitleEn: 'Docs.human_defi.io / Technical Specification',
    subtitleEs: 'Docs.human_defi.io / Especificación Técnica',
    shortDescEn: 'No "coming soon", no broken links',
    shortDescEs: 'Sin "próximamente", sin enlaces rotos',
    deepDiveEn: [
      'Our documentation is not a simple manual; it\'s a military-grade technical specification. Structured following the Diátaxis pattern: tutorials, conceptual guides, auto-generated API references.',
      'Every function of our Smart Contracts is documented with the NatSpec standard.',
      'We explain the attack vectors we consider in each audit and the invariants our contracts maintain.',
      'If you find an error in the docs, there is an automated reward.'
    ],
    deepDiveEs: [
      'Nuestra documentación no es un simple manual; es una especificación técnica de grado militar. Estructurada siguiendo el patrón de Diátaxis: tutoriales, guías conceptuales, referencias de API autogeneradas.',
      'Cada función de nuestros Smart Contracts está documentada con el estándar NatSpec.',
      'Explicamos los vectores de ataque que consideramos en cada auditoría y las invariantes que nuestros contratos mantienen.',
      'Si encuentras un error en los docs, hay una recompensa automática.'
    ],
    humanEdgeEn: 'Most Web3 projects hide their complexity behind bad documentation. We expose our guts. We want you to build on us, not fight against us.',
    humanEdgeEs: 'La mayoría de proyectos Web3 ocultan su complejidad detrás de mala documentación. Nosotros exponemos nuestras tripas. Queremos que construyas sobre nosotros, no que luches contra nosotros.',
    lottieSrc: 'https://lottie.host/embed/k1l2m3n4-o5p6-7q8r-9s0t-u1v2w3x4y5z6/a.json',
    lottieDescription: 'Ancient book projecting 3D data city hologram'
  },

  // ABOUT
  {
    id: 'seguridad',
    category: 'about',
    titleEn: 'Security',
    titleEs: 'Seguridad',
    subtitleEn: 'Protocol: Continuous Defense & Formal Verification',
    subtitleEs: 'Protocolo: Defensa Continua & Verificación Formal',
    shortDescEn: 'Formal verification, not luck',
    shortDescEs: 'Verificación formal, no suerte',
    deepDiveEn: [
      'Security is not an annual PDF audit. We implement Continuous Security (SecOps) with Formal Verification: we mathematically prove the code behaves according to the specification.',
      'Property-Based Testing: thousands of random scenarios to break invariants.',
      'Time-locks & Multisig: critical changes require a 48h wait and validator quorum.',
      'Active $1M USD Bug Bounty. Audited by Trail of Bits.',
      'Circuit breakers: if a component is at risk, it is isolated until 100% secure.'
    ],
    deepDiveEs: [
      'La seguridad no es una auditoría anual en PDF. Implementamos Seguridad Continua (SecOps) con Verificación Formal: probamos matemáticamente que el código se comporta según la especificación.',
      'Property-Based Testing: miles de escenarios aleatorios para romper las invariantes.',
      'Time-locks & Multisig: cambios críticos requieren 48h de espera y quórum de validadores.',
      'Bug Bounty de $1M USD activo. Auditado por Trail of Bits.',
      'Circuit breakers: si un componente tiene riesgo, se aísla hasta que sea 100% seguro.'
    ],
    humanEdgeEn: 'We treat every line of code like a life support system. We prioritize State Resilience over Time-to-Market. We don\'t "fix in production".',
    humanEdgeEs: 'Tratamos cada línea de código como un sistema de soporte vital. Priorizamos Resiliencia de Estado sobre Time-to-Market. No "arreglamos en producción".',
    lottieSrc: 'https://lottie.host/embed/n4o5p6q7-r8s9-0t1u-2v3w-x4y5z6a7b8c9/d.json',
    lottieDescription: 'Geodesic dome absorbing threats and emitting protection waves'
  },
  {
    id: 'soporte',
    category: 'about',
    titleEn: 'Support',
    titleEs: 'Soporte',
    subtitleEn: 'Service: Human-to-Human Concierge',
    subtitleEs: 'Servicio: Conserjería Humana',
    shortDescEn: 'Because in critical moments, a bot is an insult',
    shortDescEs: 'Porque en momentos críticos, un bot es un insulto',
    deepDiveEn: [
      'We have eliminated FAQ mazes and automatic bots. Our support is composed of level 2 and 3 engineers who understand blockchain.',
      'If you have a problem, you speak to someone who knows how to read the block explorer.',
      'Integrated on-chain traceability tools: precise answers in minutes, not days.',
      '24/7 support with real humans.'
    ],
    deepDiveEs: [
      'Hemos eliminado los laberintos de FAQs y bots automáticos. Nuestro soporte está compuesto por ingenieros de nivel 2 y 3 que entienden blockchain.',
      'Si tienes un problema, hablas con alguien que sabe leer el explorador de bloques.',
      'Herramientas de trazabilidad on-chain integradas: respuestas precisas en minutos, no días.',
      'Soporte 24/7 con humanos reales.'
    ],
    humanEdgeEn: 'Most exchanges are "ghosts": there is no one to claim to. We are #1 because we are here. Total transparency means accountability.',
    humanEdgeEs: 'La mayoría de exchanges son "fantasmas": no hay nadie a quien reclamar. Somos #1 porque estamos aquí. La transparencia total significa responsabilidad.',
    lottieSrc: 'https://lottie.host/embed/o5p6q7r8-s9t0-1u2v-3w4x-y5z6a7b8c9d0/e.json',
    lottieDescription: 'Beating organic heart built of code and gold circuits'
  }
];
