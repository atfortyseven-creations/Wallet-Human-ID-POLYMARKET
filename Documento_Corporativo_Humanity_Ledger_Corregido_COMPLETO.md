# HUMANITY LEDGER S.L.
Documento Corporativo Integral
Versión 1.0 — Septiembre 2026

Dominio de Producción: https://humanidfi.com
Repositorio: https://github.com/humanityledger/Humanity-Ledger
Contacto: atfortyseven2@humanidfi.es
Sistema: v1.0.0 — Aztec Mainnet
Clasificación: Documento Interno Corporativo / Presentación Académica

---

## ÍNDICE GENERAL
**PARTE I — IDENTIDAD CORPORATIVA**
1. Presentación Ejecutiva de Humanity Ledger S.L.
2. Misión, Visión y Valores Fundacionales
3. Propuesta de Valor: El Problema que Resolvemos
4. La Tesis: Por Qué la Web3 Necesita una Nueva Capa de Privacidad
5. Modelo de Mini-Apps: La Estrategia de Producto

**PARTE II — LEDGER CHAT: LA PRIMERA MINI-APP**
6. ¿Qué es Ledger Chat?
7. Arquitectura de Comunicación Descentralizada
8. Protocolo XMTP: Mensajería Wallet-a-Wallet
9. WebRTC: Videollamadas Peer-to-Peer Sin Censura
10. Onion Routing: La Capa de Privacidad Avanzada
11. Gestión de Contactos y Solicitudes
12. Archivos Adjuntos y Multimedia
13. Costes de Uso en Quantum Dots

**PARTE III — QUANTUM DOTS (QDs): LA ECONOMÍA INTERNA**
14. ¿Qué Son los Quantum Dots?
15. Génesis: El Balance Inicial de 2.500 QDs
16. Estructura de Transacciones: Tipos y Flujos
17. Sistema de Comisiones (Fee Tokenomics)
18. Airdrop Mensual del Ecosistema
19. Protección Anti-Sybil: Cómo Garantizamos la Integridad
20. Compra de QDs con ETH: El Puente Fiat-Cripto
21. Staking de QDs: Sovereign Nodes
22. El Modelo Económico de Largo Plazo

**PARTE IV — PORTFOLIO E IDENTIDAD AZTEC**
23. La Tarjeta de Identidad Soberana (Schnorr Account)
24. Derivación Criptográfica de la Dirección Aztec
25. El Sistema de Balance: Fuente Única de Verdad
26. Historial de Transacciones
27. El Rango del Usuario: De Witness a Architect
28. Panel PXE: Private Execution Environment
29. Circuits Noir: Pruebas de Conocimiento Cero
30. Portal de Shielding: Aztec L2

**PARTE V — ARQUITECTURA TÉCNICA**
31. Stack Tecnológico Completo
32. Infraestructura de Backend: Next.js 15 y API Routes
33. Base de Datos: PostgreSQL y Prisma ORM
34. Integración con Aztec Network Mainnet

**PARTE VI — SEGURIDAD**
35. Autenticación: SIWE y el Sistema de Sesiones
36. Middleware de Seguridad: La Primera Línea de Defensa
37. Modelo de Datos Completo (Prisma Schema)
38. Gestión de Estado en el Frontend: AztecNativeContext
39. Filosofía de Seguridad: Zero-Trust Architecture
40. Protección IDOR (Insecure Direct Object Reference)
41. Protección Anti Double-Spend: Transacciones Serializables
42. Identity Gate: Solo las Identidades Verificadas Transfieren
43. Replay Attack Protection
44. Derivación de Hash de Identidad ZK
45. Gestión de Secretos y Variables de Entorno

**PARTE VII — INFRAESTRUCTURA Y DESPLIEGUE**
46. Railway: Despliegue en Producción
47. GitHub Actions: CI/CD Pipeline
48. Configuración de Variables de Entorno
49. Guía de Despliegue Paso a Paso

**PARTE VIII — MODELO DE NEGOCIO**
50. Monetización: Cómo Genera Valor Humanity Ledger
51. El Ecosistema de Mini-Apps como Plataforma
52. Modelo de Tiers de Usuario

**PARTE IX — ROADMAP Y FUTURO**
53. Estado Actual: Beta Prototype
54. Roadmap Q4 2026 — Q2 2027
55. La Visión a 5 Años

**PARTE X — COMUNICACIÓN ACADÉMICA**
56. Contexto Académico: Asignatura Blockchain
57. Presentación para el Profesor Cristian Cira
58. Propuesta de Gestión con Fineas Silaghi
59. Glosario Técnico

---

## PARTE I — IDENTIDAD CORPORATIVA

### 1. Presentación Ejecutiva de Humanity Ledger S.L.
Humanity Ledger S.L. es una empresa de tecnología constituida bajo la legislación española con forma jurídica de Sociedad Limitada. Su objeto social es el desarrollo, mantenimiento y comercialización de aplicaciones descentralizadas (dApps) construidas sobre infraestructura de blockchain privada y tecnología de conocimiento cero (ZK).
La empresa opera en la intersección de tres disciplinas técnicas de vanguardia:
1. **Criptografía de Conocimiento Cero (ZK)**: Utilizando la red Aztec Network Mainnet y el lenguaje de programación Noir.
2. **Comunicaciones Descentralizadas**: Empleando el protocolo XMTP para mensajería wallet-a-wallet cifrada de extremo a extremo.
3. **Economía de Tokens On-Chain**: Operando una economía interna denominada en Quantum Dots (QDs), el token nativo del ecosistema.

La empresa adopta una estrategia de producto orientada al mercado masivo basada en shipear mini-apps. La primera app programada es Ledger Chat, una aplicación de mensajería y videollamadas descentralizada. El sistema de producción está desplegado en Railway con el dominio `https://humanidfi.com`.

### 2. Misión, Visión y Valores Fundacionales
La misión de Humanity Ledger es **devolver la soberanía digital al individuo**. En un mundo donde las comunicaciones, los datos y las transacciones son sistemáticamente interceptadas, construimos la infraestructura criptográfica que hace que esto sea técnicamente imposible.

**Visión:** Convertirse en la capa de identidad y comunicación privada para el ecosistema Web3.
**Valores Fundacionales:**
- Privacidad por Diseño.
- Soberanía del Usuario.
- Transparencia Técnica.
- Seguridad Sin Compromisos.
- Accesibilidad.

### 3. Propuesta de Valor: El Problema que Resolvemos
**Problemas Actuales:**
1. Centralización del Control.
2. La Paradoja de la Identidad vinculada al mundo real.
3. La Inexistencia de una Economía de Valor directa en las comunicaciones.

**La Solución de Humanity Ledger:**
- Descentralización Real usando XMTP y WebRTC peer-to-peer.
- Identidad Basada puramente en Wallet.
- Quantum Dots (QDs) como moneda base del ecosistema P2P.

### 4. La Tesis: Por Qué la Web3 Necesita una Nueva Capa de Privacidad
La infraestructura actual de Web3 es completamente pública, creando el sistema de vigilancia financiera más completo de la historia. Aztec Network resuelve este problema usando ZK-Rollups. Humanity Ledger construye sobre esta capa para crear aplicaciones inherentemente privadas.

### 5. Modelo de Mini-Apps: La Estrategia de Producto
Humanity Ledger es una plataforma de mini-apps. Las actuales y futuras incluyen:
- **Ledger Chat:** Mensajería y transferencias descentralizadas (Estado: En Producción sobre Aztec Mainnet).
- **Sovereign Portfolio:** Panel de control de identidad Aztec y QDs.
- **Ledger Academy & Ledger Governance** (Roadmap).

---

## PARTE II — LEDGER CHAT: LA PRIMERA MINI-APP

### 6. ¿Qué es Ledger Chat?
La primera aplicación de mensajería construida nativamente sobre identidades Aztec Schnorr. Sus funciones principales incluyen mensajería instantánea, videollamadas HD peer-to-peer (WebRTC), transferencias P2P de QDs directamente en el chat, y envío de archivos y GIFs.

### 7. Arquitectura de Comunicación Descentralizada
Diseñada para **minimizar la confianza**.
- Los mensajes usan la red descentralizada XMTP.
- El audio y video usan WebRTC directo (sin intermediarios).
- Las transferencias usan la L2 de **Aztec Mainnet** (PostgreSQL + base de datos inmutable).
- Ningún dato de contenido pasa por los servidores de Humanity Ledger.

### 8. Protocolo XMTP: Mensajería Wallet-a-Wallet
XMTP es el estándar de comunicación Web3. Se usa para señalización de videollamadas, intercambiando tokens de WebRTC de forma privada, eliminando servidores de señalización centralizados.

### 9. WebRTC: Videollamadas Peer-to-Peer Sin Censura
Usa PeerJS para establecer conexiones directas. Integra *NAT Traversal* con servidores STUN.

### 10. Onion Routing: La Capa de Privacidad Avanzada
Sistema de enrutamiento cebolla inspirado en Tor, adaptado a Web3, usando nodos relay para ocultar origen y destino de los mensajes.

### 11. Gestión de Contactos y Solicitudes
Modelo de contactos bidireccional por wallet. Incluye protección anti-spam con rate limiting por IP y wallet.

### 12. Archivos Adjuntos y Multimedia
Los adjuntos viajan en base64 encriptados en el payload de XMTP. Implementa encuestas, ubicación temporal (Burn-on-Read), mensajes autodesctructivos, y Ghost AI.

### 13. Costes de Uso en Quantum Dots
- Mensaje: 0.01 QDs.
- Llamada: 0.5 QDs/min.
- Transferencia P2P: 1% de fee (mínimo 1 QD).
El coste criptoeconómico actúa como mecanismo anti-spam masivo.

---

## PARTE III — QUANTUM DOTS (QDs): LA ECONOMÍA INTERNA

### 14. ¿Qué Son los Quantum Dots?
El token nativo privado de Aztec L2. Ofrece privacidad nativa, transacciones privadas y trazabilidad selectiva.

### 15. Génesis: El Balance Inicial de 2.500 QDs
Al activar la identidad, el sistema asigna 2.500 QDs para permitir el onboarding sin fricción y actuar como filtro anti-Sybil.

### 16. Estructura de Transacciones
La base de datos registra operaciones como: TRANSFER, SPEND, AIRDROP, PURCHASE, EARN, FEE, STAKE, SLASH.

### 17. Sistema de Comisiones (Fee Tokenomics)
Toda transferencia incurre en un 1% de comisión para evitar database bloat. Incluye sistema de recompensas ("Earn") por transferencia para fomentar adopción, protegido contra wash trading.

### 18. Airdrop Mensual del Ecosistema
10 QDs mensuales el día 1 de cada mes UTC, requiere prueba de gasto y verificación social.

### 19. Protección Anti-Sybil
Identity Gates (Verificación SIWE), Spend-to-Earn, Verificación Social, Rate Limiting, Transacciones Serializables y Hashing de IPs.

### 20. Compra de QDs con ETH
Los usuarios pueden adquirir QDs en `https://humanidfi.com`. El sistema verifica la transacción de Ethereum on-chain antes de la emisión de QDs.

### 21. Staking de QDs: Sovereign Nodes
Mecanismo de bloqueo de tokens para asegurar la red.

### 22. El Modelo Económico de Largo Plazo
Deflación controlada a través del burning de comisiones y penalizaciones.

---

## PARTE IV — PORTFOLIO E IDENTIDAD AZTEC

### 23. La Tarjeta de Identidad Soberana (Schnorr Account)
Panel central con 9 pestañas de especialización (Identity, Send, Receive, History, Airdrop, Node, PXE, Circuits, Portal). Muestra el rango del usuario (Witness, Prover, Sequencer, Shielder, Sovereign, Architect).

### 24. Derivación Criptográfica de la Dirección Aztec
La dirección EVM (Ethereum) se deriva a una Aztec Schnorr Address usando `SHA-256 + Keccak256`. 

### 25. El Sistema de Balance: Fuente Única de Verdad
El balance oficial es la columna autoritativa de PostgreSQL para prevenir inconsistencias de estado.

### 26. Panel PXE y Circuitos Noir
El Private Execution Environment muestra en tiempo real la conexión con **https://node.aztec.network**. Ejecuta localmente pruebas criptográficas escritas en Noir (UltraHonk).

### 27. Portal de Shielding: Aztec L2
Interfaz de comando para mover liquidez del estado público de L1 al estado privado de Aztec L2.

---

## PARTE V — ARQUITECTURA TÉCNICA

### 28. Stack Tecnológico Completo
- **Frontend/Backend:** Next.js 15
- **Blockchain L2:** Aztec Network Mainnet
- **Smart Contracts ZK:** Noir
- **Auth:** SIWE
- **Mensajería:** XMTP
- **Video:** WebRTC/PeerJS
- **Base de Datos:** PostgreSQL / Prisma ORM

### 29. Integración con Aztec Network Mainnet
La integración se realiza con la Aztec Network Mainnet. El contrato de QDs opera on-chain usando un `SponsoredFPC` (Fee Payment Contract) para asegurar transacciones libres de fricción para el usuario.

---

## PARTE VI — SEGURIDAD

### 30. Autenticación, Middleware y Prevención de Double-Spend
Protegido por Arquitectura Zero-Trust. El middleware de Next.js verifica las firmas JWT. Todas las transferencias de la base de datos de PostgreSQL operan bajo el nivel `Serializable` de aislamiento, haciendo imposible el Double-Spend o Double-Claim. Todas las direcciones ZK están aisladas criptográficamente.

---

## PARTE VII — INFRAESTRUCTURA Y DESPLIEGUE

### 31. Railway, CI/CD y Variables de Entorno
Desplegado en producción a través de Railway, gatillado mediante GitHub Actions con revisión de código vía Slither (Solidity).
Las variables de producción apuntan al entorno de Mainnet:
- `AZTEC_PXE_URL="https://node.aztec.network"`

---

## PARTE VIII — MODELO DE NEGOCIO

### 32. Monetización y Tiers
El modelo de Humanity Ledger obtiene ingresos por la compra de QDs con ETH, comisiones del ecosistema y suscripciones a tiers PRO y SOVEREIGN para acceso premium. Las mini-apps funcionan como barrera de entrada al ecosistema general.

---

## PARTE IX — ROADMAP Y FUTURO

### 33. Estado Actual: Producción en Aztec Mainnet
La aplicación se encuentra desplegada exitosamente sobre la Mainnet, y todas las funcionalidades L2 están estables. La meta a 5 años es expandir a 10.000+ nodos relay independientes y la integración total con MICA Compliance.

---

## PARTE X — COMUNICACIÓN ACADÉMICA

### 56. Contexto Académico: Asignatura Blockchain
Humanity Ledger fue concebido y desarrollado en el contexto académico de la asignatura de Blockchain de la **Universitatea de Vest din Timișoara (UVT)**, bajo la supervisión del **Profesor Cristian Cira**. 

De acuerdo con el programa oficial del curso (Syllabus) que abarca a 200 estudiantes, la formación teórica culmina en la **Week 12 (16.12 - 22.12)** con la unidad *"Introduction to Zero Knowledge Proofs"*. Inmediatamente después, el curso destina la **Week 13 (08.01 - 10.01 de 2027)** a *"Guest Presentations"*.

Es en este bloque cronológico exacto donde Humanity Ledger se posiciona como el caso de estudio técnico definitivo: una aplicación real en producción operando sobre infraestructura Zero-Knowledge (Aztec Mainnet) que los estudiantes podrán comprender profundamente tras asentar su base teórica.

### 57. Presentación para el Profesor Cristian Cira y 200 Estudiantes

**57.1 Los Tres Pilares Técnicos de la Presentación**
**Pilar 1 — Arquitectura de Privacidad:**
La presentación debe demostrar con código real cómo Humanity Ledger implementa privacidad criptográfica en múltiples capas:
• La derivación de dirección Aztec desde EVM (SHA-256 + Keccak256) asegura que la identidad L2 no está vinculada on-chain a la identidad L1.
• El Identity Hash ZK asegura que las identidades están hasheadas de forma no reversible en la base de datos.
• Los balances de QDs on-chain son privados por defecto en Aztec.

**Pilar 2 — Zero-Knowledge Proofs en Producción:**
Demostrar el uso real de ZK en el sistema:
• Generar una prueba Noir en vivo durante la presentación usando la pestaña "Circuits" del Portfolio.
• Explicar el stack UltraHonk + Barretenberg + Grumpkin.
• Mostrar cómo el PXE ejecuta circuitos localmente sin revelar datos al servidor.

**Pilar 3 — Economía Tokenómica Diseñada:**
Demostración de ingeniería criptoeconómica aplicada:
• Balance génesis para bootstrapping de red.
• Anti-Sybil multicapa (Identity Gate, Spend-to-Earn, Social Verification, Serializable Transactions).
• Modelo deflacionario.

**57.2 Demo en Vivo Propuesta**
1. **Autenticación SIWE:** Mostrar el proceso de firma y la sesión JWT con MetaMask.
2. **Portfolio:** Mostrar balance de 2.500 QDs y la dirección Aztec.
3. **Transferencia P2P y Ledger Chat:** Abrir una conversación cifrada, iniciar videollamada WebRTC y enviar QDs en tiempo real.
4. **Noir ZK Proof:** Generación y verificación de conocimiento cero en vivo.

### 58. Propuesta de Gestión con Fineas Silaghi

**58.1 Contexto de la Colaboración**
El proyecto se coordina logísticamente con Fineas Silaghi, enlace directo con el ecosistema de Timisoara Startups y el Profesor Cira.
• **Septiembre - Diciembre 2026 (Remoto):** Estabilización de la red Aztec Mainnet. Fineas realiza la introducción formal con el Profesor Cira durante el semestre.
• **10 de Diciembre de 2026:** Llegada física a Rumanía.
• **Diciembre 2026 (Presencial):** Ensayos técnicos de estrés de red en la UVT.
• **Semana 13 (08.01 - 10.01 Enero 2027):** Exposición final ante los 200 estudiantes.

**58.2 Propuesta de Gestión Formal**
Hola Fineas,

Te escribo para establecer un plan de gestión claro, riguroso y transparente sobre cómo coordinaremos el proyecto Humanity Ledger hasta la presentación de enero.

**Estado Técnico Actual del Sistema:**
El sistema está en producción en `https://humanidfi.com`. Hemos migrado exitosamente toda la infraestructura criptográfica a **Aztec Mainnet** y hemos resuelto recientemente los bugs críticos que afectaban la economía interna (auto-derivación de identidades EVM a Aztec Schnorr y reclamo de airdrops). El sistema es estable.

**Timeline de Coordinación:**

**Fase Remota (Ahora → 9 de Diciembre):**
• Finalización de la UI/UX de Ledger Chat y Portfolio.
• Aseguramiento de uptime total en el nodo de Aztec Mainnet.
• Contacto con el Prof. Cristian Cira: Quedo a la espera de que me introduzcas con el Profesor durante este semestre para planificar y bloquear la fecha exacta de la presentación en la ventana de Guest Presentations (08.01 al 10.01).

**Fase Presencial (10 de Diciembre → 08 de Enero):**
• Llego físicamente a Rumanía el 10 de diciembre.
• Aprovecharemos para ensayar juntos in situ, realizando pruebas de carga en el PXE desde la red universitaria para garantizar que soporte a los 200 alumnos simultáneos.

**Reparto de Responsabilidades propuesto:**
• **Arquitectura técnica y backend:** Me encargo yo (Aztec, ZK, API, base de datos).
• **Narrativa y presentación:** Lo trabajamos juntos, asegurando que el lenguaje conecte perfectamente con la unidad de ZK Proofs que se imparte en la Week 12.
• **Demo en vivo:** Ensayamos juntos en Diciembre para resolver cualquier fricción técnica.

Comunicación Continua:
Cualquier duda técnica, puedes abrir un issue en GitHub o contactarme. Con la coordinación adecuada, la presentación será una demostración impresionante de tecnología ZK en producción real.

Un saludo,
Stefan Antonio Cirisanu
Humanity Ledger S.L.
atfortyseven2@humanidfi.es

### 59. Glosario Técnico
- **Aztec Network Mainnet**: Red L2 sobre Ethereum que usa ZK-Rollups.
- **ACIR**: Arithmetic Circuit Intermediate Representation para Noir.
- **Barretenberg**: Librería de criptografía de Aztec Labs (UltraHonk).
- **PXE**: Private Execution Environment que ejecuta circuitos ZK localmente.
- **XMTP**: Protocolo de mensajería descentralizado para wallets Web3.

---
© 2026 Humanity Ledger S.L.
Documento Interno y Académico. Redactado por Stefan Antonio Cirisanu.
