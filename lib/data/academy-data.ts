export interface AcademyArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    readTime: number;
}

export interface AcademyModule {
    id: string;
    title: string;
    description: string;
    articles: AcademyArticle[];
}

export const ACADEMY_MODULES: AcademyModule[] = [
    {
        id: "blockchain-base-layer",
        title: "Blockchain Base-Layer Architecture",
        description: "Análisis profundo de la infraestructura de consenso, finalidad algorítmica y la trilema de escalabilidad. Este módulo desgrana los cimientos sobre los que operan las cadenas de Capa 1. Al acceder a este manifiesto, el creador adjuntará un PDF técnico estructurado matricialmente, implementando diagramas de estado de nodos validadores, métricas de propagación de bloques en milisegundos y un estudio comparativo exhaustivo entre BFT (Byzantine Fault Tolerance) y el Consenso Nakamoto.",
        articles: [
            {
                id: "base-layer-1",
                title: "Infraestructura de Consenso y L1",
                description: "Estudio arquitectónico del ecosistema nativo.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 45
            }
        ]
    },
    {
        id: "cryptographic-verification",
        title: "Cryptographic Verification Systems",
        description: "Adéntrese en la matemática oculta que blinda la red principal. Desde curvas elípticas (secp256k1) hasta las complejas pruebas de conocimiento cero (ZK-SNARKs/STARKs). El material en PDF provisto por el autor no es una lectura ligera o recreativa; se le entregará un compendio criptográfico puro que aborda la implementación de compromisos polinómicos y raíces de Merkle. El documento incluirá pseudocódigo de circuitos aritméticos para sistemas ZK, formulando de manera irrefutable la teoría de la prueba en entornos trustless.",
        articles: [
            {
                id: "crypto-sys-1",
                title: "De secp256k1 a ZK-Rollups",
                description: "Matemática discreta aplicada a Web3.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 60
            }
        ]
    },
    {
        id: "defi-risk",
        title: "DeFi Protocol Risk Management",
        description: "La supervivencia dentro de las finanzas descentralizadas requiere un control de riesgos frío e inquebrantable. Aquí evaluaremos heurísticas de ataque, espirales de liquidación masiva y ataques coordinados de oráculos (Flash Loans). Con esta descarga, recibirá el 'Risk Handbook' del creador, un PDF táctico, tabulado y orientado a la acción militar. Este manual implementará modelos de estrés de liquidez (stress-testing), matrices de correlación de deuda colateralizada (CDP) y defensas algorítmicas directamente extraídas de firmas institucionales.",
        articles: [
            {
                id: "defi-risk-1",
                title: "Vectores de Ataque y Mitigación Estructural",
                description: "Sobreviviendo en oscilaciones extremas de liquidez.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 55
            }
        ]
    },
    {
        id: "institutional-custody",
        title: "Institutional Custody & Security",
        description: "Estableciendo el estándar de titanio puro para la bóveda digital definitiva. La custodia a macro-escala exige esquemas multifirma distribuidos (MPC), entornos de ejecución altamente confiables (TEE) y políticas de gobernanza ciegas. El creador implementará en el PDF consecuente un blueprint arquitectónico de seguridad impenetrable. El archivo proporcionará configuraciones de Hardware Security Modules (HSM) paso a paso, flujos de autorización mediante sharding (fragmentación) de llaves criptográficas y auditorías de red.",
        articles: [
            {
                id: "custody-1",
                title: "Blueprint de Bóvedas de Grado Bancario",
                description: "La estructura de defensa de miles de millones.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 40
            }
        ]
    },
    {
        id: "layer2-economics",
        title: "Layer 2 Economics & Scalability",
        description: "Descubra que el futuro de la hiper-eficiencia se esconde en canales de estado y rollups. Se examinará la oscura captura de valor (MEV) extraída por secuenciadores y la brutal optimización de costes vía EIP-4844. En el reporte final en PDF, el desarrollador consolidará un dictamen tecno-económico. Dicho informe trazará gráficas del coste de gas marginal sobre L2 en contraposición al ecosistema Mainnet, desglosando la rentabilidad operativa de puentes (Bridges) y analizando el sangrado de la liquidez fragmentada.",
        articles: [
            {
                id: "l2-econ-1",
                title: "Secuenciadores, MEV y EIP-4844",
                description: "Economía a escala y reducción dramática de base fees.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 50
            }
        ]
    },
    {
        id: "market-microstructure",
        title: "Market Microstructure & Order Flow",
        description: "Las minucias microscópicas del flujo de transacciones predicen la acción del precio minutos antes de que el mercado despierte. Nos sumergiremos en operaciones de front-running del mempool, lotes oscuros institucionales y latencia fraccional. Al acceder a los registros, desbloqueará un dossier en formato PDF cargado con espectrogramas de profundidad reales. El creador proveerá en sus páginas modelos estocásticos de deslizamiento (slippage) dinámico y trazabilidad de spoofing. Un documento de combate crudo para cuants.",
        articles: [
            {
                id: "microstructure-1",
                title: "Mempool Sniping y Dark Pools",
                description: "El campo de batalla invisible antes del bloque.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 65
            }
        ]
    },
    {
        id: "quant-finance",
        title: "Quantitative Financial Analysis",
        description: "Transformando el ruido caótico estocástico en señales financieras implacablemente deterministas. Exploraremos derivaciones del modelo de Black-Scholes integradas en opciones on-chain, cálculo de ratios de Sharpe ponderados por riesgo smart-contract, y farming delta-neutral. El PDF final entregado será una cumbre de la ingeniería cripto-financiera. El autor dispondrá de algoritmos nativos (con scripts exportados en Python), balances vectoriales en tiempo real y simulaciones retrospectivas (backtesting) para mercados bajistas.",
        articles: [
            {
                id: "quant-1",
                title: "Ingeniería de Opciones y Delta-Neutralidad",
                description: "Matemáticas financieras aplicadas en la máquina virtual.",
                content: "Contenido reservado para el manuscrito en PDF.",
                readTime: 75
            }
        ]
    }
];
