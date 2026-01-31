// Content data for Human Defi ecosystem features
export interface FeatureContent {
  id: string;
  category: 'core' | 'trading' | 'productos' | 'developer' | 'about';
  title: string;
  subtitle: string;
  shortDesc: string;
  deepDive: string[];
  humanEdge: string;
  lottieSrc: string;
  lottieDescription: string;
  cta?: {
    text: string;
    link: string;
  };
}

export const ecosystemFeatures: FeatureContent[] = [
  // ECOSISTEMA CORE
  {
    id: 'wallet',
    category: 'core',
    title: 'Obtener Wallet',
    subtitle: 'Protocolo: ERC-4337 Account Abstraction Layer',
    shortDesc: 'El fin de la era de las seed phrases',
    deepDive: [
      'Las cuentas tradicionales (EOAs) son esclavas de una clave privada. Si pierdes la clave, pierdes el acceso. Human Defi rompe este paradigma mediante la Abstracción de Cuenta. Tu wallet no es una simple dirección, es un Smart Contract inteligente desplegado en la red.',
      'Esto nos permite implementar la lógica de Paymasters, lo que significa que puedes pagar el gas en cualquier token (o nosotros podemos subsidiarlo por ti), eliminando la fricción de tener que comprar ETH o MATIC para mover tus fondos.',
      'La seguridad se gestiona mediante un esquema de Firmas Multi-faceta, permitiendo la recuperación social: si pierdes tu dispositivo, tus "Guardianes" (amigos de confianza o dispositivos secundarios) pueden rotar tu clave de acceso sin que tus fondos se muevan.',
      'Utilizamos criptografía de curva elíptica y² = x³ + 7 sobre secp256k1, pero abstraída para el humano. No generamos una clave privada local vulnerable; desplegamos un Smart Contract Wallet con límites de gasto diarios y recuperación social.'
    ],
    humanEdge: 'Sinceramente, pedirle a tu abuela que guarde 12 palabras en un papel es un insulto a la ingeniería de software del 2026. Somos el número uno porque hemos matado a la "Seed Phrase". Ofrecemos una experiencia bancaria Web2 con la seguridad matemática de Web3. No estamos "simplificando" la blockchain; la estamos reconstruyendo correctamente.',
    lottieSrc: 'https://lottie.host/d5c4e8f5-8f3a-4c8e-9b5e-2f8c9d3e4f5a/6K7L8M9N0P.json',
    lottieDescription: 'Una llave metálica vieja que se funde y transforma en una red de nodos interconectados formando una huella dactilar digital',
    cta: {
      text: 'Ver contrato en Etherscan',
      link: '#'
    }
  },
  {
    id: 'predecir',
    category: 'core',
    title: 'Predecir',
    subtitle: 'Mercados de Predicción de Baja Latencia',
    shortDesc: 'Oráculos sub-segundo, matemática imparcial',
    deepDive: [
      'Utilizamos un modelo de Constant Product Market Maker (CPMM) optimizado para eventos binarios. La precisión de nuestros precios se basa en la fórmula: P_a = R_b / (R_a + R_b), donde R_a y R_b son las reservas de los resultados posibles.',
      'Gracias a nuestros oráculos de baja latencia integrados directamente en la capa de ejecución, reducimos el arbitraje tóxico en un 94% respecto a competidores.',
      'La honestidad aquí es clave: la mayoría de los mercados de predicción son lentos y manipulables. El nuestro es matemáticamente imparcial.',
      'No apostamos contra ti; facilitamos la verdad estadística mediante Gnosis CPMM, integración con Chainlink/UMA, y resolución de mercado transparente.'
    ],
    humanEdge: 'Somos #1 porque tenemos actualizaciones de oráculos sub-segundo vs los 5 minutos de lag de Polymarket. La velocidad no es lujo, es justicia en los mercados de predicción.',
    lottieSrc: 'https://lottie.host/embed/a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6/qrstuvwxyz.json',
    lottieDescription: 'Esfera de cristal con ondas de probabilidad que se estabilizan en un resultado claro'
  },
  {
    id: 'comprar-ganar',
    category: 'core',
    title: 'Comprar / Ganar / Canjear',
    subtitle: 'Liquidez Agregada & Yield Farming',
    shortDesc: 'Fees del 0.1% con protección MEV integrada',
    deepDive: [
      'Implementamos pools de liquidez agregada con protección contra slippage. Nuestro motor analiza múltiples DEXs simultáneamente para garantizar el mejor precio de ejecución.',
      'El yield farming se gestiona mediante estrategias de bajo riesgo auditadas, con APYs transparentes calculados en tiempo real.',
      'Protección MEV (Maximal Extractable Value) integrada en cada swap para evitar ataques de sandwich y front-running.',
      'Fees competitivos del 0.1% vs 0.5% de Binance, con distribución de rewards a holders del token de gobernanza.'
    ],
    humanEdge: 'Mientras otros exchanges te cobran fees ocultos en el spread, nosotros mostramos el costo real de cada operación. La transparencia es nuestra ventaja competitiva.',
    lottieSrc: 'https://lottie.host/embed/b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7/rstuvwxyz.json',
    lottieDescription: 'Flujo de liquidez atravesando nodos interconectados con efecto de brillo'
  },
  {
    id: 'recompensas',
    category: 'core',
    title: 'Recompensas',
    subtitle: 'Distribución de Fees a Holders',
    shortDesc: 'Staking transparente con APY real',
    deepDive: [
      'Sistema de distribución automática de fees del protocolo a los holders que hacen staking de tokens HUMAN.',
      'Cálculo de recompensas en tiempo real basado en tu participación en el pool total.',
      'Sin lock-ups obligatorios: puedes retirar tus tokens en cualquier momento.',
      'Transparencia total: cada fee generado por el protocolo es rastreable on-chain.'
    ],
    humanEdge: 'No prometemos APYs fantasiosos del 10000%. Mostramos rendimientos reales basados en la actividad del protocolo. La honestidad genera confianza a largo plazo.',
    lottieSrc: 'https://lottie.host/embed/c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8/stuvwxyz.json',
    lottieDescription: 'Monedas cayendo en una bóveda con contador de recompensas'
  },

  // TRADING & SECURITY
  {
    id: 'perps',
    category: 'trading',
    title: 'Perps (Perpetuos)',
    subtitle: 'Motor de Ejecución: High-Frequency On-Chain Settlement',
    shortDesc: 'Apalancamiento 100x sin ventaja de la casa',
    deepDive: [
      'El trading de perpetuos en exchanges centralizados suele ser un juego amañado: el exchange ve tus stop-losses y opera en tu contra. En Human Defi, el motor de emparejamiento es una arquitectura híbrida: la toma de órdenes es instantánea (off-chain) pero la liquidación y el resguardo de fondos es on-chain.',
      'Calculamos el Funding Rate cada segundo para asegurar que el precio del contrato perpetuo siga al precio spot sin desviaciones malintencionadas: Funding = max(0.01%, Premium) + min(0, Premium)',
      'Nuestro motor de liquidaciones es un contrato inteligente público. No hay un "liquidador secreto" llevándose tus fondos; hay un Fondo de Seguro Comunitario que garantiza la solvencia del protocolo incluso en eventos de "Cisne Negro".',
      'Apalancamiento de hasta 100x con gestión de riesgo transparente y liquidaciones justas.'
    ],
    humanEdge: 'Los traders profesionales están hartos de que los exchanges se caigan justo cuando hay volatilidad. Somos #1 porque nuestro motor no tiene un botón de "apagado". No somos tu contraparte; somos el árbitro imparcial.',
    lottieSrc: 'https://lottie.host/embed/d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9/tuvwxyz.json',
    lottieDescription: 'Velas de trading transformándose en bloques de blockchain con candados de seguridad'
  },
  {
    id: 'escudo',
    category: 'trading',
    title: 'Escudo de Transacciones',
    subtitle: 'Terminal de Seguridad: HumanShield_v2.0.bin',
    shortDesc: 'Detenemos el ataque antes de que llegue a la cadena',
    deepDive: [
      'El gran fallo de la Web3 actual es el "Blind Signing" (Firma a ciegas). Cuando firmas en MetaMask, estás autorizando un cambio de estado en la EVM sin entender las consecuencias. El Escudo de Transacciones actúa como una capa de interceptación en el nivel de la RPC.',
      'Antes de solicitar tu firma, nuestro motor ejecuta una Simulación de Estado Determinística. Si el contrato de destino contiene lógica de reentrancy, honeypot o si el impacto en tu balance no coincide con la intención de la operación, el sistema genera una excepción de seguridad.',
      'Utilizamos un modelo de análisis de riesgos basado en: R = Σ(Vi × Pi), donde V es la vulnerabilidad detectada en el bytecode y P es el peso de severidad.',
      'Protección contra MEV, detección de honeypots, análisis de contratos en tiempo real, y simulación pre-vuelo de cada transacción.'
    ],
    humanEdge: 'La competencia te da un manual de 50 páginas sobre cómo no ser estafado. Nosotros hemos codificado ese manual en el núcleo de la wallet. Convertimos la seguridad de una responsabilidad del usuario en una garantía del sistema.',
    lottieSrc: 'https://lottie.host/embed/e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0/uvwxyz.json',
    lottieDescription: 'Láser verde escaneando bloques de datos, escudo hexagonal bloqueando amenazas rojas'
  },
  {
    id: 'snaps',
    category: 'trading',
    title: 'Snaps',
    subtitle: 'Modularidad Total',
    shortDesc: 'Extensiones sandboxed para personalizar tu wallet',
    deepDive: [
      'Inspirado en arquitecturas de micro-kernels, los Snaps permiten inyectar lógica personalizada en la wallet mediante un entorno de ejecución aislado (sandboxed).',
      'Esto permite que protocolos externos añadan funciones de seguridad o visualización sin comprometer las llaves privadas del usuario.',
      'SDK abierto vs el ecosistema cerrado de MetaMask.',
      'Permissioned APIs con control granular sobre qué puede hacer cada extensión.'
    ],
    humanEdge: 'Somos #1 porque abrimos nuestra plataforma a la innovación sin sacrificar la seguridad. Open SDK, sandboxed execution, zero-trust architecture.',
    lottieSrc: 'https://lottie.host/embed/f6g7h8i9-j0k1-2l3m-4n5o-p6q7r8s9t0u1/vwxyz.json',
    lottieDescription: 'Piezas de puzzle translúcidas que se ensamblan magnéticamente'
  },

  // PRODUCTOS
  {
    id: 'tarjeta',
    category: 'productos',
    title: 'Tarjeta Human',
    subtitle: 'Puente Fiat-Crypto',
    shortDesc: '0% markup FX, conversión instantánea',
    deepDive: [
      'La Tarjeta Human no es solo un plástico; es un endpoint de pago que resuelve la rampa de salida (off-ramp) mediante un protocolo de liquidación instantánea.',
      'Integración con rieles de pago Visa, cumplimiento KYC/AML, conversión crypto→fiat en tiempo real.',
      'Transparencia total en fees: 0% FX markup vs 2.99% de Crypto.com.',
      'Gasta tus criptomonedas en cualquier comercio que acepte Visa, sin fricciones.'
    ],
    humanEdge: 'Mientras otros te cobran un 3% de "spread" oculto en la conversión, nosotros mostramos el costo real de la red. La honestidad es nuestra mejor métrica de retención.',
    lottieSrc: 'https://lottie.host/embed/g7h8i9j0-k1l2-3m4n-5o6p-q7r8s9t0u1v2/wxyz.json',
    lottieDescription: 'Tarjeta de crédito materializándose desde partículas digitales'
  },
  {
    id: 'husd',
    category: 'productos',
    title: 'Human USD (hUSD)',
    subtitle: 'Protocolo: Stabilized Asset Minting (SAM)',
    shortDesc: 'Transparencia total donde otros solo ofrecen promesas',
    deepDive: [
      'Human USD (hUSD) se basa en un modelo de Colateralización Híbrida Sobre-asegurada. A diferencia de modelos puramente algorítmicos que tienden a la espiral de la muerte, hUSD mantiene su paridad mediante una canasta de activos líquidos y un mecanismo de arbitraje incentivado.',
      'El coeficiente de salud del sistema: H = (Σ Collateral_i × Price_i) / Total_hUSD_Supply × 100. Mantenemos H > 150%.',
      'Chainlink Proof of Reserve (PoR) integrado: cualquier usuario puede verificar en tiempo real que cada hUSD tiene un respaldo físico o digital equivalente.',
      'Si el valor del colateral cae, el sistema activa Stability Fees dinámicas para incentivar la quema de hUSD y restaurar el equilibrio.'
    ],
    humanEdge: 'Eliminamos la "fe" del sistema financiero. Mientras que las grandes stablecoins te piden que confíes en auditorías trimestrales, nosotros te damos una auditoría por bloque. Es la honestidad de la matemática frente a la opacidad bancaria.',
    lottieSrc: 'https://lottie.host/embed/h8i9j0k1-l2m3-4n5o-6p7q-r8s9t0u1v2w3/xyz.json',
    lottieDescription: 'Símbolo de dólar flotando sobre balanza con esferas de colateral orbitando'
  },
  {
    id: 'smart-accounts',
    category: 'productos',
    title: 'Smart Accounts Kit',
    subtitle: 'Protocolo: ERC-4337 Account Abstraction Layer',
    shortDesc: 'Ingeniería humana para soberanía digital real',
    deepDive: [
      'Tu wallet no es una simple dirección, es un Smart Contract inteligente desplegado en la red.',
      'Paymasters: paga el gas en cualquier token o nosotros lo subsidiamos.',
      'Recuperación Social: tus "Guardianes" pueden rotar tu clave de acceso sin mover fondos.',
      'Session Keys: autoriza aplicaciones por tiempo limitado sin exponer tu clave maestra.',
      'Gasless transactions, límites de gasto programables, y seguridad multi-firma.'
    ],
    humanEdge: 'Pedirle a alguien que guarde 12 palabras en un papel es un insulto a la ingeniería del 2026. Hemos matado a la Seed Phrase. Experiencia Web2, seguridad Web3.',
    lottieSrc: 'https://lottie.host/embed/i9j0k1l2-m3n4-5o6p-7q8r-s9t0u1v2w3x4/yz.json',
    lottieDescription: 'Llave transformándose en huella dactilar digital con red de guardianes'
  },
  {
    id: 'wallets-integradas',
    category: 'productos',
    title: 'Billeteras Integradas',
    subtitle: 'Wallet-as-a-Service SDK',
    shortDesc: 'Integración en 2 líneas de código',
    deepDive: [
      'SDK de "Wallet-as-a-Service" que permite a cualquier aplicación Web2 integrar capacidades Web3 con dos líneas de código.',
      'Utilizamos MPC (Multi-Party Computation) para dividir la seguridad de la llave entre el dispositivo del usuario y nuestra infraestructura.',
      'White-label options, revenue sharing, y soporte técnico completo.',
      'De npm install a producción en minutos, no semanas.'
    ],
    humanEdge: '2 líneas de integración vs 2 semanas de setup de la competencia. Valoramos tu tiempo porque sabemos que el tiempo es dinero en desarrollo.',
    lottieSrc: 'https://lottie.host/embed/j0k1l2m3-n4o5-6p7q-8r9s-t0u1v2w3x4y5/z.json',
    lottieDescription: 'Línea de código expandiéndose en interfaz completa de wallet'
  },

  // DEVELOPER HUB
  {
    id: 'docs',
    category: 'developer',
    title: 'Documentación',
    subtitle: 'Docs.human_defi.io / Technical Specification',
    shortDesc: 'Sin "próximamente", sin enlaces rotos',
    deepDive: [
      'Nuestra documentación no es un simple manual; es una especificación técnica de grado militar. Estructurada siguiendo el patrón de Diátaxis: tutoriales, guías conceptuales, referencias de API autogeneradas.',
      'Cada función de nuestros Smart Contracts está documentada con el estándar NatSpec.',
      'Explicamos los vectores de ataque que consideramos en cada auditoría y las invariantes que nuestros contratos mantienen.',
      'Si encuentras un error en los docs, hay una recompensa automática.'
    ],
    humanEdge: 'La mayoría de proyectos Web3 ocultan su complejidad detrás de mala documentación. Nosotros exponemos nuestras tripas. Queremos que construyas sobre nosotros, no que luches contra nosotros.',
    lottieSrc: 'https://lottie.host/embed/k1l2m3n4-o5p6-7q8r-9s0t-u1v2w3x4y5z6/a.json',
    lottieDescription: 'Libro antiguo proyectando holograma de ciudad de datos en 3D'
  },
  {
    id: 'sdk',
    category: 'developer',
    title: 'SDK',
    subtitle: '@human-defi/core-sdk',
    shortDesc: 'De npm install a Mainnet en 10 minutos',
    deepDive: [
      'Type-safe de extremo a extremo con TypeScript. Olvida los errores de undefined.',
      'Abstracción de Proveedor: cambia entre Infura, Alchemy o nuestros nodos con una línea.',
      'Gas Estimation Engine: algoritmos predictivos que reducen el fracaso de transacciones en un 98%.',
      'Hooks de React/Vue nativos: gestión de estado global y suscripciones a eventos mediante WebSockets con reconexión automática.',
      'Menos boilerplate, más innovación.'
    ],
    humanEdge: 'Valoramos tu tiempo. Mientras otros SDKs requieren configurar 20 dependencias, nosotros te entregamos una herramienta que "simplemente funciona".',
    lottieSrc: 'https://lottie.host/embed/l2m3n4o5-p6q7-8r9s-0t1u-v2w3x4y5z6a7/b.json',
    lottieDescription: 'Herramientas futuristas ensamblándose en motor giratorio'
  },
  {
    id: 'web3-services',
    category: 'developer',
    title: 'Servicios Web3',
    subtitle: 'Human_Cloud / RPC & Indexing Services',
    shortDesc: 'Latencia sub-100ms, 99.99% uptime',
    deepDive: [
      'Red de nodos propia distribuida globalmente (Edge Computing). Usar un RPC público es un suicidio técnico.',
      'Capa de Indexación Personalizada mediante subgrafos optimizados: consultas GraphQL con latencia < 100ms.',
      'Arquitectura de auto-escalado: tu dApp nunca se queda congelada, incluso durante liquidaciones masivas.',
      'Microservicios con SLA del 99.99%.'
    ],
    humanEdge: 'La descentralización total suele ser lenta. Resolvemos esto con infraestructura híbrida: seguridad on-chain, velocidad off-chain. No sacrificamos UX en el altar de la pureza teórica.',
    lottieSrc: 'https://lottie.host/embed/m3n4o5p6-q7r8-9s0t-1u2v-w3x4y5z6a7b8/c.json',
    lottieDescription: 'Mapa mundi con nodos pulsando y datos viajando a alta velocidad'
  },

  // ACERCA DE
  {
    id: 'seguridad',
    category: 'about',
    title: 'Seguridad',
    subtitle: 'Protocolo: Continuous Defense & Formal Verification',
    shortDesc: 'Verificación formal, no suerte',
    deepDive: [
      'La seguridad no es una auditoría anual en PDF. Implementamos Seguridad Continua (SecOps) con Verificación Formal: probamos matemáticamente que el código se comporta según la especificación.',
      'Property-Based Testing: miles de escenarios aleatorios para romper las invariantes.',
      'Time-locks & Multisig: cambios críticos requieren 48h de espera y quórum de validadores.',
      'Bug Bounty de $1M USD activo. Auditado por Trail of Bits.',
      'Circuit breakers: si un componente tiene riesgo, se aísla hasta que sea 100% seguro.'
    ],
    humanEdge: 'Tratamos cada línea de código como un sistema de soporte vital. Priorizamos Resiliencia de Estado sobre Time-to-Market. No "arreglamos en producción".',
    lottieSrc: 'https://lottie.host/embed/n4o5p6q7-r8s9-0t1u-2v3w-x4y5z6a7b8c9/d.json',
    lottieDescription: 'Domo geodésico absorbiendo amenazas y emitiendo ondas de protección'
  },
  {
    id: 'soporte',
    category: 'about',
    title: 'Soporte',
    subtitle: 'Servicio: Human-to-Human Concierge',
    shortDesc: 'Porque en momentos críticos, un bot es un insulto',
    deepDive: [
      'Hemos eliminado los laberintos de FAQs y bots automáticos. Nuestro soporte está compuesto por ingenieros de nivel 2 y 3 que entienden blockchain.',
      'Si tienes un problema, hablas con alguien que sabe leer el explorador de bloques.',
      'Herramientas de trazabilidad on-chain integradas: respuestas precisas en minutos, no días.',
      'Soporte 24/7 con humanos reales.'
    ],
    humanEdge: 'La mayoría de exchanges son "fantasmas": no hay nadie a quien reclamar. Somos #1 porque estamos aquí. La transparencia total significa responsabilidad. Preferimos gastar en un equipo humano de élite que en anuncios en estadios.',
    lottieSrc: 'https://lottie.host/embed/o5p6q7r8-s9t0-1u2v-3w4x-y5z6a7b8c9d0/e.json',
    lottieDescription: 'Corazón orgánico latiendo, construido de código y circuitos dorados'
  },
  {
    id: 'carreras',
    category: 'about',
    title: 'Carreras',
    subtitle: 'Misión: Open-Source Financial Revolution',
    shortDesc: 'No buscamos empleados, buscamos fundadores',
    deepDive: [
      'Trabajar en Human Defi significa enfrentarse a los problemas más difíciles de la computación distribuida y la teoría de juegos.',
      'Buscamos mentes que dominen Rust, Solidity y sistemas de baja latencia, pero que también tengan empatía para diseñar productos que su familia pueda usar.',
      'Cultura Remote-First y Meritocrática. No nos importan tus títulos, nos importa tu commit history.',
      'Creemos en la soberanía individual, tanto financiera como profesional.'
    ],
    humanEdge: 'Construimos infraestructura generacional. Si quieres trabajar en problemas que importan, con un equipo que valora la excelencia técnica y la honestidad radical, este es tu lugar.',
    lottieSrc: 'https://lottie.host/embed/p6q7r8s9-t0u1-2v3w-4x5y-z6a7b8c9d0e1/f.json',
    lottieDescription: 'Hélice de ADN donde cada peldaño es código, girando infinitamente'
  },
  {
    id: 'blog',
    category: 'about',
    title: 'Blog',
    subtitle: 'Insights Técnicos & Transparencia',
    shortDesc: 'Actualizaciones del protocolo, post-mortems, research',
    deepDive: [
      'Publicamos análisis técnicos profundos sobre decisiones de arquitectura.',
      'Post-mortems transparentes cuando algo falla: qué pasó, por qué, y cómo lo arreglamos.',
      'Research papers sobre optimizaciones de gas, teoría de juegos en DeFi, y seguridad.',
      'Sin marketing fluff, solo ingeniería honesta.'
    ],
    humanEdge: 'La transparencia radical es nuestra marca. Compartimos nuestros aprendizajes, incluso los errores, porque creemos que la industria mejora cuando todos aprendemos juntos.',
    lottieSrc: 'https://lottie.host/embed/q7r8s9t0-u1v2-3w4x-5y6z-a7b8c9d0e1f2/g.json',
    lottieDescription: 'Páginas de blog transformándose en bloques de conocimiento'
  },
  {
    id: 'contacto',
    category: 'about',
    title: 'Contacto',
    subtitle: 'Comunicación Directa',
    shortDesc: 'Sin formularios infinitos, solo transparencia',
    deepDive: [
      'No ocultamos nuestra dirección tras formularios. Creemos en la comunicación abierta con la comunidad, desarrolladores e inversores.',
      'Canales directos: Discord para developers, Twitter para updates, Email para partnerships.',
      'Respuesta promedio: < 24 horas para consultas técnicas.',
      'Open-door policy para builders que quieren integrar con Human Defi.'
    ],
    humanEdge: 'Somos accesibles porque creemos en construir con la comunidad, no para la comunidad. Tu feedback mejora el protocolo.',
    lottieSrc: 'https://lottie.host/embed/r8s9t0u1-v2w3-4x5y-6z7a-b8c9d0e1f2g3/h.json',
    lottieDescription: 'Red de comunicación conectando nodos globales'
  }
];
