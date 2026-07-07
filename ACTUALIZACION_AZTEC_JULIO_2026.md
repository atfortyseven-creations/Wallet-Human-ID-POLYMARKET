# Actualización del Ecosistema: Whale Network x Aztec (7 de Julio de 2026)

Este documento recopila de manera exhaustiva todas las actualizaciones, refactorizaciones y nuevas arquitecturas implementadas en las últimas dos semanas previas a este push hacia producción (Railway). El objetivo de este informe es alinear a todo el equipo de Aztec sobre el estado actual del proyecto, las mejoras de infraestructura y la resolución de bugs críticos.

## 1. Integración Total con Aztec Alpha Testnet
Hemos migrado toda la infraestructura desde nodos locales/sandbox hacia la red pública de pruebas de Aztec.

- **RPC Oficial:** Se ha actualizado toda la conexión del cliente (`NetworkStats.tsx`, `lib/aztec/client.ts`) para apuntar al nodo oficial: `https://v5.testnet.rpc.aztec-labs.com`.
- **SponsoredFPC:** Se ha implementado la dirección canónica (rc.2) de FPC (`0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7`) permitiendo transacciones sin fricción (gas-free).
- **Resolución de Builds en Webpack:** Se ha solucionado el problema crítico donde la librería `@aztec/aztec.js` (v4.3.1) rompía el entorno de construcción por no exportar su ruta raíz. La solución implementada utiliza importaciones dinámicas (`await import()`) encapsuladas, garantizando compilaciones estables en Railway.
- **Preparación de Smart Contracts (Noir):** Se ha estructurado el wrapper del contrato `HumanityLedger` (`qds-contract.ts`) preparado para interactuar con la red Alpha.

## 2. Rediseño Cuántico del "Landing Page" (Desktop y Móvil)
Se ha construido desde cero una experiencia inmersiva para los usuarios que actúa como la puerta de entrada soberana a Aztec.

### Desktop (`ImmersiveManifestoLanding.tsx`)
- Implementación de animaciones basadas en `framer-motion` para transiciones fluidas de scroll.
- Incorporación de la sección **Verification Registry Map**, un mapa vectorial en vivo.
- Diseño minimalista, limpio, utilizando el sistema "White-on-White" para transmitir institucionalidad.
- Se ha eliminado permanentemente cualquier mención a "hospital coltea" para alinear la narrativa estrictamente con "Programmable Privacy" e infraestructura de Aztec.

### Móvil (`MobileManifesto.tsx`)
- Soporte nativo para áreas seguras de iOS y Android (`env(safe-area-inset)`), evitando que la "Dynamic Island" o la barra de inicio tapen contenido.
- Implementación del polyfill `100dvh` para evitar que la interfaz salte al ocultarse la barra de direcciones del navegador.

### Corrección de "Bugs de Visibilidad" y Layout
- **Erradicación de "Zonas Negras" y Desequilibrios Laterales:** Se han solucionado los problemas estructurales de desbordamiento de CSS. Se ha forzado `overflow-x: hidden` a nivel de la etiqueta `html` y se auditaron componentes (como `LaunchCountdown`) para asegurar que los anchos `100vw` no rompan la cuadrícula de la pantalla en Windows u otros SO.
- **Enrutamiento Inteligente:** El componente `SmartLandingRouter` ahora detecta el "User-Agent" y carga instantáneamente la versión adecuada (Móvil o Desktop) sin flashazos blancos.

## 3. Conexión Directa de Wallet (AppKit)
- Se ha eliminado la fricción de enviar al usuario a la página `/connect`. Ahora, el componente nativo `<appkit-button />` está integrado de manera ubicua en toda la experiencia del Landing Page.
- Esto permite conectar Metamask, WalletConnect o cualquier billetera inyectada de manera instantánea, unificando la lógica para iOS, Android y PC en un solo componente.

## 4. Actualización de Documentación Core
- **README.md:** Reescrito para reflejar la versión `4.0.0`, detallando la infraestructura actual, las variables de entorno necesarias para producción y destacando el Grant de Aztec Foundation.
- **CHANGELOG.md:** Ampliado con una sección detallada (Phase 8) que registra cada uno de los cambios técnicos realizados hoy 7 de Julio.

## Resumen para el Equipo
El repositorio se encuentra ahora en estado de **Producción**. Los problemas visuales han sido resueltos y las arquitecturas de fondo (Aztec Testnet + Web3 AppKit) están cableadas correctamente. El siguiente push a Railway desplegará la versión definitiva y estable.
