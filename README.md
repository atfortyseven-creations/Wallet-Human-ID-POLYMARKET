# Whale Network: Official Platform Documentation & Aztec Integration Manual

**Whale Network** representa el pináculo de la ingeniería criptográfica aplicada a la soberanía de los datos, configurándose como un ecosistema terminal avanzado para la gestión integral de activos digitales e identidades de conocimiento cero (Zero-Knowledge). Diseñada con una rigurosidad implacable para satisfacer las exigencias de operaciones institucionales de alto calibre y usuarios retail de élite, la plataforma amalgama sincronización de estados a través de múltiples dispositivos, generación de pruebas criptográficas de conocimiento cero en el lado del cliente (client-side proving) y telemetría de red omnicanal en una arquitectura singular y unificada.

Este documento constituye el manual operativo maestro y el manifiesto arquitectónico de la plataforma. Ha sido redactado y estructurado con el máximo rigor técnico para proporcionar una transparencia absoluta y granular a los consorcios de auditores independientes, socios institucionales de grado corporativo, y, de manera preeminente, al **equipo de ingeniería central de Aztec Network**. En este manifiesto se disgrega, a nivel atómico, cómo Whale Network orquesta entornos de ejecución privada, cómo implementa primitivas ZK sin fricción, y cómo despliega su constelación de doce módulos terminales sobre una infraestructura subyacente que no admite concesiones en materia de privacidad o integridad.

---

## 1. La Arquitectura Dual de Dominio Unificado: Symbiosis PC/Móvil

Whale Network no depende de aplicaciones fragmentadas. Opera bajo un paradigma de **Arquitectura Dual de Dominio Unificado**, lo que significa que el mismo ecosistema web (`app.humanidfi.com`) muta y reestructura sus capas de ejecución y compilación dinámicamente, adaptándose a la topología criptográfica del dispositivo desde el que se accede. El sistema permite un enlazamiento de sesiones simbiótico entre ambos entornos, garantizando una continuidad de estado sin el más mínimo compromiso de seguridad.

### 1.1 PC Zone: Infraestructura Extension Wagmi
Para los usuarios que acceden desde entornos de escritorio, la plataforma instaura un canal de alta computación acoplándose directamente al ecosistema **Wagmi** y a billeteras de extensión estandarizadas (ej. MetaMask, Rabby, Frame).
- **Ejecución Directa y Síncrona**: Las firmas de transacciones, la lectura del estado on-chain y la interacción directa con contratos inteligentes en capas EVM se gestionan mediante inyección de proveedores Web3.
- **Client-Side Prover (Motor WASM Noir)**: Al detectar el entorno de escritorio, Whale Network descarga y compila el entorno de ejecución de Barretenberg en WebAssembly (WASM). Esto permite que el navegador del usuario aproveche la potencia multinúcleo del procesador local para generar las complejas pruebas de conocimiento cero requeridas por los circuitos de Noir. La información privada nunca sale del bus de memoria local; únicamente el "proof" criptográfico resultante y los inputs públicos se envían al secuenciador de Aztec.

### 1.2 Mobile Zone: Arquitectura Handshake Enclave
Los navegadores móviles carecen de soporte confiable para inyección Web3 o de la capacidad computacional ininterrumpida para provers ZK pesados. Para subsanar esta brecha, Whale Network ha diseñado la **Arquitectura Handshake**.
- **Sincronización de Dispositivos Fuera de Banda (X25519 ECDH)**: El terminal de escritorio (o un nodo seguro) genera una clave pública efímera sobre la curva elíptica Curve25519. El dispositivo móvil del usuario escanea este vector (vía código QR o enlace profundo) y ejecuta un protocolo Diffie-Hellman (ECDH) para establecer un secreto compartido perfecto y efímero.
- **Enrutamiento de Enclave y Delegación Criptográfica**: El dispositivo móvil actúa entonces como un visor pasivo y un enclave seguro de autorización. Cuando el usuario desea interactuar con un contrato inteligente o certificar un estado en Aztec desde la calle, la interfaz móvil enruta asíncronamente la petición cifrada a través de túneles WebSocket seguros hacia la sesión de PC enlazada, la cual ejecuta el cálculo intensivo y firma la transacción, retornando la confirmación atestiguada al dispositivo móvil en milisegundos.
- **Continuidad de Sesión Omnipresente**: El usuario experimenta una fusión absoluta de sus entornos. Puede auditar su portafolio, descifrar mensajes de la red de comunicaciones y observar el estado global del mercado desde el móvil, mientras que las operaciones críticas (gestión de llaves de gasto de Aztec, compilación Noir) permanecen atrincheradas en la capa Wagmi de escritorio.

---

## 2. El Ecosistema Terminal: Arquitectura de Pestañas (Tab Architecture)

La interfaz central está seccionada en doce módulos dedicados. Esta división no es meramente visual; cada pestaña responde a una sub-arquitectura técnica independiente, optimizada para procesos criptográficos, financieros y telemétricos de distinta índole. A continuación se desglosa la ingeniería detrás de cada vertical.

### 1. Dashboard (Centro de Comando Global)
El núcleo neurálgico de la experiencia de usuario. Su funcionamiento no se basa en simples peticiones RPC, sino en un motor de indexación paralelo.
- **Confluencia de Estados L1/L2/L3**: El Dashboard evalúa simultáneamente el balance global del usuario consolidando la liquidez visible en cadenas públicas EVM (Ethereum, Base, Arbitrum) y la liquidez oscurecida dentro del estado privado de Aztec.
- **Motor de Historial Híbrido**: Monitorea de manera asíncrona la recepción de transferencias en cadena mediante subgraphs, y al mismo tiempo descifra pasivamente las notas entrantes (Incoming Notes) en la red Aztec utilizando la Viewing Key local del usuario, ensamblando un libro mayor (ledger) unificado en la memoria del cliente.

### 2. Studio (Procedencia y Anclaje Estructural)
El módulo Studio es una cámara blanca de registro de activos digitales e identidades.
- **Anclaje Zero-Knowledge Aztec**: Utilizando el poder de la criptografía de Aztec, el Studio permite a los creadores e instituciones generar un "Proof of Origin" (Prueba de Procedencia) para cualquier set de datos o activo físico/digital. La red certifica irrevocablemente que un usuario posee y ha registrado una metadata en un tiempo T, sin revelar públicamente el contenido de esa metadata ni la identidad del registrante.
- **Compilación Noir en Tiempo Real**: Todo registro invoca un circuito Noir que garantiza la integridad del hash de los datos subyacentes frente a la firma del emisor original.

### 3. Markets (Orquestación de Analítica Profunda)
Aunque la plataforma es estrictamente ajena a mecánicas de ejecución de intercambios (trading), proporciona inteligencia macroeconómica para el análisis de flujos institucionales.
- **Oráculos de Analítica Cuantitativa**: A través de la integración con fuentes de datos deterministas (como Chainlink y oráculos de red personalizados), se indexan métricas avanzadas (capitalización bursátil, volúmenes de 24 horas, liquidez en Automated Market Makers).
- **Procesamiento de Grafos**: Internamente, la arquitectura extrae el flujo de datos on-chain y lo procesa mediante bases de datos orientadas a grafos para discernir correlaciones macro entre activos sin invadir la privacidad individual.

### 4. Roadmap (Cartografía de Protocolo)
Una visualización inmersiva e interactiva que traza la evolución técnica del ecosistema.
- **Rastreo de Estado del Backend**: No es un componente estático; el Roadmap está enlazado a la telemetría de los repositorios de GitHub y a las fases de auditoría de los contratos inteligentes. Refleja dinámicamente las integraciones de bases de datos, los avances en la optimización de los circuitos Noir y el despliegue de microservicios de infraestructura.

### 5. Identity (Pasaporte Criptográfico Soberano)
El núcleo existencial del proyecto y la razón de ser de la integración con Aztec.
- **Credenciales Verificables ZK**: La pestaña de Identidad permite al usuario atestar criterios complejos (por ejemplo, "Soy un usuario verificado y pertenezco a la jurisdicción X", o "He completado el proceso de acreditación de inversores") mediante un circuito Noir. 
- **Verificación sin Exposición**: El prover local genera una prueba matemática de validez. El contrato inteligente en L1/L2 acepta esta prueba y concede los permisos pertinentes, asegurando que la dirección pública, el saldo, y los datos personales del usuario jamás queden ligados on-chain.

### 6. TOKEN (Módulo de Soberanía Económica)
La capa de gobernanza y utilidad del token nativo del sistema.
- **Verificación de Contratos de Suscripción (Tiers)**: Utiliza llamadas estáticas al contrato inteligente (Static Calls) para confirmar la tenencia (holding) de tokens. La validación de estas tenencias desbloquea dinámicamente en el cliente interfaces avanzadas, aumentos de cuotas API y autorizaciones criptográficas expandidas, todo ello mediante un middleware de enrutamiento estricto.

### 7. MAP (Telemetría Geoespacial de Nodos)
Una interfaz de supervisión de red avanzada e inmersiva.
- **Renderizado WebGL de Red**: Utilizando WebGL y aceleración por GPU, el MAP dibuja la distribución geoespacial de la red en tiempo real. Se alimenta de WebSockets de baja latencia que informan sobre el estado activo de los secuenciadores de Aztec, los validadores de L1 y los clústeres de almacenamiento descentralizado IPFS/Arweave.

### 8. Chat (Capa de Comunicación Cifrada P2P)
Un canal de mensajería asíncrono y completamente privado entre iguales.
- **Integración XMTP Protocol**: Reemplazando los servidores de mensajería centralizados, esta pestaña se asienta sobre XMTP, garantizando cifrado de extremo a extremo (E2EE). Los mensajes sólo pueden ser descifrados utilizando la clave privada de la billetera destino. Se asegura la inmutabilidad y confidencialidad absoluta del flujo conversacional, imposibilitando cualquier minería de datos por parte de la plataforma.

### 9. Portfolio (Desglose Analítico Patrimonial)
Un microscopio financiero sobre el estado criptográfico del usuario.
- **Reconstrucción del Árbol de Estado**: Mediante la agregación de subgraphs dedicados y el escaneo iterativo del árbol de estado privado del usuario (PXE tree), el Portfolio renderiza gráficas avanzadas de distribución de riqueza, rendimiento histórico de activos y balances de exposición a protocolos DeFi externos.

### 10. Community (Centro de Gobernanza Participativa)
El ágora digital para la toma de decisiones descentralizada.
- **Consenso On-Chain**: Implementa módulos de votación Snapshot o integraciones directas con contratos de gobernanza DAO. Permite a los usuarios atestiguar y someter propuestas criptográficamente firmadas sobre actualizaciones arquitectónicas, parámetros del protocolo y directrices de auditoría.

### 11. STATUS (Monitor de Salud Holístico)
El panel de mandos para auditoría de infraestructura en tiempo real.
- **Microservicios de Latencia**: Un cluster de servicios centinelas (watchdogs) en el backend realiza un ping continuo a los nodos RPC, los enrutadores de pago (Paymasters) y la infraestructura de Aztec Provers. Las métricas de tiempo de actividad (uptime) y los cuellos de botella de red se reflejan aquí sin censura, asegurando una visibilidad operativa de grado atómico.

### 12. PRIVACY (Consola de Higiene Criptográfica)
La salvaguarda final del control del usuario sobre su propio hardware.
- **Auditoría IndexedDB Estricta**: Este módulo desglosa exactamente qué llaves efímeras, cachés de estado ZK y logs de sesión residen en la base de datos local del navegador (IndexedDB / LocalStorage). 
- **Purga Atómica**: Ofrece rutinas de borrado criptográficamente seguro (Zero-Fill) para purgar cualquier rastro local tras concluir una sesión en terminales compartidos, garantizando que el entorno local vuelva a un estado estéril e inmaculado.

---

## 3. Topología de la Documentación

La estructura de conocimiento y directrices operativas de Whale Network ha sido meticulosamente segmentada. Cada sección de nuestra documentación está diseñada para servir a un perfil institucional distinto, desde ingenieros de core-protocol hasta oficiales de cumplimiento normativo, garantizando así un estándar de claridad propio de un entorno de misión crítica.

### PRODUCT (Especificaciones Funcionales)
- **Architecture**: Un despliegue monumental del diagrama de clases, topología de red y flujos de datos. Documenta cómo el Next.js 15 App Router se entrelaza con el ORM Prisma, el motor de seguridad WhaleFortress (middleware edge) y la infraestructura Web3, manteniendo una separación quirúrgica entre la indexación pública y la prueba privada del cliente.
- **Registry**: El censo inmutable de direcciones de contratos inteligentes. Detalla los contratos núcleo, proxies y protocolos soportados, asegurando que el cliente interactúe exclusivamente con vectores autenticados.
- **Whitepaper**: El tomo académico y fundacional. Disgrega las fórmulas matemáticas, los modelos de incentivos económicos y las primitivas ZK-SNARK que actúan como cimientos del ecosistema Whale Network.

### DEVELOPERS (Kits de Integración y Código)
- **API Docs**: La biblia de integración para servicios de terceros. Documenta las estructuras JSON, códigos de error HTTP estandarizados, límites de tasa (rate-limits), firmas HMAC y flujos WebSocket para la extracción telemétrica.
- **ZK Sandbox**: Un entorno local en memoria inyectado en el navegador. Provee a la comunidad un IDE preconfigurado para escribir, simular y compilar circuitos Noir (Aztec DSL), permitiendo validar transiciones de estado complejas sin riesgo de colisión con la mainnet.
- **Architecture (Código)**: Documentación paralela incrustada directamente junto al árbol de repositorios (TypeScript docs, JSDoc), detallando patrones de diseño (Singletons, Factories) y máquinas de estado finito empleadas.
- **GitHub**: El punto de origen de la verdad. Acceso completo a los repositorios de código abierto frontend, módulos de infraestructura y contratos de gobernanza, invitando al escrutinio paritario (peer-review) incesante por parte de la comunidad criptográfica global.

### COMPANY (Directrices Maestras)
- **Vision**: El norte magnético del proyecto. Un documento estratégico que proyecta a cinco años la expansión de Whale Network, detallando las hojas de ruta institucionales, colaboraciones B2B planificadas y la inevitable convergencia total hacia capas de privacidad absoluta impulsadas por Aztec Network.

### REGULATORY (Marco Legal y Cumplimiento)
- **Compliance Docs**: Archivos legales robustos que certifican nuestra alineación con los marcos regulatorios internacionales aplicables. Se delinean aquí las arquitecturas de prevención de blanqueo de capitales (AML) integradas bajo esquemas ZK que cumplen con normativas institucionales sin comprometer el anonimato on-chain del usuario.
- **Aztec Transparency**: Una carta de honestidad tecnológica. Este documento desgrana matemáticamente las verdaderas garantías (y las fronteras técnicas) del cifrado de Aztec, explicando con precisión qué metadatos quedan ocultos y qué huellas inevitables existen, erradicando falsas promesas de anonimato mágico.
- **Terms & Conditions**: Las cláusulas herméticas que rigen el ecosistema, delimitando la exoneración de responsabilidades sobre software descentralizado, obligaciones de custodia de claves del usuario y las normativas de uso aceptable del terminal.
- **Privacy Policy**: Nuestro manifiesto de santidad de datos. Estipula legalmente que Humanity Ledger S.L. carece de la capacidad técnica para descifrar el estado del usuario, detallando exhaustivamente que las operaciones de cifrado, atestiguamiento y almacenamiento de secretos operan puramente en un contexto "Zero-Knowledge" local (en el navegador o dispositivo móvil del cliente).

---
**© 2026 Humanity Ledger S.L. · Todos los derechos reservados.**  
*Terminal de Identidad y Analítica de Rango Institucional.*  
**Aztec Native Architecture** · Certificación de Cumplimiento MiCA y W3C.  
[Documentación Legal e Institucional Oficial]
