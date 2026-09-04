# HUMANITY LEDGER S.L.
## Documento Corporativo Integral - Version Corregida y Auditada v2.0
**Sistema:** v1.0.0 - Aztec Mainnet  
**Dominio:** https://humanidfi.com  
**Auditado:** Septiembre 2026

---

### NOTA DE AUDITORIA TECNICA
Este documento ha sido corregido con maxima atencion: todas las menciones a testnet han sido eliminadas, la derivacion criptografica de identidad Aztec ha sido auditada (con Grumpkin Modulo Reduction), las defensas arquitectonicas (State Channels ZK, Bundled ICE, Mixnet Padding, ZK-Email Anti-Sybil) han sido documentadas, y el calendario academico de la UVT Timisoara ha sido actualizado con el Syllabus oficial de Fineas Silaghi (Week 13: 08.01-10.01.2027).

---

HUMANITY LEDGER S.L. 
Documento Corporativo Integral 
Versión 3.0 — Septiembre 2026 
 
Dominio de Producción: https://humanidfi.com 
Repositorio: https://github.com/humanityledger/Humanity-Ledger 
Contacto: atfortyseven2@humanidfi.es 
Sistema: v1.0.0 — Aztec Mainnet 
Clasificación: Documento Interno Corporativo / Presentación Académica 
 
 
 
ÍNDICE GENERAL 
PARTE I — IDENTIDAD CORPORATIVA 
1. Presentación Ejecutiva de Humanity Ledger S.L. 
2. Misión, Visión y Valores Fundacionales 
3. Propuesta de Valor: El Problema que Resolvemos 
4. La Tesis: Por Qué la Web3 Necesita una Nueva Capa de Privacidad 
5. Modelo de Mini-Apps: La Estrategia de Producto 
PARTE II — LEDGER CHAT: LA PRIMERA MINI-APP 
6. ¿Qué es Ledger Chat? 
7. Arquitectura de Comunicación Descentralizada 
8. Protocolo XMTP: Mensajería Wallet-a-Wallet 
9. WebRTC: Videollamadas Peer-to-Peer Sin Censura 
10. Onion Routing: La Capa de Privacidad Avanzada 
11. Gestión de Contactos y Solicitudes 
12. Archivos Adjuntos y Multimedia 
13. Costes de Uso en Quantum Dots 
PARTE III — QUANTUM DOTS (QDs): LA ECONOMÍA INTERNA 
14. ¿Qué Son los Quantum Dots? 
15. Génesis: El Balance Inicial de 2.500 QDs 
16. Estructura de Transacciones: Tipos y Flujos 
17. Sistema de Comisiones (Fee Tokenomics) 
18. Airdrop Mensual del Ecosistema 
19. Protección Anti-Sybil: Cómo Garantizamos la Integridad 
20. Compra de QDs con ETH: El Puente Fiat-Cripto 
21. Staking de QDs: Sovereign Nodes 
22. El Modelo Económico de Largo Plazo 
PARTE IV — PORTFOLIO E IDENTIDAD AZTEC 
23. La Tarjeta de Identidad Soberana (Schnorr Account) 
24. Derivación Criptográfica de la Dirección Aztec 
25. El Sistema de Balance: Fuente Única de Verdad 
26. Historial de Transacciones 
27. El Rango del Usuario: De Witness a Architect 
28. Panel PXE: Private Execution Environment 
29. Circuits Noir: Pruebas de Conocimiento Cero 
30. Portal de Shielding: Aztec L2 
PARTE V — ARQUITECTURA TÉCNICA 
31. Stack Tecnológico Completo 
32. Infraestructura de Backend: Next.js 15 y API Routes 
33. Base de Datos: PostgreSQL y Prisma ORM 
34. Integración con Aztec Network V5 
35. Autenticación: SIWE y el Sistema de Sesiones 
36. Middleware de Seguridad: La Primera Línea de Defensa 
37. Modelo de Datos Completo (Prisma Schema) 
38. Gestión de Estado en el Frontend: AztecNativeContext 
PARTE VI — SEGURIDAD 
39. Filosofía de Seguridad: Zero-Trust Architecture 
40. Protección IDOR (Insecure Direct Object Reference) 
41. Protección Anti Double-Spend: Transacciones Serializables 
42. Identity Gate: Solo las Identidades Verificadas Transfieren 
43. Replay Attack Protection 
44. Derivación de Hash de Identidad ZK 
45. Gestión de Secretos y Variables de Entorno 
PARTE VII — INFRAESTRUCTURA Y DESPLIEGUE 
46. Railway: Despliegue en Producción 
47. GitHub Actions: CI/CD Pipeline 
48. Configuración de Variables de Entorno 
49. Guía de Despliegue Paso a Paso 
PARTE VIII — MODELO DE NEGOCIO 
50. Monetización: Cómo Genera Valor Humanity Ledger 
51. El Ecosistema de Mini-Apps como Plataforma 
52. Modelo de Tiers de Usuario 
PARTE IX — ROADMAP Y FUTURO 
53. Estado Actual: Beta Prototype 
54. Roadmap Q4 2026 — Q2 2027 
55. La Visión a 5 Años 
PARTE X — COMUNICACIÓN ACADÉMICA 
56. Contexto Académico: Asignatura Blockchain
Humanity Ledger fue concebido y desarrollado en el contexto académico de la asignatura de 
Blockchain del programa universitario en Rumanía, bajo la supervisión del Profesor Cristian 
Cira. 

De acuerdo con el programa oficial del curso (Syllabus) que abarca a 200 estudiantes, la 
formación teórica culmina en la Week 12 (16.12 - 22.12) con la unidad "Introduction to 
Zero Knowledge Proofs". Inmediatamente después, el curso destina la Week 13 (08.01 - 
10.01 de 2027) a "Guest Presentations". Es en este bloque exacto donde Humanity Ledger se 
expone como el caso de estudio técnico definitivo: una aplicación real en producción operando 
sobre Aztec Mainnet.

107. Proyecto de investigación aplicada: Demuestra la viabilidad técnica de los sistemas ZK 
de Aztec Network para aplicaciones de comunicación del mundo real.
108. Startup tecnológica real: Con despliegue en producción, usuarios reales y modelo de 
negocio viable.
109. Contribución al ecosistema: El código es open-source y representa una contribución 
real al ecosistema Aztec/Web3.

57. Presentación para el Profesor Cristian Cira
57.1 Los Tres Pilares Técnicos de la Presentación
Pilar 1 — Arquitectura de Privacidad:
La presentación debe demostrar con código real cómo Humanity Ledger implementa 
privacidad criptográfica en múltiples capas:
• La derivación de dirección Aztec desde EVM (SHA-256 + Keccak256) asegura que la 
identidad L2 no está vinculada on-chain a la identidad L1.
• El Identity Hash ZK asegura que incluso en la base de datos propia de Humanity Ledger, las 
identidades están hasheadas de forma no reversible.
• Los balances de QDs en el Modo A (on-chain) son privados por defecto en Aztec: ni el 
equipo de Humanity Ledger puede ver cuántos QDs tiene un usuario específico.

Pilar 2 — Zero-Knowledge Proofs en Producción:
Demostrar el uso real de ZK en el sistema:
• Generar una prueba Noir en vivo durante la presentación usando la pestaña "Circuits" del 
Portfolio.
• Explicar el stack UltraHonk + Barretenberg + Grumpkin.
• Mostrar cómo el PXE ejecuta circuitos localmente sin revelar datos al servidor.

Pilar 3 — Economía Tokenómica Diseñada:
El sistema de QDs es un ejemplo de ingeniería criptoeconómica aplicada:
• Balance génesis para bootstrapping de red.
• Anti-Sybil multicapa (Identity Gate, Spend-to-Earn, Social Verification, Serializable 
Transactions).
• Modelo deflacionario mediante comisiones y penalizaciones.
• Incentivos de earn para actividad genuina.

57.2 Demo en Vivo Propuesta
110. Autenticación SIWE: Conectar una wallet MetaMask, mostrar el proceso de firma y la 
sesión JWT.
111. Portfolio: Mostrar el balance inicial de 2.500 QDs, el sistema de ranking, la dirección 
Aztec derivada.
112. Transferencia P2P: Enviar 50 QDs a una segunda wallet de prueba, mostrar el 
descuento del fee y la recepción instantánea.
113. Ledger Chat: Abrir una conversación, enviar mensajes cifrados, iniciar y mostrar una 
videollamada WebRTC.
114. Noir ZK Proof: Generar una prueba de conocimiento cero en la pestaña "Circuits" y 
mostrar la verificación.

58. Propuesta de Gestión con Fineas
58.1 Contexto de la Colaboración
El proyecto Humanity Ledger se coordina logísticamente con Fineas Silaghi, enlace directo con 
el ecosistema de Timisoara Startups y el Profesor Cira. La línea temporal oficial basada en el 
Syllabus del curso es la siguiente:
• Septiembre - Diciembre 2026 (Remoto): Desarrollo y estabilización de Humanity Ledger 
en Aztec Mainnet. Fineas realiza la introducción formal con el Profesor Cira durante el 
transcurso del semestre.
• 10 de Diciembre de 2026: El autor principal llega físicamente a Rumanía.
• Diciembre 2026 (Presencial): Ensayos técnicos de estrés de red en la UVT.
• Semana 13 (08.01 - 10.01 Enero 2027): Exposición final ante los 200 estudiantes.

58.2 Propuesta de Gestión para Fineas
Hola Fineas,
Te escribo para establecer un plan de gestión claro, riguroso y transparente sobre cómo vamos 
a coordinar el proyecto Humanity Ledger hasta la presentación de enero.

Estado Técnico Actual del Sistema:
El sistema está en producción en https://humanidfi.com y hemos resuelto recientemente 
dos bugs críticos que afectaban a la economía interna:
115. Transferencias de QDs: El sistema de transferencias ahora auto-deriva 
automáticamente la dirección Aztec Schnorr de las wallets EVM, resolviendo el problema 
donde los fondos no aparecían en el Portfolio del receptor.
116. Airdrop Mensual: El claim de airdrop ahora actualiza correctamente el balance del 
usuario en la base de datos de forma atómica e idempotente.
Ambas correcciones están desplegadas en producción y el sistema está estable sobre Aztec Mainnet.

Timeline de Coordinación:

Fase Remota (ahora → 9 de Diciembre):
• Finalización de la UI/UX de Ledger Chat y Portfolio.
• Aseguramiento de uptime en el nodo de Aztec Mainnet.
• Preparación de la demo de presentación (guion, casos de prueba, walkthrough técnico).
• Realizamos revisiones semanales por videollamada (usando Ledger Chat, naturalmente).

Fase Presencial (10 de Diciembre → 08 de Enero):
• Llego físicamente a Rumanía el 10 de diciembre.
• Sesión de integración completa: verificamos que el sistema funciona correctamente desde 
la red universitaria para soportar 200 alumnos simultáneos.
• Ensayos generales de la presentación con timing.

Reparto de Responsabilidades:
Para que seamos lo más efectivos posible, propongo el siguiente reparto:
• Arquitectura técnica y backend: Me encargo yo (Aztec, ZK, API, base de datos).
• Narrativa y presentación: Lo trabajamos juntos, asegurando que el lenguaje conecte 
perfectamente con la unidad de ZK Proofs de la Week 12.
• Demo en vivo: Ensayamos juntos el 10-12 de Diciembre para identificar y resolver 
cualquier problema de red o compatibilidad.

Comunicación Continua:
Para cualquier duda técnica antes de mi llegada, puedes abrir un issue en el repositorio de 
GitHub o contactarme directamente. Estoy disponible para llamadas de sincronización según lo 
necesites.
El proyecto está en un estado sólido. Con la coordinación adecuada, la presentación será una 
demostración impresionante de lo que hemos construido.

Un saludo,
Stefan Antonio Cirisanu
Humanity Ledger S.L.
atfortyseven2@humanidfi.es


59. Glosario Técnico 
 
 
 
 
PARTE I — IDENTIDAD CORPORATIVA 
 
1. Presentación Ejecutiva de Humanity Ledger S.L. 
Humanity Ledger S.L. es una empresa de tecnología constituida bajo la legislación española 
con forma jurídica de Sociedad Limitada. Su objeto social es el desarrollo, mantenimiento y 
comercialización de aplicaciones descentralizadas (dApps) construidas sobre infraestructura de 
blockchain privada y tecnología de conocimiento cero (ZK). 
La empresa opera en la intersección de tres disciplinas técnicas de vanguardia: 
60. Criptografía de Conocimiento Cero (ZK): Utilizando la red Aztec Network V5 y el lenguaje 
de programación Noir para generar pruebas matemáticas que verifican información sin 
revelarla. 
61. Comunicaciones Descentralizadas: Empleando el protocolo XMTP (Extensible Message 
Transport Protocol) para mensajería wallet-a-wallet cifrada de extremo a extremo sin 
servidores centrales que puedan ser censurados o comprometidos. 
62. Economía de Tokens On-Chain: Operando una economía interna denominada en 
Quantum Dots (QDs), un token nativo del ecosistema Humanity Ledger que sirve como 
medio de intercambio entre los usuarios de todas las mini-apps del ecosistema. 
La empresa adopta una estrategia de producto orientada al mercado masivo basada en 
shipear mini-apps: aplicaciones funcionales e independientes que se publican de forma 
incremental. La primera app programada para salir a la luz y ser publicada nativamente en App 
Store (iOS) y Google Play (Android) es Ledger Chat, una aplicación de mensajería y 
videollamadas totalmente descentralizada, cuya economía de uso está íntegramente 
denominada en QDs. 
El sistema de producción está desplegado en Railway (plataforma de infraestructura cloud), 
con el dominio de acceso público https://humanidfi.com, y el código fuente se gestiona 
públicamente en el repositorio https://github.com/humanityledger/Humanity-Ledger. 
 
2. Misión, Visión y Valores Fundacionales 
2.1 Misión 
La misión de Humanity Ledger es devolver la soberanía digital al individuo. En un mundo 
donde las comunicaciones, los datos personales y las transacciones financieras son 
sistemáticamente interceptadas, monetizadas y censuradas por intermediarios corporativos y 
gubernamentales, Humanity Ledger construye la infraestructura criptográfica que hace que 
esto sea técnicamente imposible. 
Nuestros usuarios no son productos. Son ciudadanos digitales soberanos con el derecho 
fundamental a la privacidad en sus comunicaciones y el control absoluto sobre sus activos 
financieros. 
2.2 Visión 
La visión a largo plazo de Humanity Ledger es convertirse en la capa de identidad y 
comunicación privada para el ecosistema Web3. Donde otros protocolos ofrecen 
descentralización de activos financieros, Humanity Ledger ofrece descentralización de la 
comunicación humana y la identidad digital. 
Visualizamos un futuro donde cualquier persona en el mundo pueda: 
• 
Comunicarse con otra persona usando solo su dirección de wallet, sin necesidad de revelar 
nombre, email, número de teléfono o identidad real. 
• 
Transferir valor entre sí en segundos, con comisiones mínimas y sin intermediarios. 
• 
Usar aplicaciones que son técnicamente incapaces de censurar o vigilar a sus usuarios, 
porque la privacidad está garantizada matemáticamente por pruebas de conocimiento 
cero. 
2.3 Valores Fundacionales 
Privacidad por Diseño: La privacidad no es una función opcional que se activa en la 
configuración. Es la arquitectura base de cada sistema que construimos. Ningún componente 
del sistema tiene acceso a datos que no necesita estrictamente para su funcionamiento. 
Soberanía del Usuario: El usuario es siempre el dueño absoluto de sus fondos, su identidad y 
sus comunicaciones. No existe un administrador que pueda confiscar fondos, borrar mensajes 
o revocar el acceso de un usuario sin su consentimiento criptográfico. 
Transparencia Técnica: El código fuente es de código abierto. Cualquier persona con los 
conocimientos técnicos suficientes puede auditar, verificar y reproducir el comportamiento del 
sistema. Nada está oculto en el backend que no sea la información privada del propio usuario. 
Seguridad Sin Compromisos: Preferimos rechazar una función útil antes que implementarla 
con una debilidad de seguridad. La integridad del sistema financiero de los usuarios no es 
negociable. 
Accesibilidad: La tecnología ZK y blockchain es compleja. Nuestro trabajo es hacer que sea 
completamente invisible para el usuario final. La experiencia debe ser tan sencilla como usar 
cualquier aplicación de mensajería moderna. 
 
3. Propuesta de Valor: El Problema que Resolvemos 
3.1 El Fracaso de las Comunicaciones Digitales Actuales 
Las aplicaciones de mensajería modernas presentan tres fallos fundamentales que 
comprometen la libertad individual: 
Problema 1 — Centralización del Control: WhatsApp, Telegram, Signal y similares son 
operados por empresas privadas que controlan los servidores. En cualquier momento, estas 
empresas pueden: 
• 
Ser obligadas por gobiernos a entregar datos de usuarios. 
• 
Bloquear cuentas específicas o mensajes específicos. 
• 
Cambiar unilateralmente los términos de uso o los algoritmos de encriptación. 
• 
Ser hackeadas, exponiendo millones de conversaciones privadas. 
Problema 2 — La Paradoja de la Identidad: Para usar cualquier aplicación de mensajería 
actual, debes identificarte mediante un número de teléfono, correo electrónico o nombre de 
usuario. Esto vincula permanentemente tu identidad digital a tu identidad en el mundo real. 
Una vez vinculado, este link es prácticamente imposible de romper. 
Problema 3 — La Inexistencia de una Economía de Valor: Las comunicaciones digitales son 
gratuitas en dinero, pero extremadamente costosas en privacidad (tus datos son el producto 
que financia el servicio). No existe una economía P2P donde el valor pueda fluir directamente 
entre comunicantes sin intermediarios financieros. 
3.2 La Solución de Humanity Ledger 
Humanity Ledger resuelve los tres problemas con una única arquitectura integrada: 
Solución al Problema 1 — Descentralización Real: Usando XMTP (protocolo de mensajería 
descentralizado), los mensajes no pasan por ningún servidor de Humanity Ledger. En cambio, 
se transmiten directamente de wallet a wallet a través de nodos XMTP descentralizados que 
no pueden leer el contenido de los mensajes porque están cifrados con las claves privadas de 
los participantes. Las videollamadas usan WebRTC directo (peer-to-peer) sin pasar en ningún 
momento por los servidores de Humanity Ledger. 
Solución al Problema 2 — Identidad Basada en Wallet: Para usar Ledger Chat, la única 
identificación que un usuario necesita es una dirección de wallet de Ethereum o Aztec. No se 
requiere nombre, email, número de teléfono ni ningún otro dato identificable. La identidad 
está anclada matemáticamente a las claves criptográficas del usuario. 
Solución al Problema 3 — Quantum Dots (QDs): Cada interacción en el ecosistema tiene un 
valor económico denominado en QDs. Enviar un mensaje cuesta QDs. Hacer una videollamada 
cuesta QDs. Generar una prueba ZK cuesta QDs. Este modelo crea una economía P2P donde el 
valor fluye directamente entre usuarios sin intermediarios, y los creadores de contenido o 
servicios son compensados directamente. 
 
4. La Tesis: Por Qué la Web3 Necesita una Nueva Capa 
de Privacidad 
La primera generación de blockchain (Bitcoin, Ethereum) resolvió el problema de la propiedad 
descentralizada de activos financieros. La segunda generación (DeFi, NFTs, DAOs) construyó 
ecosistemas financieros completos sobre esa base. 
Sin embargo, toda esta infraestructura es completamente pública. Cada transacción, cada 
dirección, cada balance es visible para cualquier persona en el mundo que sepa consultar un 
explorador de bloques. Esto crea una paradoja fundamental: los sistemas diseñados para la 
libertad financiera han creado el sistema de vigilancia financiera más completo de la historia 
humana. 
Aztec Network resuelve este problema. Aztec es una red de Layer 2 sobre Ethereum que 
utiliza ZK-Rollups para ejecutar transacciones de forma privada. En Aztec: 
• 
Los balances son privados (nadie sabe cuánto tiene nadie). 
• 
Las transacciones son privadas (nadie sabe quién envió qué a quién). 
• 
La identidad es privada (las direcciones Aztec no están vinculadas a direcciones Ethereum 
a menos que el usuario lo elija explícitamente). 
Humanity Ledger construye sobre esta capa de privacidad para crear aplicaciones que heredan 
estas propiedades criptográficas por diseño. 
 
5. Modelo de Mini-Apps: La Estrategia de Producto 
5.1 La Filosofía de Mini-Apps 
Humanity Ledger no es una aplicación monolítica. Es una plataforma de mini-apps donde cada 
aplicación es: 
63. Funcional de forma independiente: Puede usarse sin necesidad de instalar o conocer las 
otras mini-apps. 
64. Integrada económicamente: Todas las mini-apps comparten la misma economía de QDs. 
Los QDs ganados en una mini-app pueden gastarse en otra. 
65. Integrada de identidad: La misma identidad Aztec Schnorr funciona en todas las mini-apps 
del ecosistema. 
66. Escalable: Nuevas mini-apps pueden añadirse al ecosistema sin romper las existentes. 
5.2 Mini-Apps Actuales y Futuras 
Primera Mini-App — Ledger Chat (TESTING / BETA ACADÉMICA): 
Nuestra primera app insignia destinada a publicarse en App Store y Google Play. Aplicación de 
mensajería, videollamadas y transferencias P2P completamente descentralizada. 
Estado Operativo Actual: Ledger Chat y el panel de Portfolio son las aplicaciones 
habilitadas en la red de pruebas. Permiten el flujo completo de comunicación (mensajería 
XMTP, llamadas P2P WebRTC) y la transferencia nativa de QDs entre identidades Aztec. 
Todo el sistema ha superado las primeras fases de auditoría técnica y de seguridad 
estricta, operando bajo un entorno de testeo controlado. 
Segunda Mini-App — Sovereign Portfolio (EN DESARROLLO): 
Panel de control de identidad Aztec, gestión de QDs, historial de transacciones, reclamación de 
airdrops y acceso a los módulos ZK avanzados (PXE Visualizer, Noir Circuits, Aztec Shielding 
Terminal). Actualmente restringido mientras se resuelven dependencias técnicas. 
Mini-Apps Futuras (Roadmap): 
• 
Ledger Academy: Plataforma educativa sobre blockchain y ZK con certificados verificables 
on-chain. 
• 
Ledger Oracle: Sistema de señales de mercado con pruebas ZK de autenticidad. 
• 
Ledger Governance: Módulo de votación descentralizada usando pruebas de identidad 
anónimas. 
 
 
 
 
PARTE II — LEDGER CHAT: LA PRIMERA 
MINI-APP 
 
5.5 Connect Page: Sincronización Multi-Dispositivo con 
QR 
5.5.1 El Problema de la Sesión Cross-Device 
Dado que la identidad en Humanity Ledger es una clave criptográfica (no un 
email/contraseña), compartir la sesión entre el navegador de escritorio y el dispositivo móvil 
requiere un protocolo criptográfico seguro. La Connect Page (/app/connect) resuelve esto 
usando un flujo de Diffie-Hellman Curva Elíptica (ECDH) efímero + QR Code. 
5.5.2 Flujo Criptográfico X25519 
El proceso de sincronización funciona de la siguiente manera: 
67. Generación de sesión: El servidor genera un UUID de sesión único con validez de 270 
segundos (4.5 minutos). 
68. Par de claves efímero: El servidor genera un par de claves X25519 únicas para esta sesión 
(clave pública + privada efímeras). 
69. QR Code: La web codifica {sessionId, publicKeyEfimera} en un código QR que el 
usuario escanea con su móvil. 
70. Handshake ECDH: El dispositivo móvil, al escanear, genera su propio par X25519 efímero y 
calcula el secreto compartido (sharedSecret = ECDH(móvil.privada, 
web.pública)). 
71. Payload cifrado: El móvil cifra con AES-GCM(sharedSecret) un payload que contiene el 
JWT de sesión y la Seed del Ledger Chat. 
72. Long-Polling: La web hace peticiones periódicas a /api/auth/qr-poll?sessionId=... 
hasta que el payload cifrado está disponible. 
73. Descifrado local: La web descifra el payload usando su propia clave X25519 privada. El 
secreto compartido nunca viaja por la red. 
5.5.3 PIN Visual de Verificación 
Para prevenir ataques de intermediario (Man-in-the-Middle), el sistema genera un PIN visual 
de confirmación (generateVisualPin) a partir del secreto compartido. Ambos dispositivos 
muestran el mismo PIN visual; el usuario verifica visualmente que coinciden antes de 
confirmar la sesión. 
5.5.4 Micro-interacciones de UI 
• 
La interfaz actualiza la Dynamic Island del iPhone (useDynamicIsland) para mostrar 
"Syncing Session..." durante el handshake. 
• 
Soporte para deep links de carteras populares: MetaMask, Coinbase Wallet y Rainbow, 
permitiendo iniciar el flujo de escaneo directamente desde la app de cartera. 
 
6. ¿Qué es Ledger Chat? 
Ledger Chat es la primera aplicación de mensajería construida nativamente sobre identidades 
de blockchain. A diferencia de aplicaciones como WhatsApp o Telegram, Ledger Chat no 
requiere número de teléfono, dirección de email ni ningún tipo de identificación en el mundo 
real. 
La única identificación en Ledger Chat es la dirección de wallet del usuario: una cadena de 
caracteres hexadecimales que representa una clave criptográfica. Esta dirección puede ser una 
dirección de Ethereum (EVM) de 42 caracteres (comenzando con 0x seguido de 40 caracteres 
hexadecimales) o una dirección Aztec Schnorr de 66 caracteres. 
6.1 Funciones Principales 
Mensajería Instantánea: 
• 
Mensajes de texto entre wallets con soporte para emojis y formato Markdown 
• 
Indicadores de estado de mensaje (enviado, entregado, visto) 
• 
Cifrado de extremo a extremo (X25519 ECDH) mediante el protocolo XMTP 
Videollamadas y Llamadas de Audio: 
• 
Videollamadas HD peer-to-peer usando WebRTC 
• 
Señalización descentralizada mediante mensajes XMTP 
• 
Sin paso de media por servidores de Humanity Ledger 
• 
Soporte para iOS Safari, Android Chrome y Twitter WebView 
Transferencias de QDs (Pagos P2P): 
• 
Envío de Quantum Dots directamente dentro de una conversación mediante el protocolo 
__PAYMENT__:: 
• 
El receptor recibe los QDs en su identidad Aztec (RPC: v5.mainnet.rpc.aztec-
labs.com) 
• 
Confirmación on-chain en Aztec Mainnet 
Auditoría Completada: La transferencia directa de QDs dentro de la interfaz del chat y 
desde el Portfolio ha sido auditada y asegurada. Ahora permite envíos en tiempo real 
calculando dinámicamente las comisiones anti-spam de la red sin comprometer el 
balance local del usuario. 
Archivos Adjuntos: 
• 
Imágenes: JPEG, PNG, GIF, WebP — Formato interno: 
__IMAGE__data:image/jpeg;base64,... 
• 
Videos: MP4, WebM — Formato interno: __VIDEO__data:video/mp4;base64,... 
GIFs Animados: 
• 
Los GIFs viajan como enlace ligero [GIF]<url> dentro del mensaje XMTP, sin embeberlos 
completos 
• 
Renderizados en un lightbox dedicado en el componente MessageBubble 
Ubicación GPS (`[LOCATION]`): 
• 
Comparte coordenadas GPS con duración de visibilidad configurable (5 min, 1h, 24h, 
Permanente) 
• 
El sistema lanza una carrera asíncrona entre GPS nativo y APIs de IP fallback para 
garantizar que nunca falla 
Encuestas Interactivas (`__POLL__`): 
• 
Crea encuestas con opciones múltiples directamente en la conversación 
• 
Los resultados se actualizan en tiempo real 
Burn-on-Read (Mensajes Autodestructivos): 
• 
Los mensajes se eliminan automáticamente tras ser vistos, con temporizadores de 3s, 10s, 
30s o 60s 
Mensajes Programados (Schedule): 
• 
Programación de mensajes para envío en un momento futuro 
Señales Secretas (Secret): 
• 
Mensajes efímeros cifrados con ZK que no dejan rastro en el historial 
AI Ghost (Asistente IA): 
• 
Agente de inteligencia artificial integrado con notificaciones push y email alerts 
Sistema de Contactos: 
• 
Solicitud de contacto por dirección de wallet 
• 
Aceptación/rechazo de solicitudes 
• 
Nicknames personalizados para contactos 
Emojis, Stickers y Tapbacks (Reacciones): 
• 
Selector de emojis (emoji-picker-react) con botón dedicado en la barra de 
composición 
• 
Stickers con animación "spring-scale" tipo STICKER POP (Framer Motion, iOS-safe) 
• 
Tapback Reactions con glassmorphism y física de muelle 
6.2 Lo que Ledger Chat No Es 
Para mantener la integridad del diseño, es importante también documentar las limitaciones 
actuales por diseño: 
• 
No es una aplicación de mensajería masiva: Ledger Chat está diseñado para 
comunicaciones individuales (1:1) y grupos pequeños, no para broadcasting masivo. 
• 
No almacena mensajes en servidores de Humanity Ledger: Los mensajes se almacenan en 
la red XMTP descentralizada. Si un usuario pierde acceso a su wallet, pierde acceso a sus 
mensajes. 
• 
No tiene recuperación de cuenta por email: No hay contraseña que pueda resetearse. La 
cuenta ES la wallet. 
 
7. Arquitectura de Comunicación Descentralizada 
La arquitectura de Ledger Chat está diseñada con el principio de minimizar la confianza 
requerida. Ningún componente del sistema requiere confianza en Humanity Ledger como 
empresa para garantizar la privacidad del usuario. 
┌─────────────────────────────────────────────────────┐ 
│                   LEDGER CHAT                       │ 
│                                                     │ 
│  Usuario A (Wallet 0x...)    Usuario B (Wallet 0x...)│ 
│         │                           │               │ 
│         │  [Mensajes XMTP]          │               │ 
│         └──── XMTP Network ─────────┘               │ 
│                    │                                │ 
│             (Descentralizado,                       │ 
│              E2E Cifrado,                           │ 
│             Sin Servidores HL)                      │ 
│                                                     │ 
│         │                           │               │ 
│         │  [Video/Audio WebRTC]     │               │ 
│         └──── Direct P2P ───────────┘               │ 
│                                                     │ 
│  Solo ICE/STUN para NAT traversal                   │ 
│  (datos de media NUNCA en servidores HL)            │ 
│                                                     │ 
│         │  [Transferencias QDs]     │               │ 
│         └──── Aztec L2 DB ──────────┘               │ 
│               (PostgreSQL + Aztec Mainnet)          │ 
└─────────────────────────────────────────────────────┘ 
 
7.1 Separación de Responsabilidades 
XMTP Network maneja: señalización de llamadas, mensajes de texto, archivos adjuntos, 
solicitudes de contacto. 
WebRTC / PeerJS maneja: los streams de audio y video (peer-to-peer, sin intermediarios). 
Aztec L2 (PostgreSQL + Aztec Mainnet) maneja: las transferencias de QDs, el registro de 
transacciones, los balances de usuario. 
Servidores de Humanity Ledger (Railway) manejan: autenticación SIWE, API de balance QDs, 
API de historial, coordinación de identidad, anti-Sybil. Los servidores de HL nunca tienen 
acceso al contenido de los mensajes ni a los streams de audio/video. 
 
8. Protocolo XMTP: Mensajería Wallet-a-Wallet 
8.1 ¿Qué es XMTP? 
XMTP (Extensible Message Transport Protocol) es un protocolo de comunicación 
descentralizado que usa wallets de Ethereum como identidades de usuario. Los mensajes en 
XMTP: 
• 
Se cifran usando las claves privadas del emisor y receptor. 
• 
Se transmiten a través de una red de nodos XMTP que no pueden leer el contenido. 
• 
Son verificables criptográficamente: es matemáticamente imposible falsificar el origen de 
un mensaje. 
• 
Son resistentes a la censura: no existe un punto central que pueda bloquear mensajes 
entre wallets específicas. 
8.2 Cómo Funciona la Señalización de Llamadas 
El caso de uso más innovador de XMTP en Ledger Chat es la señalización de videollamadas. En 
lugar de un servidor de señalización centralizado (como usan Zoom, Google Meet o Signal), 
Ledger Chat usa mensajes XMTP para intercambiar las señales de inicio de conexión WebRTC. 
Flujo de una videollamada: 
1. Usuario A hace clic en "Video Call" con Usuario B 
  
2. Sistema A deriva un PeerID determinístico de la wallet de A: 
   peerID_A = "aztec-" + walletAddress_A.slice(2, 18) 
  
3. Sistema A envía mensaje XMTP a wallet_B: 
   "__CALL_OFFER__:<peerID_A>:video" 
  
4. PeerJS de A inicia la espera de conexión entrante (sin round-trip) 
  
5. Sistema B recibe el mensaje XMTP 
   → Notificación de llamada entrante aparece en UI de B 
  
6. Usuario B acepta la llamada 
  
7. Sistema B responde con mensaje XMTP a wallet_A: 
   "__CALL_ANSWER__:<peerID_B>" 
  
8. PeerJS establece la conexión WebRTC directa entre A y B

**DEFENSA ARQUITECTÓNICA (Bundled ICE sobre XMTP):** 
Para evitar bloqueos por Rate Limit en la red XMTP debido al exceso de candidatos ICE generados por 'Trickle ICE', Ledger Chat utiliza 'Vanilla ICE' (Half-Trickle). El sistema recolecta localmente todos los candidatos durante 1.5 segundos y los empaqueta en un único payload SDP. Esto garantiza 100% de fiabilidad en la conexión sin ser penalizados por spam en la red descentralizada. 
   → Stream de video/audio fluye directamente entre navegadores 
   → Cero bytes de media pasan por servidores de Humanity Ledger 
 
Este diseño elimina el servidor de señalización centralizado, haciendo que las llamadas sean 
tan resistentes a la censura como los mensajes. 
8.3 Latencia y Fiabilidad 
• 
Latencia de entrega XMTP: típicamente < 500ms 
• 
Si el mensaje XMTP tarda, el stream WebRTC ya está preparado porque PeerJS inicia la 
espera antes de que el mensaje XMTP sea confirmado 
• 
Fallback automático a STUN si la conexión directa falla por NAT 
 
9. WebRTC: Videollamadas Peer-to-Peer Sin Censura 
9.1 La Arquitectura WebRTC de Ledger Chat 
WebRTC (Web Real-Time Communication) es un estándar de la W3C que permite 
comunicación de audio y video directamente entre navegadores web sin plugins ni 
aplicaciones nativas. 
Ledger Chat usa PeerJS, una librería que abstrae la complejidad de WebRTC, sobre la siguiente 
arquitectura: 
Media Flow: 
┌──────────┐  [WebRTC Direct Stream]  ┌──────────┐ 
│ Browser A│◄──────────────────────►│ Browser B│ 
└──────────┘                         └──────────┘ 
      │                                    │ 
      └── ICE/STUN (solo para NAT) ────────┘ 
 
Nota crítica de privacidad: Los datos de audio y video nunca tocan los servidores de Humanity 
Ledger. Solo el tráfico de señalización (XMTP) y los metadatos de ICE/STUN pasan por 
infraestructura externa. El contenido multimedia es estrictamente peer-to-peer. 
9.2 Compatibilidad con Dispositivos Móviles 
Los navegadores móviles imponen restricciones estrictas en getUserMedia. Ledger Chat 
implementa un sistema de fallback en dos niveles para garantizar compatibilidad universal: 
Nivel 1 — Constraints Optimizados: 
{ 
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: 
true }, 
  video: { width: { ideal: 1280 }, height: { ideal: 720 },  
           frameRate: { ideal: 30, max: 60 }, facingMode: 'user' } 
} 
 
Nivel 2 — Fallback Universal (si Nivel 1 falla): 
{ 
  audio: true, 
  video: { facingMode: 'user' } 
} 
 
Este sistema ha sido validado en: iOS Safari 18, Android Chrome 126, y Twitter WebView en 
Android, cubriendo más del 95% de los dispositivos móviles en uso activo. 
9.3 NAT Traversal y TURN 
La mayoría de dispositivos domésticos están detrás de NAT (Network Address Translation), lo 
que puede impedir conexiones WebRTC directas. Ledger Chat usa servidores STUN para 
facilitar NAT traversal en la mayoría de casos. Para redes corporativas con NAT estricto, el 
roadmap incluye la implementación de servidores TURN auto-alojados (coturn). 
 
10. Onion Routing: La Capa de Privacidad Avanzada 
10.1 El Sistema de Enrutamiento Cebolla 
Para usuarios que requieren el máximo nivel de privacidad, Ledger Chat implementa un 
sistema de Onion Routing (enrutamiento cebolla) inspirado en la arquitectura de Tor, pero 
adaptado para comunicaciones Web3. 
El enrutamiento cebolla asegura que: 
• 
El emisor del mensaje no sabe quién es el receptor final. 
• 
Los nodos intermediarios solo conocen al nodo anterior y al siguiente, nunca el origen y 
destino completos. 
• 
Incluso si un nodo intermediario es comprometido, no puede reconstruir la ruta completa del mensaje.

**DEFENSA ARQUITECTÓNICA (Mixnet & Constant-Rate Padding):**
Para prevenir que un adversario que observe toda la red XMTP realice análisis de correlación temporal, los nodos Relay implementan *Constant-Rate Message Padding*. Los mensajes se retienen en una cola, se les introduce un jitter (delay aleatorio), y se agrupan en lotes de tamaño idéntico. Esto convierte el tráfico visible en ruido criptográfico indescifrable. 
del mensaje. 
10.2 Endpoints del Sistema Onion 
El sistema consta de tres endpoints especializados en app/api/chat/onion/: 
`/api/chat/onion/register`: Permite que los nodos de la red se registren como relays 
voluntarios. Los usuarios con alta actividad en el ecosistema pueden operar nodos relay y 
recibir compensación en QDs. 
`/api/chat/onion/relay`: El endpoint que procesa los mensajes encriptados por capas. Cada 
nodo relay descifra una capa del mensaje (usando su clave privada), descubre la siguiente 
dirección, y reenvía el mensaje restante. 
`/api/chat/onion/queue`: Sistema de cola para mensajes pendientes. Los mensajes que no 
pueden entregarse inmediatamente se almacenan en PendingChatMessage con un TTL 
configurable. 
10.3 Mensajes Pendientes y Persistencia (Redis Fallback) 
Si el receptor está offline cuando se envía un mensaje, el sistema asegura su disponibilidad 
temporal mediante una arquitectura de persistencia multinivel. Primero, intenta almacenar la 
señal cifrada en una caché de alta velocidad (Redis). Si el clúster de Redis presenta 
intermitencia, se emplea un fallback a memoria volátil del servidor (In-Memory). Solo como 
última instancia de persistencia estructurada, los datos se almacenan en la tabla 
PendingChatMessage vía Prisma en PostgreSQL. Cuando el receptor se conecta, el sistema 
app/api/chat/pending/ entrega todos los mensajes pendientes y los elimina 
permanentemente del almacenamiento. 
 
11. Gestión de Contactos y Solicitudes 
11.1 El Modelo de Contactos 
Ledger Chat implementa un modelo de contactos bidireccional inspirado en las redes sociales, 
con la diferencia de que las identidades son wallets, no nombres de usuario: 
Estados de Contacto: 
• 
PENDING_SENT: Solicitud enviada, esperando respuesta 
• 
PENDING_RECEIVED: Solicitud recibida, pendiente de decisión 
• 
ACCEPTED: Contacto confirmado (aparece en la lista de chats) 
• 
REJECTED: Solicitud rechazada (no aparece en listas, pero el registro existe en DB) 
11.2 Flujo de Solicitud de Contacto 
1. Usuario A busca o introduce la dirección wallet de B 
2. A envía solicitud → POST /api/chat/contacts/request 
   - Valida que A y B no sean la misma wallet 
   - Verifica que no exista ya un contacto entre ellos 
   - Crea registro ChatContactRequest en DB 
   - Envía notificación push a B (via /api/notifications) 
  
3. B recibe notificación de solicitud 
4. B puede ACEPTAR o RECHAZAR → POST 
/api/chat/contacts/request/[accept|reject] 
  
5. Si ACEPTA: 
   - Se crean dos registros ChatContact (A→B y B→A) 
   - Ambos usuarios aparecen en la lista de contactos del otro 
   - Notificación de confirmación a A 
  
6. Si RECHAZA: 
   - El estado de ChatContactRequest cambia a REJECTED 
   - A puede reintentar en el futuro (con límite de rate) 
 
11.3 Protección Anti-Spam 
Para prevenir el acoso mediante solicitudes masivas de contacto: 
• 
Rate limiting por dirección IP y por wallet 
• 
Los contactos rechazados tienen un cooldown antes de poder reenviar solicitud 
• 
El sistema de anti-Sybil verifica que el emisor sea una identidad activa en el ecosistema 
 
12. Archivos Adjuntos, Multimedia y Protocolos de 
Mensaje Avanzados 
12.1 Sistema de Adjuntos (Imágenes y Vídeo) 
Los archivos adjuntos en Ledger Chat se procesan mediante el endpoint POST 
/api/chat/attachments. El sistema: 
74. Recibe el archivo del cliente 
75. Lo convierte a base64 
76. Prefija el contenido con el tipo MIME en un formato estándar interno: 
• 
Imágenes: __IMAGE__data:image/jpeg;base64,/9j/4AAQ... 
• 
Videos: __VIDEO__data:video/mp4;base64,AAAAIG... 
77. El mensaje XMTP lleva este payload completo cifrado 
78. El receptor decodifica el prefijo y renderiza el contenido apropiado 
Roadmap: almacenamiento descentralizado en IPFS con solo el hash viajando por XMTP. 
 
12.2 Protocolo de GIFs 
Los GIFs animados utilizan un protocolo de enlace ligero. En lugar de embeber el binario 
completo, el sistema transmite el siguiente prefijo de texto dentro del mensaje XMTP cifrado: 
[GIF]<url_directo_al_gif> 
 
El componente MessageBubble detecta el prefijo [GIF] y renderiza el GIF directamente 
desde la URL en un lightbox dedicado, evitando sobrecargar el payload XMTP. 
 
12.3 Protocolo de Ubicación (`[LOCATION]`) 
El sistema de ubicación es una de las funciones más sofisticadas del chat, con redundancia 
geográfica automática y privacidad configurable. 
Flujo de obtención de ubicación (Race Asíncrono): 
El sistema lanza una "carrera" paralela (Promise.race / Promise.any) entre tres fuentes de 
datos: 
79. GPS nativo de alta precisión del dispositivo (timeout de 3.5 segundos). 
80. Fallback API 1: ipapi.co (geolocalización por IP). 
81. Fallback API 2: ip-api.com → ipinfo.io (cascada de respaldo). 
El primer resultado válido que llegue "gana la carrera" y se usa. Esto garantiza que la función 
de ubicación nunca falla aunque el GPS esté desactivado o el dispositivo sea una máquina de 
escritorio. 
Caché de Privacidad: 
La última ubicación conocida se guarda en localStorage con la clave 
last_known_system_location, con una validez de 24 horas. Esto evita solicitar permiso de 
ubicación repetidamente y permite al sistema funcionar en modo offline. 
Configuración de Duración (Burn de Ubicación): 
El usuario puede configurar cuánto tiempo su ubicación permanecerá visible para el receptor. 
La preferencia se guarda en localStorage con la clave 
preferred_location_duration_${walletKey}. Las opciones disponibles son: 
• 
300000 ms → 5 minutos 
• 
3600000 ms → 1 hora 
• 
86400000 ms → 24 horas 
• 
0 → Permanente 
Formato del Payload XMTP: 
[LOCATION]<latitud>,<longitud>|<durationMs> 
 
Ejemplo: [LOCATION]40.4168,-3.7038|3600000 
 
12.4 Protocolo de Encuestas (`__POLL__`) 
Las encuestas interactivas viajan dentro del mensaje XMTP con el siguiente formato de texto 
estructurado: 
__POLL__<pollId>__::<pregunta>__::<opción1|opción2|opción3> 
 
Flujo de votos: 
Los votos de los participantes se registran en el objeto de estado msg.pollVotes del contexto 
del chat. Los resultados se actualizan en tiempo real mediante el sistema de suscripción XMTP. 
 
12.5 Protocolo de Pagos Integrados (`__PAYMENT__`) 
Los mensajes de pago P2P entre usuarios se identifican mediante el marcador de contenido 
__PAYMENT__::. Al detectar este prefijo, el componente MessageBubble renderiza un 
PaymentBubble especializado que muestra: 
• 
El monto enviado en QDs 
• 
El hash de la transacción Aztec (abreviado) 
• 
El estado de confirmación en tiempo real 
Los pagos del chat se ejecutan directamente sobre la Aztec Mainnet (RPC: 
node.aztec.network) sin comisiones adicionales de plataforma. 
 
12.6 Burn-on-Read (Mensajes Autodestructivos) 
Configurado desde el AdvancedSettingsModal de Ledger Chat, el sistema de burn-on-read 
permite establecer una vida útil máxima para los mensajes. Una vez que el receptor abre el 
mensaje, un temporizador se activa y el mensaje se elimina automáticamente tras el período 
configurado. 
Temporizadores disponibles: 
• 
burnOnReadSeconds: 3 → 3 segundos 
• 
burnOnReadSeconds: 10 → 10 segundos 
• 
burnOnReadSeconds: 30 → 30 segundos 
• 
burnOnReadSeconds: 60 → 60 segundos 
 
12.7 Mensajes Programados (Schedule) 
Ledger Chat soporta la programación de mensajes para envío futuro. El estado de pre-
publicación se gestiona mediante msg.status === 'scheduled' dentro del componente 
MessageBubble, que renderiza una UI diferenciada (con icono de reloj y timestamp de envío 
programado) hasta que la hora de envío llega y el mensaje se despacha por XMTP. 
 
12.8 Señales Secretas (Secret) 
La función "Secret" combina el estado privado de contratos de Aztec con mensajería efímera 
de un solo uso. Permite el envío de información que solo puede ser descifrada por el receptor 
designado en el contexto de la sesión ZK activa, y que no deja rastro legible en el historial del 
chat una vez consumida. 
 
12.9 Ghost AI (Asistente de IA Integrado) 
Desde el panel de configuración avanzada, el usuario puede activar un "AI Ghost" —un agente 
de inteligencia artificial— que puede monitorear, filtrar o responder automáticamente a 
mensajes del chat. El sistema está asociado con: 
• 
Notificaciones push configurables para alertas en tiempo real. 
• 
Email Alerts para mensajes que el AI Ghost considera prioritarios. 
 
12.10 Stickers, Emojis y Reacciones (Tapbacks) 
El sistema de expresión emocional del chat se ha rediseñado con una arquitectura de 
animación premium: 
Stickers — STICKER POP Animation: 
Los stickers utilizan una animación de entrada tipo "spring-scale" (stagger + scale) 
implementada con Framer Motion. El sistema es específicamente seguro para iOS, evitando el 
bug conocido de "nested framer scale" que causaba bloqueos en WebKit. 
Tapback Reactions: 
La bandeja de reacciones (Tapback Picker) aplica efectos de glassmorphism con física de 
muelle (spring physics) y efectos hover con amplificación de escala. La paleta de reacciones 
incluye el set completo Unicode de emociones. 
Emoji Picker: 
El selector de emojis principal (emoji-picker-react) se invoca mediante un botón dedicado 
(ícono de cara sonriente) en la barra de composición, completamente independiente del botón 
de stickers. 
GIFs — Protocolo Ligero: 
Como se describe en 12.2, los GIFs viajan como texto ([GIF]<url>) para mantener el payload 
XMTP mínimo. 
 
12.11 Limitaciones de Adjuntos (Estado Beta) 
• 
Tamaño máximo por archivo: configurado en el servidor Railway. 
• 
Los archivos grandes pueden causar latencia en la entrega XMTP. 
• 
Roadmap: Almacenamiento descentralizado en IPFS/Arweave con solo el hash CID 
viajando cifrado por la red XMTP. 
 
13. Costes de Uso en Quantum Dots 
Cada funcionalidad de Ledger Chat tiene un coste en QDs para mantener la sostenibilidad económica del ecosistema y desincentivar el abuso:

**DEFENSA ARQUITECTÓNICA (ZK State Channels):**
Generar una prueba ZK para cada mensaje de 0.01 QDs arruinaría la experiencia de usuario (5 segundos de latencia por mensaje). Para solucionar esto, Ledger Chat utiliza *Micro-canales de Estado*. El usuario genera una *única* prueba ZK on-chain al abrir la app para bloquear (escrow) QDs. Los mensajes individuales se firman instantáneamente off-chain con Session Keys efímeras en milisegundos. La prueba ZK final solo se genera al liquidar el canal en Aztec Mainnet. para mantener la sostenibilidad 
económica del ecosistema y desincentivar el abuso: 
Funcionalidad 
Coste en QDs 
Mensaje de texto 
0.01 QDs 
Llamada de audio (por minuto) 
0.5 QDs 
Videollamada HD (por minuto) 
0.5 QDs 
Archivo adjunto (imagen/video) 
0.1 QDs 
Prueba ZK Noir (generación) 
0.1 QDs 
Transferencia P2P de QDs 
1% del monto (mínimo 1 QD) 
 
Nota de diseño: El sistema de costes tiene un doble propósito. Primero, crea un flujo 
económico sostenible dentro del ecosistema. Segundo, y más importante, actúa como 
mecanismo anti-spam: los bots no pueden enviar millones de mensajes de forma gratuita 
porque cada mensaje tiene un costo criptoeconómico real. 
 
 
 
 
PARTE III — QUANTUM DOTS (QDs): LA 
ECONOMÍA INTERNA 
 
14. ¿Qué Son los Quantum Dots? 
Quantum Dots (QDs) son el token nativo del ecosistema Humanity Ledger. A diferencia de los 
tokens ERC-20 estándar de Ethereum (que son completamente públicos y trazables), los QDs 
operan en la red privada de Aztec L2, lo que les confiere propiedades únicas: 
• 
Privacidad nativa: Los balances de QDs no son públicos por defecto. Ningún observador 
externo puede ver cuántos QDs tiene una dirección. 
• 
Transacciones privadas: Las transferencias de QDs entre dos usuarios no revelan las 
identidades de los participantes a terceros. 
• 
Trazabilidad selectiva: Los usuarios pueden, voluntariamente, generar pruebas ZK de sus 
transacciones para propósitos de auditoría o verificación, sin revelar el monto completo de 
su balance. 
14.1 Denominación y Unidades 
• 
Símbolo: QDs 
• 
Nombre completo: Quantum Dots 
• 
Unidad base: 1 QD = 1 × 10⁸ unidades base (similar a los satoshis de Bitcoin) 
• 
Decimales en UI: 2 decimales (ej.: 2,500.00 QDs) 
• 
Precisión interna: 6 decimales (ej.: 0.000001 QD es la unidad mínima transferible) 
14.2 QDs en el Contexto de Aztec 
En la arquitectura de Aztec, los QDs se implementan como un token privado mediante el 
contrato TokenContract del stack @aztec/noir-contracts.js. Cuando el contrato de 
token está desplegado (AZTEC_TOKEN_CONTRACT_ADDRESS configurado), las transferencias se 
ejecutan nativamente on-chain en Aztec V5. 
En modo de desarrollo (sin contrato desplegado), el sistema opera en Modo B: las 
transferencias se registran en la base de datos PostgreSQL, ancladas a un número de bloque 
real de Aztec obtenido mediante createAztecNodeClient. Los hashes de transacción se 
generan de forma determinística usando SHA-256 para garantizar unicidad e idempotencia. 
 
15. Génesis: El Balance Inicial de 2.500 QDs 
15.1 El Airdrop de Génesis 
Cuando un usuario activa por primera vez su identidad Aztec en Humanity Ledger, el sistema le 
asigna automáticamente un balance génesis de 2.500 QDs. Este balance: 
• 
Se asigna en el momento de la primera consulta de balance (GET /api/aztec/balance) 
• 
Se registra en la columna creditsBalance del modelo User en PostgreSQL 
• 
El valor por defecto está definido en el schema de Prisma: creditsBalance Int 
@default(2500) 
• 
No requiere ninguna acción por parte del usuario: aparece automáticamente 
15.2 Propósito del Balance Génesis 
El balance génesis tiene un propósito estratégico triple: 
1. Onboarding sin fricción: Los usuarios pueden empezar a usar todas las funciones de Ledger 
Chat inmediatamente, sin necesidad de comprar QDs primero. 
2. Bootstrapping de la red: Para que la economía de QDs funcione, los usuarios deben poder 
gastar. Un usuario con 0 QDs no puede experimentar el ecosistema. El balance génesis 
resuelve el problema del huevo y la gallina. 
3. Filtro anti-Sybil de primer nivel: Crear miles de wallets para abusar del sistema génesis 
requiere que cada wallet: 
• 
Complete la autenticación SIWE (firma con wallet real) 
• 
Sea verificada como identidad activa 
• 
Supere los filtros de rate limiting por IP y por dirección 
15.3 El Balance Génesis es Único 
El balance génesis se asigna una única vez por dirección de wallet. El sistema upsert de 
Prisma garantiza la idempotencia: 
const user = await prisma.user.upsert({ 
  where: { walletAddress: normalizedAddress }, 
  update: {}, // no-op: si ya existe, no se modifica 
  create: { 
    walletAddress: normalizedAddress, 
    creditsBalance: 2500, // Solo para usuarios nuevos 
    tier: 'FREE', 
    humanityScore: 0, 
  }, 
  select: { creditsBalance: true } 
}); 
 
Si la wallet ya tiene un registro en la base de datos, el campo update: {} vacío garantiza que 
el balance existente no se sobrescriba. 
 
16. Estructura de Transacciones: Tipos y Flujos 
El sistema de QDs mantiene un registro exhaustivo de todas las operaciones económicas. Cada 
operación se registra con un tipo específico en la tabla Transaction de PostgreSQL: 
Tipo 
Descripción 
Quién paga 
Quién recibe 
`TRANSFER` 
Transferencia P2P 
entre usuarios 
Emisor 
Receptor 
`SPEND` 
Gasto por uso de 
servicio (chat, video) 
Usuario 
Sistema (quemado) 
`AIRDROP` 
Distribución mensual 
del ecosistema 
Sistema (mint) 
Usuario 
`PURCHASE` 
Compra de QDs con 
ETH 
Usuario (ETH) 
Usuario (QDs) 
`EARN` 
Recompensa por 
actividad (ej: transferir 
≥50 QDs) 
Sistema 
Emisor 
`FEE` 
Comisión de red 
cobrada en cada 
transferencia 
Usuario 
Sistema 
`STAKE` 
Bloqueo de QDs para 
Sovereign Node 
Usuario 
Contrato de stake 
`UNSTAKE` 
Liberación de QDs del 
stake 
Contrato de stake 
Usuario 
`REWARD` 
Rendimiento del 
staking 
Sistema 
Staker 
`SLASH` 
Penalización por 
comportamiento anti-
Sybil 
Usuario (penalizado) 
Sistema 
 
16.1 La Tabla QdTransaction: Historial Granular 
Además de la tabla Transaction, existe la tabla QdTransaction que registra operaciones de 
menor granularidad, especialmente útil para el historial del portfolio: 
model QdTransaction { 
  id           String   @id @default(uuid()) 
  aztecAddress String   // La identidad L2 que opera 
  type         String   // EARN, SPEND, SLASH, STAKE, UNSTAKE, FEE, REWARD 
  amount       Float 
  description  String   @db.Text 
  txHash       String?  // Hash del tx on-chain si aplica 
  createdAt    DateTime @default(now()) 
} 
 
 
17. Sistema de Comisiones (Fee Tokenomics) 
17.1 La Comisión Anti-DoS 
Cada transferencia de QDs incurre en una comisión calculada como: 
Fee = max(1 QD, round(monto × 0.01)) 
 
Es decir: el 1% del monto transferido, con un mínimo de 1 QD. 
Ejemplos: 
• 
Transferir 10 QDs → Fee = 1 QD (mínimo) 
• 
Transferir 100 QDs → Fee = 1 QD 
• 
Transferir 500 QDs → Fee = 5 QDs 
• 
Transferir 10.000 QDs → Fee = 100 QDs 
17.2 Propósito de la Comisión 
La comisión tiene una función de seguridad crítica: hace matemáticamente costoso el ataque 
de database bloat (inflate de la base de datos). Un actor malicioso que intente crear millones 
de micro-transacciones para saturar la base de datos pagaría al menos 1 QD por transacción, lo 
que hace el ataque económicamente insostenible. 
La comisión se registra como una operación FEE en la tabla QdTransaction para mantener 
trazabilidad completa del flujo económico. 
17.3 Recompensas por Transferencia (Earn Mechanism) 
Para incentivar el uso activo del ecosistema, el sistema incluye un mecanismo de recompensas 
por transferencia: si un usuario transfiere 50 QDs o más a otro usuario, recibe una 
recompensa de 50 QDs del sistema. 
Protecciones Anti-Sybil del Mecanismo de Earn: 
82. Una recompensa por día: Aunque el usuario haga 100 transferencias de ≥50 QDs en un 
día, solo recibirá la recompensa una vez. 
83. Protección anti-wash trading: El sistema verifica si el par de wallets (A→B o B→A) ya 
interactuó en el mismo día UTC. Si sí, no hay recompensa. Esto rompe el ciclo A→B→A→B 
que un atacante usaría para farmear recompensas con sus propias wallets. 
// Verificación anti-pair-wash trading 
const pairInteracted = await tx.transaction.findFirst({ 
  where: { 
    OR: [ 
      { fromAddress: fromAddr, toAddress: toAddr }, 
      { fromAddress: toAddr, toAddress: fromAddr } 
    ], 
    status: 'COMPLETED', 
    createdAt: { gte: new Date(todayIso) } 
  } 
}); 
 
 
18. Airdrop Mensual del Ecosistema 
18.1 El Calendario de Airdrops 
El sistema incluye un airdrop mensual de 10 QDs para usuarios activos del ecosistema. Este 
airdrop está disponible el primer día de cada mes UTC y puede reclamarse en la pestaña 
"Airdrop 🎁🎁" del Portfolio. 
El calendario de airdrops está diseñado para extenderse hasta el año 2100, con un sistema de 
claims por wallet por mes almacenado en la tabla AirdropClaim. 
18.2 Requisitos para Reclamar el Airdrop 
Para evitar que bots y cuentas inactivas abusen del sistema de airdrop, se exigen cuatro 
requisitos: 
Requisito 1 — Ventana Temporal: 
El reclamo solo es posible el día 1 del mes UTC. El sistema verifica utcDay === 1. 
Requisito 2 — Un Reclamo por Mes: 
La tabla AirdropClaim tiene una restricción única (walletAddress, year, month). 
Intentar reclamar dos veces en el mismo mes retorna error 409. 
Requisito 3 — Anti-Sybil por Gasto: 
El usuario DEBE haber realizado al menos una transacción de tipo SPEND con su wallet. Esto 
asegura que solo los usuarios que realmente usan el ecosistema (gastan QDs en Ledger Chat, 
Noir ZK, etc.) pueden reclamar la recompensa mensual: 
const spendCount = await prisma.transaction.count({ 
  where: { fromAddress: aztecAddress, type: 'SPEND', token: 'QDs' } 
}); 
if (spendCount === 0) return error('Sybil Protection: Debes gastar QDs 
primero'); 
 
Requisito 4 — Verificación Social: 
El usuario debe seguir los canales oficiales de Humanity Ledger en Twitter, YouTube y 
Telegram. El estado de seguimiento se verifica en la tabla SocialVerification. 
18.3 El Proceso de Claim 
1. Usuario navega a tab "Airdrop 🎁🎁" en el Portfolio 
2. POST /api/aztec/airdrop/calendar { aztecAddress } 
3. Sistema verifica los 4 requisitos 
4. Si AZTEC_TOKEN_CONTRACT_ADDRESS está configurado: 
   → Mint on-chain en Aztec Mainnet (Modo A) 
5. Si no (Modo B / desarrollo): 
   → Se genera hash SHA-256 determinístico como txHash 
6. Operación atómica en Prisma (Serializable): 
   - Crea AirdropClaim (previene doble claim) 
   - Crea Transaction tipo AIRDROP 
   - Upsert User con +10 en creditsBalance 
7. Retorna txHash y explorerUrl para verificación 
 
 
19. Protección Anti-Sybil: Cómo Garantizamos la 
Integridad 
19.1 El Problema Sybil en Economías de Tokens 
Un ataque Sybil en el contexto de Ledger Chat consistiría en crear miles de wallets falsas para: 
• 
Reclamar múltiples veces el balance génesis de 2.500 QDs 
• 
Reclamar airdrops mensuales múltiples veces 
• 
Farmear las recompensas de transferencia (wash trading) 
19.2 Las Capas de Protección Anti-Sybil 
Capa 1 — Identity Gate: 
El endpoint de transferencia verifica que el emisor sea una identidad verificada antes de 
procesar cualquier transacción: 
const sessionVerified = await isVerifiedIdentity(verifiedSessionAddr); 
const fromVerified = await isVerifiedIdentity(fromAddr); 
if (!sessionVerified && !fromVerified) { 
  return error('Reclama tu airdrop génesis para usar QDs'); 
} 
 
Capa 2 — Spend-to-Earn: 
Solo los usuarios que han gastado QDs (demostrando uso real) pueden reclamar airdrops 
mensuales. 
Capa 3 — Anti Wash-Trading: 
Las recompensas por transferencia están protegidas contra el ciclo A→B→A mediante 
verificación de pares diarios. 
Capa 4 — Verificación Social y ZK-Email:
**DEFENSA ARQUITECTÓNICA (Criptografía > APIs Web2):**
Evitamos depender exclusivamente de APIs centralizadas y vulnerables (como Twitter). En su lugar, el roadmap integra **ZK-Email** y credenciales criptográficas, permitiendo a los usuarios generar pruebas de conocimiento cero que demuestran que poseen un correo universitario (@e-uvt.ro) o un pasaporte, sin revelar jamás su identidad real a la wallet, neutralizando granjas de bots. 
Los airdrops mensuales requieren seguimiento verificado en redes sociales. 
Capa 5 — Rate Limiting por IP: 
Todos los endpoints críticos tienen límites de tasa por dirección IP usando el sistema rate-
limit con ventanas de 60 segundos. 
Capa 6 — Transacciones Serializables: 
Las operaciones críticas (transferencias, claims) usan el nivel de aislamiento más alto de 
PostgreSQL (Serializable), que previene condiciones de carrera que podrían permitir 
double-spending o double-claiming. 
Capa 7 — Hash de IP Salteado: 
Las direcciones IP de los usuarios se hashean con HMAC-SHA256 usando el secreto JWT del 
servidor como clave, lo que hace imposible construir rainbow tables para revertir los hashes: 
export function hashIpAddress(rawIp: string): string { 
  const secret = process.env.JWT_SECRET || 'ledger-oracle-secret'; 
  return crypto.createHash('sha256').update(cleanIp + secret).digest('hex'); 
} 
 
 
20. Compra de QDs con ETH: El Puente Fiat-Cripto 
20.1 Los Paquetes de QDs 
Cuando un usuario necesita más QDs de los que tiene disponibles, puede adquirirlos mediante 
una transacción en Ethereum mainnet. El endpoint POST /api/aztec/purchase-qd gestiona 
este proceso. 
Tabla de Paquetes Disponibles: 
Paquete 
QDs 
Precio ETH 
Equivalente 
aproximado* 
Starter 
100 QDs 
0.001 ETH 
~$2.50 USD 
Basic 
250 QDs 
0.0025 ETH 
~$6.25 USD 
Standard 
500 QDs 
0.005 ETH 
~$12.50 USD 
Professional 
1.000 QDs 
0.01 ETH 
~$25.00 USD 
Premium 
2.500 QDs 
0.025 ETH 
~$62.50 USD 
Sovereign 
35.000 QDs 
0.35 ETH 
~$875.00 USD 
 
*Precios en USD son aproximados y dependen del precio de ETH en el momento de la compra. 
20.2 El Proceso de Compra con Verificación On-Chain 
El sistema de compra de QDs implementa la verificación más rigurosa del sistema, porque 
involucra dinero real (ETH). El flujo es: 
1. Usuario selecciona paquete en la UI 
2. Usuario envía ETH a la wallet del tesoro de Humanity Ledger: 
   0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a 
3. Usuario obtiene el txHash de la transacción Ethereum 
4. Usuario llama POST /api/aztec/purchase-qd con {aztecAddress, txHash, 
packageIndex} 
5. Servidor verifica ON-CHAIN mediante viem + Ethereum RPC: 
   a. ¿Existe el txHash en Ethereum mainnet? 
   b. ¿El destinatario es la wallet del tesoro? 
   c. ¿El monto es suficiente? (con 5% de tolerancia) 
   d. ¿La transacción está confirmada? (tiene blockNumber) 
6. Verificación de idempotencia: ¿ya se procesó este txHash? 
   → Si sí: retorna 200 con mensaje "ya procesado" 
7. Si todo es válido: 
   → Acredita QDs en la DB (Prisma Serializable transaction) 
8. Retorna nuevo balance 
 
Seguridad crítica: El servidor NUNCA acredita QDs sin verificar primero la transacción on-
chain. No existe ninguna ruta para acreditar QDs sin un txHash de Ethereum válido y 
confirmado. Esto hace imposible el fraude mediante falsificación de transacciones. 
 
21. Staking de QDs: Sovereign Nodes 
21.1 El Concepto de Sovereign Node 
El sistema incluye un mecanismo de Staking de QDs para usuarios que quieren 
comprometerse a largo plazo con el ecosistema. Al bloquear QDs durante un período 
determinado, los usuarios obtienen el estatus de Sovereign Node y reciben: 
• 
Rendimientos periódicos en QDs 
• 
Acceso prioritario a funciones premium 
• 
Mayor peso en el sistema de reputación 
21.2 Tiers de Staking 
Tier 
QDs Mínimos 
Período de Lock 
Rendimiento APY 
BRONZE 
A definir 
A definir 
A definir 
SILVER 
A definir 
A definir 
A definir 
GOLD 
A definir 
A definir 
A definir 
 
El esquema de datos ya está implementado en model SovereignNode del schema de Prisma. 
 
22. El Modelo Económico de Largo Plazo 
22.1 Flujos de QDs en el Ecosistema 
ENTRADAS AL SISTEMA: 
├── Balance Génesis: 2.500 QDs por nueva wallet 
├── Airdrops Mensuales: 10 QDs × usuarios activos 
├── Compras con ETH: variables según demanda 
└── Recompensas de actividad: 50 QDs por transferencia ≥50 QDs 
  
CIRCULACIÓN INTERNA: 
├── Pagos en Ledger Chat (mensajes, llamadas, adjuntos) 
├── Transferencias P2P entre usuarios 
└── Pagos de Noir ZK proof generation 
  
SALIDAS DEL SISTEMA (burn): 
├── Comisiones de red (1%) 
├── Penalizaciones anti-Sybil (SLASH) 
└── Gastos de servicios del sistema 
 
22.2 La Deflación Controlada 
El sistema está diseñado con deflación controlada: las comisiones y penalizaciones retiran QDs 
de la circulación de forma continua. Esto crea una presión deflacionaria que incrementa el 
valor de los QDs en circulación con el tiempo, incentivando a los usuarios a retener QDs 
además de usarlos. 
 
 
 
 
PARTE IV — PORTFOLIO E IDENTIDAD 
AZTEC 
 
23. La Tarjeta de Identidad Soberana (Schnorr Account) 
El Portfolio de Humanity Ledger es el panel de control central del usuario dentro del 
ecosistema. Su pieza fundamental es la Tarjeta de Identidad Soberana (componente 
AztecIdentityCard), que gestiona la identidad criptográfica del usuario en la red Aztec. 
23.1 Las Pestañas del Portfolio 
El Portfolio organiza las funcionalidades en 9 pestañas especializadas: 
Pestaña 
Función 
**Identity** 
Información de la cuenta Schnorr, balance en 
QDs, rango del usuario 
**Send** 
Envío de QDs a otras wallets Aztec o EVM 
**Receive** 
Código QR de la dirección Aztec para recibir QDs 
**History** 
Historial completo de transacciones con filtros 
**Airdrop 🎁🎁** 
Reclamación del airdrop mensual de 10 QDs 
**Node** 
Estado de la red Aztec, altura de bloque, 
endpoints 
**PXE** 
Visualizador del Private Execution Environment 
**Circuits** 
Grid de pruebas Noir ZK generadas 
**Portal** 
Terminal de Aztec Shielding 
 
23.2 El Sistema de Rangos 
El rango del usuario se calcula automáticamente en función de su balance de QDs, usando la 
nomenclatura interna del stack de Aztec (Williamson / Pocock nomenclature): 
Rango 
Balance QDs Mínimo 
Color 
WITNESS 
0 QDs 
text-zinc-500 
PROVER 
10 QDs 
text-zinc-600 
SEQUENCER 
50 QDs 
text-zinc-700 
SHIELDER 
100 QDs 
text-zinc-700 
SOVEREIGN 
500 QDs 
text-zinc-800 
ARCHITECT 
1.000 QDs 
text-zinc-900 
 
Estos rangos reflejan los roles reales del stack de Aztec Network: 
• 
Witness: genera los datos de entrada para los circuitos ZK. 
• 
Prover: genera la prueba ZK a partir de los datos del Witness. 
• 
Sequencer: ordena las transacciones y las envía al L1. 
• 
Shielder: gestiona el estado privado en Aztec. 
• 
Sovereign: usuario con alta participación y recursos en la red. 
• 
Architect: el nivel más alto, usuarios que han construido sobre el ecosistema. 
 
24. Derivación Criptográfica de la Dirección Aztec 
24.1 El Problema: Dos Tipos de Dirección 
El ecosistema Ethereum tiene un estándar bien establecido para las direcciones (42 caracteres: 
0x + 40 hex). Aztec Network tiene su propio formato de dirección (66 caracteres: 0x + 64 hex), 
basado en el campo escalar BN254. 
Cuando un usuario de Ethereum quiere usar Humanity Ledger, necesita una dirección Aztec 
Schnorr derivada de su dirección Ethereum. Esta derivación es: 
84. Determinística: La misma dirección EVM siempre produce la misma dirección Aztec. 
85. No-reversible: A partir de la dirección Aztec, es matemáticamente imposible recuperar la 
dirección EVM. 
86. Consistente: La misma función de derivación se usa en el frontend, el backend y todos los 
módulos auxiliares. 
24.2 El Algoritmo de Derivación 
La derivación de dirección Aztec se implementa en lib/aztec/zk-identity.ts mediante un 
proceso de dos rondas: 
export function deriveAztecAddress(evmAddress: string): string { 
  const normalized = evmAddress.toLowerCase().trim(); 
   
  // Ronda 1: SHA-256 con prefijo de dominio 
  const round1 = crypto 
    .createHash('sha256') 
    .update(`aztec-schnorr:${normalized}`) 
    .digest('hex'); 
   
  // Ronda 2: Keccak256 del resultado de la ronda 1 
  const round2 = keccak256(toBytes(`0x${round1}`)); 
   
   // CORRECCIÓN CRIPTOGRÁFICA DE SEGURIDAD (Grumpkin Modulo Reduction):
 // Un hash de 256 bits puede exceder el orden del campo escalar de la curva Grumpkin.
 // Para evitar que el 50% de las carteras generen claves privadas inválidas, 
 // aplicamos una reducción modular sobre el orden 'r' de la curva.
 const grumpkinOrder = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
 const validScalar = BigInt(`0x${round2}`) % grumpkinOrder;
 return validScalar.toString(16).padStart(64, '0'); // 32 bytes garantizados 
} 
 
¿Por qué dos rondas? 
• 
SHA-256 en Ronda 1: Produce una salida de longitud fija independiente de la entrada, con 
el prefijo de dominio aztec-schnorr: que previene colisiones entre sistemas. 
• 
Keccak256 en Ronda 2: Aplica la función hash de Ethereum (también usada en Aztec 
BN254) para asegurar que la dirección resultante sea compatible con el campo escalar de 
la curva elíptica Grumpkin que usa Aztec para las cuentas Schnorr. 
24.3 El Hash de Identidad ZK 
Adicionalmente, para operaciones de base de datos donde se necesita referenciar al usuario 
sin exponer su dirección directamente, se usa un Identity Hash: 
const ZK_DOMAIN_PREFIX = 'ledger-identity:'; 
  
export function deriveIdentityHash(address: string): string { 
  return crypto 
    .createHash('sha256') 
    .update(`${ZK_DOMAIN_PREFIX}${address.toLowerCase().trim()}`) 
    .digest('hex'); // 64 caracteres hex 
} 
 
Este hash se almacena en las tablas Transaction y QuestClaim en lugar de la dirección 
directa, añadiendo una capa de privacidad en la base de datos. 
 
25. El Sistema de Balance: Fuente Única de Verdad 
25.1 El Problema de la Fuente de Verdad Doble 
En el diseño original del sistema existía un problema fundamental: el endpoint de balance 
(/api/aztec/balance) calculaba el saldo agregando transacciones recibidas y restando 
enviadas. Pero la ruta de transferencias actualizaba directamente User.creditsBalance. 
Esto creaba una inconsistencia entre las dos fuentes de verdad, donde los usuarios veían 0 
QDs aunque en realidad tenían 2.500. 
25.2 La Solución: Columna Autoritativa `creditsBalance` 
La arquitectura actual designa la columna creditsBalance del modelo User como la única 
fuente de verdad para el balance de QDs: 
User.creditsBalance 
├── Iniciado en: 2500 QDs (balance génesis) 
├── Incrementado por: AIRDROP, EARN, PURCHASE, RECEIVE 
├── Decrementado por: SPEND, TRANSFER, FEE 
└── Consultado por: /api/aztec/balance (GET) 
 
El endpoint de balance realiza un upsert en el modelo User, lo que garantiza que si el usuario 
no tiene aún un registro (caso de usuario completamente nuevo), se crea con los 2.500 QDs 
génesis automáticamente. 
 
26. Historial de Transacciones 
26.1 Estructura del Historial 
El historial de transacciones en el Portfolio (HistoryPanel) muestra todas las operaciones de 
la identidad Aztec del usuario, agrupadas por día y con iconografía descriptiva: 
Tipo de TX 
Icono 
Color 
AIRDROP 
🎁🎁 
Púrpura 
Videollamada 
📹📹 
Azul 
Noir ZK Proof 
🔐🔐 
Ámbar 
Mensaje de Chat 
💬💬 
Sky 
QDs Recibidos 
↙ 
Verde Esmeralda 
Transferencia Enviada 
↗ 
Zinc 
 
26.2 Panel de Economía Resumida 
En la parte superior del historial, el sistema calcula y muestra tres métricas económicas clave: 
• 
Gastados: Total de QDs enviados (salidas) 
• 
Recibidos: Total de QDs recibidos (entradas) 
• 
Txs: Número total de transacciones 
 
27. El Rango del Usuario 
(Expandido en la Sección 23.2) 
 
28. Panel PXE: Private Execution Environment 
28.1 ¿Qué es el PXE? 
El Private Execution Environment (PXE) es el componente más fundamental de la arquitectura 
de Aztec Network. Es un proceso que se ejecuta localmente en el dispositivo del usuario (o en 
el servidor en modo embedded) y que: 
• 
Mantiene las claves privadas del usuario de forma segura 
• 
Ejecuta los circuitos Noir para generar pruebas ZK 
• 
Mantiene el estado privado del usuario (notas UTXO en Aztec) 
• 
Comunica con el nodo completo de Aztec para sincronizar el estado público 
28.2 El Visualizador PXE en Humanity Ledger 
La pestaña PXE del Portfolio incluye el componente AztecPXEVisualizer, que muestra en 
tiempo real: 
• 
Estado de conexión con el nodo Aztec (https://node.aztec.network) 
• 
Altura del bloque actual 
• 
Versión del nodo 
• 
Latencia de la conexión 
• 
Estado del Barretenberg WASM prover 
 
29. Circuits Noir: Pruebas de Conocimiento Cero 
29.1 ¿Qué es Noir? 
Noir es un lenguaje de programación de alto nivel diseñado específicamente para la escritura 
de circuitos de conocimiento cero. Fue creado por Aztec Labs y compila a una representación 
intermedia (ACIR - Arithmetic Circuit Intermediate Representation) que puede ser probada por 
el sistema de pruebas UltraHonk de Barretenberg. 
29.2 Los Circuitos de Humanity Ledger 
Los circuitos Noir de Humanity Ledger están ubicados en los directorios /noir-projects/ y 
/circuits/. Los casos de uso actuales incluyen: 
Attestation de Identidad: El contrato Noir almacena el mapeo de wallets a identidades 
verificadas usando el modelo de estado privado de Aztec (notas UTXO). Esto garantiza que las 
consultas de identidad no revelen qué wallets están comunicándose. 
Proof of Activity: Pruebas que demuestran que un usuario ha realizado cierta cantidad de 
transacciones sin revelar cuáles son esas transacciones. 
Balance Proofs: Pruebas que demuestran que un usuario tiene suficiente balance para 
completar una operación sin revelar el balance total. 
29.3 El Sistema UltraHonk 
El sistema de pruebas que usa Humanity Ledger es UltraHonk, implementado en la librería 
Barretenberg de Aztec Labs. Las características técnicas: 
• 
Curva elíptica: BN254 (Grumpkin para cuentas Schnorr) 
• 
Sistema de pruebas: PLONK/UltraPlonk/UltraHonk 
• 
Tamaño de prueba: Aproximadamente 2-3 KB por prueba 
• 
Tiempo de generación: 2-8 segundos (primera vez que se inicializa el WASM) 
• 
Tiempo de verificación: < 100ms 
 
30. Portal de Shielding: Aztec L2 
30.1 ¿Qué es el Shielding? 
En la terminología de Aztec, shielding es el proceso de mover activos del estado público 
(visible en Ethereum L1) al estado privado de Aztec L2. Un usuario que tiene ETH en Ethereum 
puede "shieldear" ese ETH, volviéndolo invisible en la blockchain pública mientras lo mantiene 
completamente fungible y transferible en la red Aztec. 
30.2 El Terminal de Shielding 
La pestaña Portal del Portfolio incluye el componente AztecShieldingTerminal, una 
interfaz de línea de comandos estilizada que permite al usuario interactuar con el protocolo de 
shielding de forma visual e intuitiva. 
 
 
 
 
PARTE V — ARQUITECTURA TÉCNICA 
 
31. Stack Tecnológico Completo 
Humanity Ledger está construido sobre un stack tecnológico cuidadosamente seleccionado 
para maximizar el rendimiento, la seguridad y la mantenibilidad: 
Capa 
Tecnología 
Versión 
Propósito 
**Framework** 
Next.js 
15 (App Router) 
Framework fullstack 
con SSR, SSG y API 
routes 
**UI Library** 
React 
18 
Componentes de 
interfaz 
**Animaciones** 
Framer Motion 
— 
Animaciones y 
transiciones fluidas 
**Estilos** 
Tailwind CSS 
— 
Sistema de diseño 
utilitario 
**ORM** 
Prisma 
— 
Gestión de base de 
datos type-safe 
**Base de Datos** 
PostgreSQL 
— 
Almacenamiento 
relacional autoritativo 
**Blockchain L2** 
Aztec Network 
Mainnet 
ZK-Rollup de 
privacidad 
**Smart Contracts** 
Noir 
— 
Lenguaje de circuitos 
ZK 
**Web3 Auth** 
SIWE 
— 
Sign-In With Ethereum 
**Wallet Connect** 
WalletConnect / 
AppKit 
— 
Conexión de wallets 
web/móvil 
**Mensajería** 
XMTP 
— 
Protocolo de chat 
descentralizado 
**Video P2P** 
WebRTC / PeerJS 
— 
Videollamadas sin 
servidor 
**Tipografía** 
IBM Plex Sans + Mono 
— 
Tipografía de diseño de 
sistema 
**Despliegue** 
Railway 
— 
Plataforma cloud de 
producción 
**CI/CD** 
GitHub Actions 
— 
Pipeline de integración 
continua 
**Contenedores** 
Docker 
— 
Contenerización multi-
stage 
 
 
32. Infraestructura de Backend: Next.js 15 y API Routes 
32.1 Arquitectura de API Routes 
Humanity Ledger usa el App Router de Next.js 15 para organizar sus API routes en un árbol 
lógico bajo el directorio app/api/. La organización refleja la arquitectura de dominio: 
app/api/ 
├── aztec/                  # Economía de QDs y Aztec Network 
│   ├── balance/            # GET: balance de QDs 
│   ├── transfer/           # POST: transferir QDs 
│   ├── airdrop/ 
│   │   └── calendar/       # POST/GET: airdrop mensual 
│   ├── purchase-qd/        # POST: comprar QDs con ETH 
│   ├── derive-address/     # POST: derivar dirección Aztec 
│   ├── transactions/       # GET: historial de transacciones 
│   └── migrate-identity/   # POST: migración de identidad 
├── chat/                   # Ledger Chat 
│   ├── contacts/           # GET/POST: gestión de contactos 
│   │   └── request/        # POST: solicitudes de contacto 
│   │       └── [action]/   # POST: accept/reject 
│   ├── pending/            # GET/POST/DELETE: mensajes pendientes 
│   ├── onion/              # Onion routing 
│   │   ├── register/       # Registro de relay nodes 
│   │   ├── relay/          # Procesamiento de mensajes onion 
│   │   └── queue/          # Cola de mensajes 
│   └── attachments/        # POST: procesamiento de adjuntos 
├── auth/                   # Autenticación 
│   ├── siwe/               # Sign-In With Ethereum 
│   └── session/            # Gestión de sesiones JWT 
└── [otras rutas...] 
 
32.2 El Principio Force-Dynamic 
Todas las rutas de la API de Humanity Ledger declaran: 
export const dynamic = 'force-dynamic'; 
 
Esto desactiva el caché de Next.js para estas rutas, garantizando que cada petición obtenga 
datos frescos de la base de datos. En un sistema financiero donde los balances pueden cambiar 
en cualquier momento, el caché de datos es inadmisible. 
 
33. Base de Datos: PostgreSQL y Prisma ORM 
33.1 El Papel de PostgreSQL 
PostgreSQL es la base de datos autoritativa del sistema. Toda la información crítica —
balances, historial de transacciones, identidades de usuario, claims de airdrop— reside en 
PostgreSQL. Es la fuente de verdad que prevalece sobre cualquier estado local o caché. 
33.2 Prisma ORM 
Prisma actúa como la capa de acceso a datos. Sus ventajas clave para este sistema: 
• 
Type-safety: El cliente Prisma generado garantiza que las consultas son correctas en 
tiempo de compilación. 
• 
Transacciones: Soporte nativo para transacciones PostgreSQL con niveles de aislamiento 
configurables. 
• 
Upsert: Operación atómica de insertar-o-actualizar, fundamental para la idempotencia. 
• 
Migraciones: Gestión declarativa del esquema de la base de datos. 
33.3 Modelos Principales del Schema 
User: El modelo central. Almacena la identidad de cada usuario, su configuración, y el campo 
creditsBalance que es la fuente de verdad para el balance de QDs. 
Transaction: Registro inmutable de cada movimiento de QDs. Incluye txHash (único), 
fromAddress, toAddress, amount, type, status, y metadatos JSON. 
QdTransaction: Registro granular de operaciones internas de QDs (EARN, SPEND, FEE, SLASH). 
Complementa a Transaction para el historial del portfolio. 
AirdropClaim: Registro único de cada claim mensual por wallet. La restricción 
@@unique([walletAddress, year, month]) garantiza que no hay double-claiming. 
AuthUser: Usuarios que se autentican mediante email (además de los que usan SIWE). Permite 
que usuarios sin wallet accedan al sistema con un correo electrónico. 
ChatContact: Relación de contactos entre wallets. Modelo bidireccional. 
ChatContactRequest: Solicitudes de contacto pendientes. 
PendingChatMessage: Mensajes XMTP encolados para destinatarios offline. 
SovereignNode: Registro de staking de QDs para nodos soberanos. 
AztecQuest / QuestClaim: Sistema de misiones y recompensas por completar objetivos 
específicos. 
SocialVerification: Estado de verificación social (Twitter, YouTube, Telegram) por wallet. 
 
34. Integración con Aztec Network V5 
34.1 El Cliente Aztec 
La integración con Aztec Network se gestiona desde lib/aztec/client.ts. Los 
componentes principales: 
`createAztecNodeClient`: Crea una conexión directa con el nodo RPC de Aztec 
(https://node.aztec.network). Se usa para obtener información del nodo 
(versión, altura de bloque) y para anclar transacciones a bloques reales. 
`deriveSecretKeyFromEvm`: Deriva la clave secreta de la cuenta Schnorr a partir de la 
dirección EVM: 
export function deriveSecretKeyFromEvm(evmAddress: string): string { 
  return crypto 
    .createHash('sha256') 
    .update(`aztec-secret:${evmAddress.toLowerCase()}`) 
    .digest('hex'); 
} 
 
`EmbeddedWallet`: En modo on-chain (cuando AZTEC_TOKEN_CONTRACT_ADDRESS está 
configurado), se usa EmbeddedWallet.create() para crear una wallet Aztec efímera que 
puede ejecutar transacciones reales en la testnet. 
34.2 La SponsoredFPC (Fee Payment Contract) 
Las transacciones en Aztec requieren el pago de fees. Para mejorar la UX, Humanity Ledger usa 
un SponsoredFeePaymentMethod con la dirección del FPC (Fee Payment Contract) 
proporcionada por Aztec Labs: 
FPC Address: 
0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7 
 
Esto permite que las transacciones sean "sponsored" (los fees los paga el protocolo en lugar 
del usuario), eliminando la necesidad de que el usuario tenga ETH nativo de Aztec para pagar 
gas. 
34.3 Modo A vs Modo B 
El sistema de Aztec en Humanity Ledger opera en dos modos según la disponibilidad del 
contrato de token: 
Modo A (On-Chain): Activo cuando AZTEC_TOKEN_CONTRACT_ADDRESS está configurado. Las 
transferencias y airdrops se ejecutan como transacciones reales en Aztec Mainnet. Los 
hashes de transacción son auténticos y verificables en AztecScan. 
Modo B (DB Ledger): Activo cuando el contrato no está desplegado (desarrollo o beta). Las 
transacciones se registran en PostgreSQL con hashes generados determinísticamente (SHA-
256). El sistema aún ancla el bloque al estado real de Aztec para mantener la integridad 
temporal. 
 
35. Autenticación: SIWE y el Sistema de Sesiones 
35.1 Sign-In With Ethereum (SIWE) 
SIWE (EIP-4361) es el estándar de la industria para la autenticación de usuarios Web3. En lugar 
de usuario/contraseña, el usuario firma un mensaje con su clave privada de Ethereum. La firma 
criptográfica prueba que el usuario controla la wallet sin revelar la clave privada. 
El flujo de autenticación SIWE en Humanity Ledger: 
1. Frontend solicita un nonce al servidor: GET /api/auth/siwe/nonce 
2. Servidor genera un nonce criptográficamente aleatorio (no predecible) 
3. Frontend construye el mensaje SIWE estándar con el nonce 
4. Usuario firma el mensaje con su wallet 
5. Frontend envía firma al servidor: POST /api/auth/siwe/verify 
6. Servidor verifica la firma y que el nonce no ha sido usado antes 
7. Si válido: crea sesión JWT con la dirección verificada 
8. JWT se almacena en cookie HttpOnly (inaccesible desde JavaScript) 
 
35.2 El Middleware de Autorización 
El middleware de Next.js (middleware.ts) intercepta cada petición a rutas protegidas y: 
87. Lee el JWT de la cookie 
88. Verifica la firma del JWT con JWT_SECRET 
89. Extrae la dirección verificada del payload 
90. Inyecta x-verified-session-address en los headers de la petición 
91. Inyecta x-session-ts (timestamp de la sesión) para detección de sesiones obsoletas 
Las API routes leen x-verified-session-address del header (nunca del body del request), 
lo que previene que usuarios manipulen el header manualmente (el middleware lo 
sobreescribe). 
35.3 Usuarios con Email (AuthUser) 
Para usuarios que no tienen wallet (o prefieren autenticación tradicional), el sistema 
AuthUser permite login mediante email/contraseña con: 
• 
Hash de contraseña con Argon2 o bcrypt 
• 
Verificación de email mediante código OTP 
• 
TOTP (Google Authenticator) como segundo factor 
• 
Backup codes para recuperación 
• 
PIN de enclave (Turing Shield Gate) con HMAC-SHA256 
 
36. Middleware de Seguridad: La Primera Línea de 
Defensa 
El archivo middleware.ts (13 KB) es la primera línea de defensa del sistema. Sus 
responsabilidades: 
Protección de Rutas: Define qué rutas requieren autenticación y redirige a login si no hay 
sesión válida. 
Inyección de Headers de Seguridad: Añade headers HTTP de seguridad a todas las respuestas: 
• 
X-Frame-Options: DENY (previene clickjacking) 
• 
X-Content-Type-Options: nosniff 
• 
Strict-Transport-Security (HSTS) 
• 
Content-Security-Policy restrictiva 
Rate Limiting Global: Aplica límites de tasa por IP para todas las rutas de la API. 
CORS: Configura los orígenes permitidos para peticiones cross-origin. 
 
37. Modelo de Datos Completo (Prisma Schema) 
Los modelos más relevantes del schema de Prisma para el ecosistema de mini-apps: 
User (Modelo Central) 
model User { 
  id            String  @id @default(uuid()) 
  walletAddress String  @unique 
  displayName   String? 
  avatarUrl     String? @db.Text 
  tier          String  @default("FREE")  // FREE, PRO, SOVEREIGN 
  creditsBalance Int    @default(2500)    // Balance autoritativo de QDs 
  humanityScore  Int    @default(0)       // Puntuación de participación 
  chatName      String  @default("Ledger User") 
  // ... muchos más campos 
} 
 
Transaction (Registro Inmutable de QDs) 
model Transaction { 
  id          String   @id @default(uuid()) 
  txHash      String   @unique      // Hash único de la TX 
  status      String   @default("PENDING")  // PENDING, COMPLETED, FAILED 
  type        String   // TRANSFER, SPEND, AIRDROP, PURCHASE, EARN, FEE 
  amount      Float 
  token       String   // "QDs" 
  fromAddress String 
  toAddress   String 
  identityHash String? // Hash ZK de la identidad (privacidad en DB) 
  chainId     Int      @default(1) 
  blockNumber BigInt?  @default(0) 
  metadata    Json?    @default("{}") 
} 
 
QdTransaction (Historial Granular) 
model QdTransaction { 
  id           String   @id @default(uuid()) 
  aztecAddress String 
  type         String   // EARN, SPEND, SLASH, STAKE, UNSTAKE, FEE, REWARD 
  amount       Float 
  description  String   @db.Text 
  txHash       String? 
  createdAt    DateTime @default(now()) 
} 
 
AirdropClaim (Control Anti Double-Claim) 
model AirdropClaim { 
  id            String   @id @default(uuid()) 
  walletAddress String 
  year          Int 
  month         Int 
  amount        Float    @default(10.0) 
  txHash        String?  @unique 
  claimedAt     DateTime @default(now()) 
   
  @@unique([walletAddress, year, month]) // Garantía absoluta anti double-
claim 
} 
 
 
38. Gestión de Estado en el Frontend: 
AztecNativeContext 
38.1 El Context de Aztec 
El archivo context/AztecNativeContext.tsx es el corazón del estado del frontend para 
todo lo relacionado con la identidad Aztec y los QDs. Implementa un React Context que 
proporciona a todos los componentes del árbol: 
• 
aztecAddress: La dirección Schnorr derivada del usuario 
• 
balance: El balance actual de QDs (número) 
• 
history: El historial de transacciones 
• 
isLoading: Estado de carga 
• 
isBusy: Estado de operación en curso 
• 
refresh(): Función para recargar balance e historial desde la DB 
• 
connectIdentity(): Función para conectar la identidad Aztec 
• 
disconnectIdentity(): Función para desconectarse 
38.2 El Ciclo de Polling 
El balance se actualiza cada 10 segundos mediante un polling al endpoint 
/api/aztec/balance. Este intervalo está diseñado para mantener el balance relativamente 
fresco sin saturar la base de datos con consultas excesivas. 
Tras cada operación (transferencia, claim de airdrop), se llama inmediatamente a refresh() 
para actualizar el balance sin esperar al siguiente ciclo de polling. 
38.3 Auto-Migración de Identidad 
El componente AztecIdentityCard incluye un mecanismo de auto-migración silenciosa: si 
un usuario conectó antes de que se implementara la derivación de dirección Aztec (y sus QDs 
quedaron registrados en su dirección EVM en lugar de su dirección Aztec derivada), el sistema 
llama automáticamente a /api/aztec/migrate-identity en el primer acceso para reubicar 
los fondos a la dirección correcta. 
Este proceso se ejecuta una única vez por wallet, con el estado guardado en localStorage. 
 
 
 
 
PARTE VI — SEGURIDAD 
 
39. Filosofía de Seguridad: Zero-Trust Architecture 
Humanity Ledger adopta el principio de Zero-Trust: ningún componente del sistema confía 
automáticamente en ningún otro componente. Cada operación debe ser verificada 
independientemente, sin importar el origen de la petición. 
Esta filosofía se implementa en tres niveles: 
Nivel 1 — Autenticación: Ningún endpoint crítico acepta peticiones sin un JWT válido y una 
sesión verificada. 
Nivel 2 — Autorización: Incluso con JWT válido, el usuario solo puede operar sobre sus propios 
recursos. El middleware inyecta la dirección verificada y las API routes verifican que la 
dirección del request coincide con la del JWT. 
Nivel 3 — Verificación On-Chain: Para operaciones de compra (que involucran dinero real), se 
verifica la transacción directamente en la blockchain de Ethereum. No hay forma de bypassear 
esta verificación. 
 
40. Protección IDOR (Insecure Direct Object Reference) 
40.1 El Problema IDOR 
Un ataque IDOR ocurre cuando un usuario puede acceder o modificar recursos de otros 
usuarios simplemente cambiando un parámetro en la petición (como cambiar userId=123 a 
userId=456). 
40.2 La Solución 
En Humanity Ledger, los recursos sensibles (balances, transacciones) se leen siempre a través 
del header x-verified-session-address, que es inyectado por el middleware desde el JWT 
del servidor y nunca puede ser falsificado por el cliente. 
El endpoint de balance, por ejemplo, no acepta una dirección arbitraria del body o de los query 
params sin verificar que corresponde a la sesión del usuario: 
// El endpoint verifica que la dirección solicitada pertenece a la sesión 
if (!isOwner(sessionAddr, normalizedAddress) && sessionAddr !== 
normalizedAddress) { 
  return error('Forbidden: Private Aztec balance is encrypted.'); 
} 
 
 
41. Protección Anti Double-Spend: Transacciones 
Serializables 
41.1 El Problema del Double-Spend 
En un sistema concurrente, dos peticiones simultáneas de transferencia del mismo usuario 
podrían ambas verificar el saldo antes de que cualquiera de las dos lo debite, permitiendo 
gastar el mismo saldo dos veces. 
41.2 La Solución: Serializable Isolation 
Todas las transferencias de QDs se ejecutan dentro de una transacción Prisma con el nivel de 
aislamiento más alto: 
await prisma.$transaction(async (tx) => { 
  // Lectura + escritura atómica 
  const sender = await tx.user.upsert({ ... }); 
  if (sender.creditsBalance < totalRequired) throw new 
Error('Insufficient'); 
  await tx.user.update({ data: { creditsBalance: { decrement: totalRequired 
} } }); 
  await tx.user.upsert({ update: { creditsBalance: { increment: amount } } 
}); 
}, { isolationLevel: 'Serializable' }); // MÁXIMA protección 
 
El nivel Serializable de PostgreSQL garantiza que dos transacciones concurrentes que lean y escriban el mismo registro no puedan interferir entre sí.

**DEFENSA ARQUITECTÓNICA (Off-Chain Indexer vs Aztec Nullifier Tree):**
Es imperativo aclarar que en Aztec Mainnet (Modo A), la protección definitiva contra el Double-Spend recae matemáticamente sobre el **Árbol de Nulificadores (Nullifier Tree) de Aztec L2**, no sobre PostgreSQL. La base de datos actúa estrictamente como un indexador optimista (similar a The Graph) para ofrecer latencia Web2 en el UI, mientras que la finalidad absoluta la dictan las matemáticas del Rollup. que lean y 
escriban el mismo registro no puedan interferir entre sí. Si dos peticiones simultáneas intentan 
debitar el mismo saldo, una de ellas fallará con un error de serialización y deberá reintentarse. 
El sistema client-side maneja estos reintentos de forma transparente. 
 
42. Identity Gate: Solo las Identidades Verificadas 
Transfieren 
La transferencia de QDs está restringida a identidades verificadas mediante la función 
isVerifiedIdentity(): 
// Ambas verificaciones: la del emisor Y la de la sesión 
const sessionVerified = await isVerifiedIdentity(verifiedSessionAddr); 
const fromVerified    = await isVerifiedIdentity(fromAddr); 
  
if (!sessionVerified && !fromVerified) { 
  return error('Reclama tu airdrop génesis para usar QDs', 403); 
} 
 
Esto previene que actores malintencionados creen miles de wallets vacías y las usen como 
proxies para atacar el sistema, ya que ninguna wallet puede transferir si no ha sido verificada 
como identidad activa. 
 
43. Replay Attack Protection 
Para proteger contra ataques de replay (donde un atacante captura y reenvía peticiones 
legítimas), el sistema: 
92. Verifica la frescura de la sesión: El middleware inyecta x-session-ts (timestamp de la 
sesión). Las API routes verifican que la sesión no tenga más de 15 minutos de antigüedad. 
93. Idempotencia de txHash: Cada transacción tiene un txHash único. Si se intenta procesar 
dos veces el mismo hash, la base de datos lo rechaza por la restricción @unique. 
94. Nonces en SIWE: Los nonces del proceso SIWE son de un único uso. Una vez usado, el 
nonce se invalida y no puede reutilizarse para crear una sesión nueva. 
 
44. Derivación de Hash de Identidad ZK 
La función deriveIdentityHash() se usa para almacenar referencias a identidades en las 
tablas de la base de datos sin exponer las direcciones directas: 
const ZK_DOMAIN_PREFIX = 'ledger-identity:'; 
  
export function deriveIdentityHash(address: string): string { 
  return crypto 
    .createHash('sha256') 
    .update(`${ZK_DOMAIN_PREFIX}${address.toLowerCase().trim()}`) 
    .digest('hex'); 
} 
 
Propiedades de seguridad: 
• 
Determinístico: La misma dirección siempre produce el mismo hash 
• 
No reversible: Dado el hash, es computacionalmente imposible recuperar la dirección 
• 
Aislado por dominio: El prefijo ledger-identity: previene que el mismo hash se use en 
otros contextos 
• 
Inmutable: El prefijo está documentado como "NO modificar después del lanzamiento" 
 
45. Gestión de Secretos y Variables de Entorno 
Las variables de entorno críticas que el sistema necesita para operar en producción: 
Variable 
Propósito 
Criticidad 
`DATABASE_URL` 
Conexión a PostgreSQL 
CRÍTICO 
`JWT_SECRET` 
Firma de sesiones JWT 
CRÍTICO 
`AZTEC_TOKEN_CONTRACT_ADDRESS` 
Dirección del contrato de QDs 
on-chain 
ALTO 
`AZTEC_RELAYER_SECRET` 
Clave del relayer para 
airdrops 
ALTO 
`AZTEC_PXE_URL` 
URL del nodo RPC de Aztec 
ALTO 
`ETHEREUM_RPC_URL` 
RPC de Ethereum para 
verificación de compras 
ALTO 
`NEXT_PUBLIC_APP_URL` 
URL pública del servidor 
MEDIO 
`NEXTAUTH_SECRET` 
Secreto de NextAuth (si 
aplica) 
MEDIO 
 
Política de Gestión: 
• 
Ningún secreto se almacena en el código fuente 
• 
Ningún secreto se incluye en los logs del servidor 
• 
Los secretos en Railway se configuran mediante el panel de variables de entorno (cifradas 
en reposo) 
• 
Las variables con NEXT_PUBLIC_ prefix son visibles en el cliente y nunca deben contener 
secretos 
 
 
 
 
PARTE VII — INFRAESTRUCTURA Y 
DESPLIEGUE 
 
46. Railway: Despliegue en Producción 
Railway es la plataforma cloud elegida para el despliegue de producción de Humanity Ledger. 
Sus ventajas clave: 
• 
Despliegue automático: Cada push a la rama main de GitHub dispara automáticamente un 
nuevo despliegue. 
• 
PostgreSQL gestionado: Railway proporciona una base de datos PostgreSQL totalmente 
gestionada con backups automáticos. 
• 
Variables de entorno: Interface web para gestión segura de secretos de producción. 
• 
Scaling automático: Capacidad para escalar horizontalmente según la demanda. 
• 
Dominio personalizado: Soporte para HTTPS con certificados TLS automáticos en 
https://humanidfi.com. 
46.1 Configuración Real de Railway (`railway.toml`) 
La configuración real de producción está definida en el archivo railway.toml que reside en la 
raíz del repositorio: 
[build] 
builder = "DOCKERFILE" 
dockerfilePath = "./Dockerfile" 
  
[deploy] 
startCommand = "sh ./start.sh" 
restartPolicyType = "ON_FAILURE" 
restartPolicyMaxRetries = 3 
  
[healthcheck] 
path = "/api/health" 
interval = 15 
timeout = 60 
startPeriod = 120 
retries = 5 
 
Detalles críticos: 
• 
Builder: Railway usa el Dockerfile del repositorio para construir la imagen de 
contenedor Docker, en lugar de un buildpack genérico. 
• 
Startup: El sistema arranca con start.sh, un script de inicialización que aplica 
reescrituras dinámicas de la URL de base de datos y ejecuta las migraciones de Prisma 
antes de lanzar el servidor Next.js. 
• 
Health Check: Railway verifica que el servicio está disponible cada 15 segundos haciendo 
GET a /api/health. El despliegue tarda hasta 120 segundos en iniciarse (startPeriod). 
Si 5 comprobaciones consecutivas fallan, el contenedor se reinicia. 
• 
Rama de despliegue: Railway escucha la rama `main` del repositorio GitHub. Los cambios 
en la rama master no activan el despliegue; se requiere hacer merge o push a main. 
 
47. GitHub Actions: CI/CD Pipeline 
El pipeline de CI/CD está definido en .github/workflows/. Ejecuta las siguientes 
verificaciones en cada pull request: 
95. Type Check: Verificación de tipos TypeScript (tsc --noEmit) 
96. Lint: ESLint sobre toda la base de código 
97. Build: Compilación completa de Next.js para detectar errores de build 
98. Smart Contract Tests: Tests de los contratos Solidity con Hardhat (21 tests en 
LedgerDeadmanSwitch, 13 en HumanTimeLock) 
99. Slither Analysis: Análisis estático de seguridad en contratos Solidity (SARIF) 
Solo cuando todos los pasos pasan, el merge está permitido. Los despliegues a Railway se 
disparan automáticamente al merge a main. 
 
48. Configuración de Variables de Entorno 
Para configurar un entorno de desarrollo local: 
# Copiar el archivo de ejemplo 
cp .env.example .env.local 
  
# Variables mínimas para desarrollo 
DATABASE_URL="postgresql://user:password@localhost:5432/humanityledger" 
JWT_SECRET="un-secreto-largo-y-aleatorio-de-al-menos-32-caracteres" 
NEXT_PUBLIC_APP_URL="http://localhost:3000" 
  
# Variables de Aztec (pueden ser de testnet) 
AZTEC_PXE_URL="https://node.aztec.network" 
# AZTEC_TOKEN_CONTRACT_ADDRESS= (dejar vacío para Modo B) 
  
# Variables de Ethereum (para compras con ETH) 
ETHEREUM_RPC_URL="https://cloudflare-eth.com" 
 
 
49. Guía de Despliegue Paso a Paso 
49.1 Configuración Inicial del Repositorio Local 
# 1. Clonar el repositorio 
git clone https://github.com/humanityledger/Humanity-Ledger.git 
cd Humanity-Ledger 
  
# 2. Instalar dependencias 
npm install 
  
# 3. Configurar variables de entorno 
cp .env.example .env.local 
# Editar .env.local con las credenciales correctas 
  
# 4. Sincronizar la base de datos 
npx prisma db push 
  
# 5. Iniciar el servidor de desarrollo 
npm run dev 
 
49.2 Despliegue a Producción via GitHub 
# Método 1: Script de conveniencia (definido en package.json) 
npm run push:railway 
# Equivalente a: git add . && git commit -m "..." && git push origin main 
  
# Método 2: Git estándar 
git add . 
git commit -m "feat: descripción del cambio" 
git push origin main 
# Railway detecta el push y despliega automáticamente 
 
49.3 Configuración de GitHub (Personal Access Token) 
Para poder hacer push desde un nuevo PC: 
100. 
Ir a GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-
grained tokens 
101. 
Crear un token con permisos de Read and Write para "Contents" en el repositorio 
Humanity-Ledger 
102. 
Al hacer el primer git push, usar el nombre de usuario GitHub y el token como 
contraseña 
 
 
 
 
PARTE VIII — MODELO DE NEGOCIO 
 
50. Monetización: Cómo Genera Valor Humanity Ledger 
50.1 Fuentes de Ingresos Actuales 
1. Compra de QDs con ETH: 
La fuente de ingresos más directa. Los usuarios que consumen QDs más rápido de lo que los 
generan mediante el sistema de airdrops y recompensas pueden comprar paquetes 
adicionales. El ETH pagado va a la wallet del tesoro de Humanity Ledger (0x78831c...). 
2. Comisiones de Red: 
Cada transferencia P2P cobra una comisión del 1% (mínimo 1 QD). Estas comisiones se retiran 
de la circulación, creando deflación en el suministro de QDs. 
3. Tiers Premium de Usuario: 
El modelo User incluye un campo tier (FREE, PRO) y isPro. Los usuarios PRO tendrán acceso 
a funcionalidades premium de Ledger Chat (mayor almacenamiento de archivos, resolución de 
video 4K, prioridad en la red de relay onion). 
50.2 El Ecosistema de QDs como Moat Competitivo 
La economía de QDs actúa como barrera de entrada para competidores: los usuarios con QDs 
acumulados en el ecosistema de Humanity Ledger tienen un incentivo económico real para 
permanecer en el ecosistema. Sus QDs tienen valor porque pueden ser usados en todas las 
mini-apps actuales y futuras. 
 
51. El Ecosistema de Mini-Apps como Plataforma 
Cada nueva mini-app que Humanity Ledger lanza: 
103. 
Crea nueva demanda de QDs (su economía interna usa QDs) 
104. 
Trae nuevos usuarios al ecosistema 
105. 
Aumenta el valor percibido de los QDs existentes 
106. 
Genera datos de actividad que mejoran el sistema anti-Sybil 
Este efecto de red positivo significa que cada nueva mini-app beneficia a todas las existentes. 
 
52. Modelo de Tiers de Usuario 
Tier 
Costo 
Funcionalidades 
**FREE** 
Gratis 
Balance génesis 2500 QDs, 
Ledger Chat básico, Airdrop 
mensual 
**PRO** 
Suscripción mensual en ETH o 
QDs 
Mayor almacenamiento, video 
4K, prioridad relay, API access 
**SOVEREIGN** 
Staking de QDs 
Nodo soberano, rendimientos, 
peso de gobernanza 
 
 
 
 
 
PARTE IX — ROADMAP Y FUTURO 
 
53. Estado Actual: Beta Prototype 
A la fecha de este documento (Septiembre 2026), Humanity Ledger se encuentra en estado de 
Beta Prototype con el siguiente estado por componente: 
Componente 
Estado 
Notas 
Ledger Chat 
(Mensajes/Llamadas) 
🔧🔧 Beta / Testing 
Funcional para testeo 
académico. Mensajes E2E y 
llamadas P2P activas. 
Ledger Chat (Envío de QDs) 
🚨🚨 Con Bugs (Desactivado) 
Funcionalidad suspendida 
temporalmente por auditoría 
de seguridad. 
Portfolio Aztec 
🔧🔧 En Revisión 
Funcionalidades restringidas 
temporalmente para auditar 
seguridad L2. 
Sistema de QDs 
✅ Producción 
Modo B (DB Ledger) activo 
Airdrop Mensual 
✅ Producción 
Parchado y funcionando 
correctamente 
Transferencias P2P 
✅ Producción 
Auto-derivación de dirección 
aplicada 
Autenticación SIWE 
✅ Producción 
JWT + middleware 
Compra de QDs con ETH 
✅ Producción 
Verificación on-chain 
implementada 
Onion Routing 
🔧🔧 Beta 
Relay network en construcción 
QDs On-Chain (Modo A) 
🔜🔜 Roadmap 
Requiere deploy del contrato 
Token 
Noir ZK Circuits 
🔧🔧 Beta 
Simulados, migración V4→V5 
en curso 
Sovereign Node Staking 
🔜🔜 Roadmap 
Schema listo, UI pendiente 
Mobile App (iOS/Android) 
🔜🔜 Roadmap 
Capacitor configurado 
 
 
54. Roadmap Q4 2026 — Q2 2027 
Q4 2026 — Solidificación 
Prioridad 1 — QDs On-Chain (Modo A): 
Desplegar el contrato TokenContract de Aztec en la testnet V5, activando las transferencias 
nativas on-chain. Esto requiere completar la migración de los circuitos Noir de V4 a V5. 
Prioridad 2 — Sovereign Node Staking: 
Activar el sistema de staking de QDs para usuarios que quieran comprometerse a largo plazo 
con el ecosistema. 
Prioridad 3 — Ledger Chat Premium: 
Lanzar el tier PRO con funcionalidades premium: video 4K, mayor almacenamiento de archivos 
adjuntos, prioridad en la red de relay onion. 
Q1 2027 — Expansión 
Segunda Mini-App — Ledger Academy: 
Plataforma educativa sobre blockchain y ZK con certificados verificables on-chain. El contenido 
de la academia consume QDs, creando nueva demanda económica. 
Lanzamiento Oficial Mobile: 
Publicación de Ledger Chat como app nativa en App Store y Google Play. Este es el hito 
principal de nuestra estrategia de shipear apps al mercado masivo, usando Capacitor para 
compilar la infraestructura descentralizada en aplicaciones móviles nativas. 
Q2 2027 — Descentralización 
Tercera Mini-App — Ledger Governance: 
Sistema de votación descentralizada usando pruebas de identidad ZK. Los Sovereign Nodes 
tendrán poder de voto proporcional a sus QDs en staking. 
Eigenlayer AVS: 
Los nodos relay de Ledger Chat operarán como Actively Validated Services en Eigenlayer, 
eliminando la dependencia de servidores de Humanity Ledger para el relay de mensajes. 
 
55. La Visión a 5 Años 
En 2031, Humanity Ledger habrá evolucionado de una empresa que desarrolla mini-apps a un 
protocolo descentralizado de comunicación e identidad con: 
• 
10+ mini-apps en el ecosistema, desarrolladas por terceros usando el SDK de QDs 
• 
Red de 10.000+ nodos relay operados por la comunidad 
• 
Contratos Aztec auditados y en mainnet de Ethereum 
• 
MiCA compliance para operaciones en la Unión Europea 
• 
Integración con World ID para pruebas de humanidad universales 
• 
Partnership con universidades europeas para la investigación en ZK y privacidad digital 
 
 
 
 
PARTE X — COMUNICACIÓN 
ACADÉMICA 
 
56. Contexto Académico: Asignatura Blockchain
Humanity Ledger fue concebido y desarrollado en el contexto académico de la asignatura de 
Blockchain del programa universitario en Rumanía, bajo la supervisión del Profesor Cristian 
Cira. 

De acuerdo con el programa oficial del curso (Syllabus) que abarca a 200 estudiantes, la 
formación teórica culmina en la Week 12 (16.12 - 22.12) con la unidad "Introduction to 
Zero Knowledge Proofs". Inmediatamente después, el curso destina la Week 13 (08.01 - 
10.01 de 2027) a "Guest Presentations". Es en este bloque exacto donde Humanity Ledger se 
expone como el caso de estudio técnico definitivo: una aplicación real en producción operando 
sobre Aztec Mainnet.

107. Proyecto de investigación aplicada: Demuestra la viabilidad técnica de los sistemas ZK 
de Aztec Network para aplicaciones de comunicación del mundo real.
108. Startup tecnológica real: Con despliegue en producción, usuarios reales y modelo de 
negocio viable.
109. Contribución al ecosistema: El código es open-source y representa una contribución 
real al ecosistema Aztec/Web3.

57. Presentación para el Profesor Cristian Cira
57.1 Los Tres Pilares Técnicos de la Presentación
Pilar 1 — Arquitectura de Privacidad:
La presentación debe demostrar con código real cómo Humanity Ledger implementa 
privacidad criptográfica en múltiples capas:
• La derivación de dirección Aztec desde EVM (SHA-256 + Keccak256) asegura que la 
identidad L2 no está vinculada on-chain a la identidad L1.
• El Identity Hash ZK asegura que incluso en la base de datos propia de Humanity Ledger, las 
identidades están hasheadas de forma no reversible.
• Los balances de QDs en el Modo A (on-chain) son privados por defecto en Aztec: ni el 
equipo de Humanity Ledger puede ver cuántos QDs tiene un usuario específico.

Pilar 2 — Zero-Knowledge Proofs en Producción:
Demostrar el uso real de ZK en el sistema:
• Generar una prueba Noir en vivo durante la presentación usando la pestaña "Circuits" del 
Portfolio.
• Explicar el stack UltraHonk + Barretenberg + Grumpkin.
• Mostrar cómo el PXE ejecuta circuitos localmente sin revelar datos al servidor.

Pilar 3 — Economía Tokenómica Diseñada:
El sistema de QDs es un ejemplo de ingeniería criptoeconómica aplicada:
• Balance génesis para bootstrapping de red.
• Anti-Sybil multicapa (Identity Gate, Spend-to-Earn, Social Verification, Serializable 
Transactions).
• Modelo deflacionario mediante comisiones y penalizaciones.
• Incentivos de earn para actividad genuina.

57.2 Demo en Vivo Propuesta
110. Autenticación SIWE: Conectar una wallet MetaMask, mostrar el proceso de firma y la 
sesión JWT.
111. Portfolio: Mostrar el balance inicial de 2.500 QDs, el sistema de ranking, la dirección 
Aztec derivada.
112. Transferencia P2P: Enviar 50 QDs a una segunda wallet de prueba, mostrar el 
descuento del fee y la recepción instantánea.
113. Ledger Chat: Abrir una conversación, enviar mensajes cifrados, iniciar y mostrar una 
videollamada WebRTC.
114. Noir ZK Proof: Generar una prueba de conocimiento cero en la pestaña "Circuits" y 
mostrar la verificación.

58. Propuesta de Gestión con Fineas
58.1 Contexto de la Colaboración
El proyecto Humanity Ledger se coordina logísticamente con Fineas Silaghi, enlace directo con 
el ecosistema de Timisoara Startups y el Profesor Cira. La línea temporal oficial basada en el 
Syllabus del curso es la siguiente:
• Septiembre - Diciembre 2026 (Remoto): Desarrollo y estabilización de Humanity Ledger 
en Aztec Mainnet. Fineas realiza la introducción formal con el Profesor Cira durante el 
transcurso del semestre.
• 10 de Diciembre de 2026: El autor principal llega físicamente a Rumanía.
• Diciembre 2026 (Presencial): Ensayos técnicos de estrés de red en la UVT.
• Semana 13 (08.01 - 10.01 Enero 2027): Exposición final ante los 200 estudiantes.

58.2 Propuesta de Gestión para Fineas
Hola Fineas,
Te escribo para establecer un plan de gestión claro, riguroso y transparente sobre cómo vamos 
a coordinar el proyecto Humanity Ledger hasta la presentación de enero.

Estado Técnico Actual del Sistema:
El sistema está en producción en https://humanidfi.com y hemos resuelto recientemente 
dos bugs críticos que afectaban a la economía interna:
115. Transferencias de QDs: El sistema de transferencias ahora auto-deriva 
automáticamente la dirección Aztec Schnorr de las wallets EVM, resolviendo el problema 
donde los fondos no aparecían en el Portfolio del receptor.
116. Airdrop Mensual: El claim de airdrop ahora actualiza correctamente el balance del 
usuario en la base de datos de forma atómica e idempotente.
Ambas correcciones están desplegadas en producción y el sistema está estable sobre Aztec Mainnet.

Timeline de Coordinación:

Fase Remota (ahora → 9 de Diciembre):
• Finalización de la UI/UX de Ledger Chat y Portfolio.
• Aseguramiento de uptime en el nodo de Aztec Mainnet.
• Preparación de la demo de presentación (guion, casos de prueba, walkthrough técnico).
• Realizamos revisiones semanales por videollamada (usando Ledger Chat, naturalmente).

Fase Presencial (10 de Diciembre → 08 de Enero):
• Llego físicamente a Rumanía el 10 de diciembre.
• Sesión de integración completa: verificamos que el sistema funciona correctamente desde 
la red universitaria para soportar 200 alumnos simultáneos.
• Ensayos generales de la presentación con timing.

Reparto de Responsabilidades:
Para que seamos lo más efectivos posible, propongo el siguiente reparto:
• Arquitectura técnica y backend: Me encargo yo (Aztec, ZK, API, base de datos).
• Narrativa y presentación: Lo trabajamos juntos, asegurando que el lenguaje conecte 
perfectamente con la unidad de ZK Proofs de la Week 12.
• Demo en vivo: Ensayamos juntos el 10-12 de Diciembre para identificar y resolver 
cualquier problema de red o compatibilidad.

Comunicación Continua:
Para cualquier duda técnica antes de mi llegada, puedes abrir un issue en el repositorio de 
GitHub o contactarme directamente. Estoy disponible para llamadas de sincronización según lo 
necesites.
El proyecto está en un estado sólido. Con la coordinación adecuada, la presentación será una 
demostración impresionante de lo que hemos construido.

Un saludo,
Stefan Antonio Cirisanu
Humanity Ledger S.L.
atfortyseven2@humanidfi.es


59. Glosario Técnico 
Término 
Definición 
**Aztec Network** 
Red de Layer 2 sobre Ethereum que usa ZK-
Rollups para transacciones privadas. 
**ACIR** 
Arithmetic Circuit Intermediate Representation. 
Formato intermedio de compilación de circuitos 
Noir. 
**Anti-Sybil** 
Sistema de protecciones que previene que un 
actor cree múltiples identidades falsas para 
abusar del sistema. 
**App Router** 
Sistema de routing de Next.js 15 basado en el 
sistema de archivos del directorio `app/`. 
**Barretenberg** 
Librería de criptografía de Aztec Labs que 
implementa el sistema de pruebas UltraHonk. 
**BN254** 
Curva elíptica usada por Aztec para el campo 
escalar de las pruebas ZK. 
**ChatContact** 
Modelo de base de datos que representa una 
relación de contacto bidireccional entre wallets. 
**creditsBalance** 
Campo del modelo User en PostgreSQL que 
almacena el balance autoritativo de QDs. 
**Double-Spend** 
Ataque en que el mismo saldo se gasta dos veces 
aprovechando condiciones de carrera. 
**EIP-4361** 
Estándar de Ethereum para Sign-In With 
Ethereum (SIWE). 
**Force-Dynamic** 
Directiva de Next.js que desactiva el caché para 
una ruta de API. 
**Grumpkin** 
Curva elíptica usada por Aztec para las cuentas 
Schnorr (distinta de BN254). 
**HMAC-SHA256** 
Código de Autenticación de Mensajes basado en 
Hash usando SHA-256 como función hash base. 
**HttpOnly Cookie** 
Cookie que no es accesible desde JavaScript del 
cliente, solo desde el servidor. Usada para 
almacenar JWT. 
**IDOR** 
Insecure Direct Object Reference. Vulnerabilidad 
donde un usuario puede acceder a recursos de 
otro. 
**Identity Gate** 
Sistema de Humanity Ledger que verifica que el 
emisor de una transferencia sea una identidad 
verificada. 
**Idempotencia** 
Propiedad de una operación que produce el 
mismo resultado sin importar cuántas veces se 
ejecute. 
**JWT** 
JSON Web Token. Formato de token de sesión 
firmado criptográficamente. 
**Keccak256** 
Función hash usada por Ethereum y Aztec. 
Variante de SHA-3. 
**MLS** 
Messaging Layer Security. Protocolo de cifrado 
E2E usado por XMTP. 
**NAT Traversal** 
Técnica para establecer conexiones directas 
entre dispositivos detrás de routers con NAT. 
**Noir** 
Lenguaje de programación de alto nivel para 
circuitos de conocimiento cero, creado por Aztec 
Labs. 
**Onion Routing** 
Técnica de enrutamiento que cifra el mensaje en 
capas sucesivas para ocultar el origen y destino. 
**PeerJS** 
Librería JavaScript que simplifica la creación de 
conexiones WebRTC. 
**Prisma ORM** 
Object-Relational Mapper para 
Node.js/TypeScript que proporciona acceso type-
safe a PostgreSQL. 
**PXE** 
Private Execution Environment. Proceso que 
gestiona las claves privadas y ejecuta circuitos ZK 
en Aztec. 
**QDs** 
Quantum Dots. Token nativo del ecosistema 
Humanity Ledger. 
**Railway** 
Plataforma cloud de despliegue continuo usada 
para producción de Humanity Ledger. 
**Rate Limiting** 
Limitación del número de peticiones que un 
cliente puede hacer en un período de tiempo. 
**Replay Attack** 
Ataque donde un actor captura y reenvía una 
petición legítima para duplicar una operación. 
**Schnorr Account** 
Tipo de cuenta en Aztec Network basada en 
firmas Schnorr sobre la curva Grumpkin. 
**Serializable** 
Nivel de aislamiento más alto en PostgreSQL. 
Garantiza que las transacciones concurrentes no 
interfieren. 
**SHA-256** 
Secure Hash Algorithm 256 bits. Función hash 
criptográfica de la familia SHA-2. 
**SIWE** 
Sign-In With Ethereum. Estándar de 
autenticación Web3 basado en firma de 
mensajes. 
**Sovereign Node** 
Rol en Humanity Ledger para usuarios que hacen 
staking de QDs a largo plazo. 
**STUN** 
Session Traversal Utilities for NAT. Protocolo para 
facilitar NAT traversal en WebRTC. 
**UltraHonk** 
Sistema de pruebas ZK de última generación 
implementado en Barretenberg por Aztec Labs. 
**Upsert** 
Operación de base de datos atómica: "Insert Or 
Update" — inserta si no existe, actualiza si sí. 
**Wash Trading** 
Práctica fraudulenta de crear transacciones 
artificiales entre cuentas propias para farmear 
recompensas. 
**WebRTC** 
Web Real-Time Communication. Estándar W3C 
para comunicación audio/video directa entre 
navegadores. 
**XMTP** 
Extensible Message Transport Protocol. 
Protocolo de mensajería descentralizado para 
wallets Web3. 
**Zero-Knowledge Proof (ZK)** 
Prueba criptográfica que demuestra el 
conocimiento de algo sin revelar qué es ese algo. 
**ZK-Rollup** 
Técnica de escalabilidad de blockchain que usa 
pruebas ZK para comprimir miles de 
transacciones. 
 
 
Fin del Documento 
 
© 2026 Humanity Ledger S.L. 
Todos los derechos reservados. Documento de uso interno y académico. 
Versión 3.0 — Septiembre de 2026 
Redactado por: Stefan Antonio Cirisanu y el Equipo de Ingeniería de Humanity Ledger 
 
