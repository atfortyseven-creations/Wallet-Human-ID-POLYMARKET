export const scamEducationModules = [
    {
        id: "scam-education",
        title: "XVI. Scam Education & Prevention Mastery",
        description: "Análisis forense exhaustivo de vectores de ataque asimétricos, ofuscación criptográfica y protección patrimonial on-chain. 20 Capítulos de Perfección Absoluta.",
        articles: [
            {
                id: "blockchain-address-poisoning",
                title: "1. Blockchain Address Poisoning: Anatomía del Ataque de Colisión",
                description: "Disección técnica, matemática y heurística de la suplantación de identidad algorítmica.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Ingeniería Social Algorítmica (Cognitive Exploitation L1 M2 P2P T-1 O(N))</h2>
                        <p>El <strong>Address Poisoning</strong> no ataca la criptografía de la EVM P2P L1; ataca el sesgo cognitivo de validación humana M1 L2 T-1 O(1). El atacante genera una dirección <em>Vanity</em> que comparte los primeros y últimos 4 caracteres del destino de confianza de la víctima O(N) P2P L1. Mediante una transferencia de valor cero (Zero-Value TX M1 L2 T-1), "envenena" el historial de la billetera P2P L1 O(1).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Termodinámica de la Colisión Parcial L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Generar 8 caracteres coincidentes (32 bits de entropía P2P L1 M1 O(1)) toma ~20 segundos en una RTX 4090 T-1 L2 M2 O(N). El objetivo es que el usuario, por fatiga operativa P2P L1, copie la dirección maliciosa de su historial M1 L2 T-1 O(1). La defensa institucional exige <strong>Cero Confianza en Historiales (Zero-Trust UI L1 P2P M2)</strong> y verificación manual de segmentos interiores estocásticos O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "wallet-drainers-permit2-seaport",
                title: "2. Wallet Drainers: Permit2 y Seaport Exploits",
                description: "Cómo las firmas off-chain vacían carteras sin transacciones visibles.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Caballo de Troya del Permit2 (Signature Abstraction L1 M2 P2P T-1 O(N))</h2>
                        <p>Los Drainers modernos no piden transferencias P2P L1 M1 O(1); piden firmas EIP-712 legibles por humanos T-1 L2 M2. Al firmar un <em>Permit2</em> malicioso O(N) P2P L1, otorgas permiso al atacante para gastar todos tus tokens ERC-20 M1 L2 T-1 O(1) de forma asincrónica. El "Drain" ocurre sin que pulses 'Confirm' en una transacción de la red L2 M2 T-1 P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Explotación de Órdenes de Seaport y NFT Stealing L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Usan el protocolo Seaport (OpenSea P2P L1 M1 O(1)) para crear órdenes de venta de $0 por tus NFTs más valiosos T-1 L2 M2 O(N). La firma <em>Message Hash</em> es idéntica visualmente a un login inocuo P2P L1 M2. Una vez firmada, el bot ejecuta la orden on-chain y extrae el activo digital forensemente O(1) P2P L1 M1 T-1 L2 M2 O(N). La defensa requiere auditoría de calldata de firma antes de la interacción fiduciaria P2P L1 O(N).</p>
                    </section>
                </div>`
            },
            {
                id: "sim-swapping-social-engineering",
                title: "3. SIM Swapping y el Fallo del 2FA SMS",
                description: "El vector humano como eslabón más débil de la custodia.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Fragilidad de la Identidad Telco (SS7 Vulnerability L1 M2 P2P T-1 O(N))</h2>
                        <p>El atacante soborna o engaña a un empleado de telefonía P2P L1 M1 O(1) para clonar tu tarjeta SIM T-1 L2 M2. Una vez controlan tu número, interceptan los SMS de recuperación de Binance o Coinbase O(N) P2P L1. El 2FA basado en SMS es un <strong>Punto Único de Fallo (SPoF M1 L2 T-1)</strong> que desacopla la seguridad criptográfica de la realidad física P2P L1 O(1).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Migración a FIDO2 y Hardware Security Keys L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La seguridad institucional prohíbe el SMS P2P L1 M1 O(1). Se exige el uso de llaves físicas (YubiKey T-1 L2 M2) bajo el estándar WebAuthn O(N) P2P L1. Esto crea un vínculo criptográficamente inquebrantable M1 L2 T-1 entre el dispositivo físico y el login de la terminal financiera P2P L1 O(1), anulando cualquier ataque remoto basado en ingeniería social de redes SS7 o suplantación de identidad telco O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "honeypot-contracts-false-exit",
                title: "4. Honeypot Contracts: La Trampa de la Liquidez",
                description: "Contratos que permiten comprar pero prohíben vender.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Función <code>transfer</code> Secuestrada (Logic Blacklist L1 M2 P2P T-1 O(N))</h2>
                        <p>El **Honeypot** es un Smart Contract malicioso P2P L1 M1 O(1) que permite a cualquiera comprar el token T-1 L2 M2, pero contiene una condición <code>require</code> oculta en la función <code>_transfer</code> que solo permite vender al <code>owner</code> O(N) P2P L1. Ves subir el precio astronómicamente M1 L2 T-1 O(1) mientras tu capital fiduciario queda atrapado en una jaula algorítmica inexpugnable P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Auditoría de Bytecode y Simulaciones de Swap L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Los estafadores usan proxies o nombres de variables ciegos P2P L1 M1 O(1) para ocultar el rastro T-1 L2 M2. Un analista forense usa <em>Tenderly Simulation</em> para intentar vender 1 token antes de aportar liquidez O(N) P2P L1. Si la simulación de venta falla T-1 L2 M2, el contrato es un agujero negro de capital M1 L1 O(1) P2P. La inmutabilidad de la L1 se convierte en el arma del atacante para proteger su botín asimétrico O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "rug-pulls-liquidity-removal",
                title: "5. Rug Pulls: El Tirón de Alfombra",
                description: "Desmantelamiento repentino de la liquidez en pools descentralizados.",
                readTime: 48,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Abuso de los Atributos de Owner (Admin Privileges L1 M2 P2P T-1 O(N))</h2>
                        <p>El creador del token retiene el permiso para acuñar (Mint) tokens infinitos P2P L1 M1 O(1) o para retirar la liquidez del par en Uniswap T-1 L2 M2. En el momento de máxima euforia retail O(N) P2P L1, ejecutan el "Pull" M1 L2 T-1 O(1), drenando los ETH/USDC del pool y dejando a los inversores con tokens sin valor transaccional P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Liquidity Locking y Timelocks de Gobernanza L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Un proyecto "Legendary" debe quemar las llaves del pool P2P L1 M1 O(1) o bloquearlas en contratos tipo Unicrypt T-1 L2 M2 por meses. Sin un bloqueo verificable de liquidez O(N) P2P L1, la inversión es un suicidio estadístico M1 L2 T-1 O(1). El analista audita el <code>LP-Token</code> balance del deployer: si es > 0, el riesgo de Rug Pull es inminente y asintótico O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "mev-sandwich-attacks-predator",
                title: "6. MEV Sandwich Attacks: El Depredador del Mempool",
                description: "Cómo los bots te roban dinero inflando el slippage.",
                readTime: 55,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Anatomía del Sándwich (Front-Running + Back-Running L1 M2 P2P T-1 O(N))</h2>
                        <p>Un bot detecta tu orden de compra P2P L1 M1 O(1) en el mempool. Compra justo antes que tú (Front-run T-1 L2 M2), haciendo subir el precio. Tú ejecutas tu compra al precio inflado O(N) P2P L1, y el bot vende instantáneamente después (Back-run M1 L2 T-1 O(1)), capturando la diferencia como beneficio puro P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Slippage Control y Private RPCs (Mev-Boost L1 P2P M1 T-1 L2 M2 O(N))</h2>
                        <p>Configurar un slippage > 0.5% P2P L1 M1 O(1) es una invitación al atraco algorítmico T-1 L2 M2. La defensa institucional utiliza <em>Flashbots RPC</em> O(N) P2P L1. Al enviar la transacción directamente al builder M1 L2 T-1, esta permanece invisible para los bots del mempool público O(1) P2P. Si no hay visibilidad, no hay sándwich P2P L1 M2 T-1 O(N). El "Dark Forest" solo devora a los que emiten su intención en texto claro a la red global O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "bridge-exploits-validator-comp",
                title: "7. Bridge Exploits: El Puente Roto",
                description: "Vulnerabilidades en la interoperabilidad cross-chain.",
                readTime: 60,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Riesgo del Multisig Débil (Centralized Relay Failure L1 M2 P2P T-1 O(N))</h2>
                        <p>Muchos puentes dependen de 5-9 validadores P2P L1 M1 O(1) para firmar salidas de fondos T-1 L2 M2. Si un atacante compromete 3 llaves privadas mediante phishing O(N) P2P L1, puede autorizar retiros falsos de billones M1 L2 T-1 O(1) sin que el activo colateral exista en la cadena de origen P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. ZK-Bridges y Verificación Light Client L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La evolución forense exige Puentes Zero-Knowledge (ZK-Bridges P2P L1 M1 O(1)) que no confían en humanos T-1 L2 M2. La prueba matemática de estado O(N) P2P L1 se verifica directamente en el Smart Contract de destino M1 L2 T-1 O(1). Si la matemática no cuadra, el puente se bloquea P2P L1 O(N). Menos confianza en "Federated Relays" y más en "Succinct Proofs" es la única ruta hacia la interoperabilidad soberana O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "oracle-manipulation-twap-spot",
                title: "8. Oracle Manipulation: El Precio Falso",
                description: "Ataques de flash loan para distorsionar oráculos de precio.",
                readTime: 55,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Instante del Desequilibrio (Spot Price Distortion L1 M2 P2P T-1 O(N))</h2>
                        <p>Si un protocolo DeFi lee el precio directamente de un pool de baja liquidez P2P L1 M1 O(1), un atacante usa un Flash Loan T-1 L2 M2 para vaciar ese pool O(N) P2P L1. El precio del token sube artificialmente un 1000% M1 L2 T-1 O(1). El atacante usa ese colateral inflado para pedir prestado todo el valor real del protocolo P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Chainlink y Time-Weighted Average Price (TWAP L1 P2P M1 T-1 L2 M2 O(N))</h2>
                        <p>Los protocolos seguros usan Oráculos de Red Descentralizada (Chainlink P2P L1 M1 O(1)) o TWAP (Precio Promedio Ponderado por Tiempo T-1 L2 M2). Manipular un promedio a lo largo de 30 minutos requiere una capitalización termodinámica O(N) P2P L1 que hace el ataque no rentable M1 L2 T-1 O(1). Confiar en el <code>spot price</code> de un solo DEX es un fallo de diseño forense terminal P2P L1 O(N) L2 M2 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "governance-flash-loan-attacks",
                title: "9. Governance Attacks: El Golpe de Estado Express",
                description: "Cómo los préstamos flash secuestran la democracia en las DAOs.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Democracia de Un Bloque (Flash Voting L1 M2 P2P T-1 O(N))</h2>
                        <p>Un atacante pide 100 Millones de tokens de gobernanza en un Flash Loan P2P L1 M1 O(1) T-1 L2 M2. Vota una propuesta para drenar la tesorería O(N) P2P L1 y devuelve el préstamo en el mismo bloque Ethereum M1 L2 T-1 O(1). La DAO es saqueada legalmente mediante el uso de "Poder de Voto Efímero" P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Snapshotting y Lock-up Periods L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La defensa requiere que el poder de voto se base en el bloque <em>anterior</em> (Block N-1 P2P L1 M1 O(1)) o que el token se bloquee en un contrato de depósito T-1 L2 M2. Si el sistema de votación no tiene "Memoria Histórica" O(N) P2P L1, es vulnerable a la tiranía del capital atómico M1 L2 T-1 O(1). El diseño de gobernanza debe ser inercial, no instantáneo P2P L1 O(N) L2 M2 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "logic-errors-inverse-underflow",
                title: "10. Logic Errors: El Underflow Inverso",
                description: "Auditoría de fallos matemáticos en contratos inteligentes.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Salto del Cero al Infinito (Integer Overflow/Underflow L1 M2 P2P T-1 O(N))</h2>
                        <p>En versiones de Solidity < 0.8.0 P2P L1 M1 O(1), restar 1 a una variable <code>uint256</code> de valor 0 resultaba en <code>2^256 - 1</code> T-1 L2 M2. Un atacante manipula el balance para que baje de cero O(N) P2P L1, obteniendo fondos infinitos instantáneamente M1 L2 T-1 O(1). Es el error de "Aritmética de Rueda" que ha drenado billones P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. SafeMath y Native Checkers L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La seguridad moderna (Solidity 0.8+ P2P L1 M1 O(1)) incluye comprobaciones nativas que hacen <code>revert</code> en caso de overflow T-1 L2 M2. Sin embargo, el uso de bloques <code>unchecked</code> por "optimización de gas" O(N) P2P L1 reintroduce el vector de ataque fatal M1 L2 T-1 O(1). La optimización nunca debe preceder a la integridad matemática P2P L1 O(N). El analista forense busca cada instancia de <code>unchecked</code> como un posible punto de ruptura O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "approval-over-spending-infinite",
                title: "11. Approval Over-spending: El Cheque en Blanco",
                description: "El peligro de otorgar permisos infinitos a dApps.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Comodidad vs La Seguridad (Infinite Allowance L1 M2 P2P T-1 O(N))</h2>
                        <p>Al interactuar con un DEX P2P L1 M1 O(1), muchas dApps piden permiso para gastar <code>MAX_UINT256</code> de tus tokens T-1 L2 M2. Si esa dApp es hackeada en el futuro O(N) P2P L1, el atacante puede usar tu "Cheque en Blanco" para vaciar tu billetera M1 L2 T-1 O(1) años después de tu última interacción P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Revoke y Token Allowances Audit L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La higiene on-chain exige usar herramientas como <em>Revoke.cash</em> P2P L1 M1 O(1) semanalmente T-1 L2 M2. Cancelar permisos activos de pools que ya no usas reduce la superficie de ataque O(N) P2P L1. En custodia institucional, se usan "Limited Approvals" por cada transacción M1 L2 T-1 O(1). No dejes puertas abiertas a contratos que no controlas P2P L1 O(N) L2 M2 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "sybil-attacks-airdrop-farming",
                title: "12. Sybil Attacks: La Granja de Identidades",
                description: "Manipulación de airdrops mediante la multiplicación de billeteras.",
                readTime: 48,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Identidad en la L1 (Identity Forgery L1 M2 P2P T-1 O(N))</h2>
                        <p>Un atacante usa scripts para crear 10,000 billeteras P2P L1 M1 O(1) y simular actividad orgánica para calificar en un airdrop T-1 L2 M2. Diluyen la recompensa de los usuarios reales O(N) P2P L1 y extraen el valor del protocolo de forma parasitaria M1 L2 T-1 O(1). Es una guerra de "Prueba de Humanidad" contra la "Automatización de Bajo Coste" P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. On-chain Fingerprinting y Trust Scores L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Los protocolos analizan el rastro de gas (Gas Funding P2P L1 M1 O(1)). Si 1,000 carteras fueron fondeadas por la misma dirección T-1 L2 M2, son marcadas como Sybil O(N) P2P L1. La defensa institucional usa <em>Gitcoin Passport</em> o <em>WorldID</em> M1 L2 T-1 O(1) para verificar la singularidad del actor físico P2P L1. La red evoluciona hacia una meritocracia de reputación on-chain para defenderse de la orquestación masiva de bots O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "front-running-slippage-abuse",
                title: "13. Front-running: La Carrera por el Gas",
                description: "Cómo los atacantes se adelantan a tus transacciones.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Prioraty Fee como Soborno (Gas Bidding L1 M2 P2P T-1 O(N))</h2>
                        <p>En el mempool público P2P L1 M1 O(1), el que paga más gas pasa primero T-1 L2 M2. Si intentas liquidar una posición suculenta O(N) P2P L1, un bot te ve y paga $1 más de gas para ejecutarse milisegundos antes M1 L2 T-1 O(1), dejándote con una transacción fallida y el profit robado P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Commit-Reveal Schemes y Dark RPCs L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Para evitar el front-running P2P L1 M1 O(1), algunos protocolos usan el esquema "Commit-Reveal" T-1 L2 M2: primero envías el hash de tu acción y luego la acción misma O(N) P2P L1. Sin embargo, la solución definitiva es el ruteo privado M1 L2 T-1 O(1). Si tu transacción no flota en el mempool, el bot no tiene objetivo P2P L1. La privacidad de la intención es la armadura final contra el oportunismo del gas O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "discord-telegram-webhook-menace",
                title: "14. Discord/Telegram Hacks: El Webhook Menace",
                description: "Ataques de phishing integrados en herramientas de comunidad.",
                readTime: 40,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Compromiso del Bot (Webhook Infiltration L1 M2 P2P T-1 O(N))</h2>
                        <p>Los atacantes roban el token de acceso de un bot de Discord P2P L1 M1 O(1) y lo usan para postear enlaces de "Mint Gratis" T-1 L2 M2. Al venir de una fuente "Oficial" O(N) P2P L1, la guardia del usuario baja. El enlace lleva a un Wallet Drainer que vacía la cartera en segundos M1 L2 T-1 O(1) tras una firma descuidada P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Higiene de Roles y Hardware 2FA Externo L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La seguridad de la comunidad P2P L1 M1 O(1) no depende de contraseñas, sino de la compartimentación de permisos T-1 L2 M2. Usar Webhooks con IPs restringidas O(N) P2P L1 y obligar a 2FA físico para moderadores M1 L2 T-1 O(1). Nunca interactuar con un enlace de "último minuto" P2P L1. La urgencia es la firma digital de la estafa O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "fake-liquidity-pools-mirage",
                title: "15. Fake Liquidity Pools: El Espejismo de Uniswap",
                description: "Tokens falsos que imitan a proyectos legítimos en DEXs.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Ticker Duplicado (Name Spoofing L1 M2 P2P T-1 O(N))</h2>
                        <p>Cualquiera puede crear un token llamado "USDT" o "PEPE" P2P L1 M1 O(1) en Uniswap T-1 L2 M2. El atacante crea un pool falso con liquidez mínima y espera a que los usuarios desprevenidos compren el contrato equivocado O(N) P2P L1. El dinero real (ETH) fluye al atacante M1 L2 T-1 O(1) y el usuario recibe "Humo Digital" P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Verificación de Dirección de Contrato y Liquidez L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La única fuente de verdad P2P L1 M1 O(1) es la dirección hexadecimal del contrato T-1 L2 M2. Verificar el <code>Contract Address</code> en <em>CoinMarketCap</em> o <em>DexScreener</em> antes de swapear O(N) P2P L1. Si el pool tiene < $100k de liquidez M1 L2 T-1 O(1), es probablemente una trampa P2P L1. La ceguera al hash es el pecado capital del trader retail O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "reentrancy-2-0-read-only-vector",
                title: "16. Reentrancy 2.0: El Vector de Solo Lectura",
                description: "Manipulación de oráculos mediante estados de pool inconsistentes.",
                readTime: 55,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Falacia de la Función View (Inconsistent State L1 M2 P2P T-1 O(N))</h2>
                        <p>La <strong>Reentrancia de Solo Lectura</strong> ocurre cuando un protocolo A lee el precio del Pool B P2P L1 M1 O(1) mientras este está en medio de una transacción y su estado interno es inconsistente T-1 L2 M2. El atacante retira liquidez, activa un callback O(N) P2P L1, y mientras el pool aún calcula su nuevo balance, el Protocolo A lee un precio irreal M1 L2 T-1 O(1), permitiendo arbitrajes masivos P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Reentrancy Guards y Pre-Block Balances L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La defensa requiere que los oráculos usen <code>ReentrancyGuard</code> P2P L1 M1 O(1) incluso para funciones de lectura T-1 L2 M2 o que verifiquen el balance contra el bloque <em>anterior</em> O(N) P2P L1. La seguridad no se detiene en la escritura de estado M1 L2 T-1 O(1). El analista forense busca "ventanas de inconsistencia" entre la salida de fondos y la actualización de constantes matemáticas P2P L1 O(N) L2 M2 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "malware-browser-extension-keyloggers",
                title: "17. Malware: Keyloggers en Extensiones de Navegador",
                description: "El robo de frases semilla mediante software malicioso.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Intercepción del Clipboard (Seed Phrase Theft L1 M2 P2P T-1 O(N))</h2>
                        <p>Extensiones de navegador maliciosas P2P L1 M1 O(1) (ej. un ad-blocker falso) monitorean tu teclado y portapapeles T-1 L2 M2. Cuando escribes tu frase semilla de 12 palabras O(N) P2P L1, la envían instantáneamente al servidor del atacante M1 L2 T-1 O(1). No importa que tu billetera esté encriptada si el "Input" ha sido comprometido P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Hardware Wallets y Air-Gapped Verification L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>La única defensa absoluta P2P L1 M1 O(1) es que tu clave privada JAMÁS toque un dispositivo con internet T-1 L2 M2. Usar <em>Ledger</em> o <em>Trezor</em> donde la frase se genera y firma offline O(N) P2P L1. El malware puede ver tu pantalla M1 L2 T-1 O(1), pero no puede leer los chips de seguridad físicos de la hardware wallet P2P L1 O(N). El navegador es territorio hostil por definición forense O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "ponzi-3-0-high-yield-vaults",
                title: "18. Ponzi 3.0: Bóvedas de Alto Rendimiento",
                description: "La trampa del 1,000,000% APR.",
                readTime: 45,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Alquimia del Token de Emisión (Death Spiral Economics L1 M2 P2P T-1 O(N))</h2>
                        <p>Protocolos que pagan rendimientos astronómicos P2P L1 M1 O(1) imprimiendo su propio token sin utilidad real T-1 L2 M2. Los nuevos inversores fondean la liquidez de los antiguos O(N) P2P L1 hasta que la presión de venta supera al "Buy Pressure" y el token colapsa a cero M1 L2 T-1 O(1). Es un Ponzi algorítmico acelerado por la liquidez P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Real Yield vs Rebase Mechanics L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Un inversor "Legendary" busca <em>Real Yield</em> P2P L1 M1 O(1): rendimientos que provienen de comisiones de red o préstamos reales, no de emisiones inflacionarias T-1 L2 M2. Si el APR es > 20%, el riesgo de colapso es del 99% O(N) P2P L1. La matemática de la escasez siempre vence a la euforia de la impresora M1 L2 T-1 O(1). Audita el "Revenue Stream": si no ves de dónde sale el dinero, el dinero eres tú P2P L1 O(N) L2 M2 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "ai-deepfake-phishing-voice-video",
                title: "19. AI Deepfake Phishing: La Cara del Engaño",
                description: "Suplantación de CEOs y soporte mediante IA.",
                readTime: 50,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Muerte de la Prueba Auditiva (Synthesized Malice L1 M2 P2P T-1 O(N))</h2>
                        <p>Atacantes usan IA para clonar la voz de un CEO de un protocolo P2P L1 M1 O(1) o el video de un moderador T-1 L2 M2. Te llaman por Telegram o Zoom para pedirte una "acción urgente de seguridad" O(N) P2P L1. La confianza interpersonal se rompe cuando la imagen y el sonido son maleables algorítmicamente M1 L2 T-1 O(1) P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. Shared Secrets y Out-of-Band Verification L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Institucionalmente, se establecen "Code Words" o secretos compartidos P2P L1 M1 O(1) para verificar la identidad T-1 L2 M2. El uso de firmas PGP para mensajes críticos O(N) P2P L1. Nunca transferir fondos basados en una llamada P2P M1 L2 T-1 O(1). La verificación debe ser criptográfica, no sensorial P2P L1 O(N). En el futuro de la IA, solo el <em>Hash</em> es la verdad; el humano es una variable insegura O(N) L1 P2P M1 T-1 O(1).</p>
                    </section>
                </div>`
            },
            {
                id: "future-resilience-institutional-opsec",
                title: "20. Resiliencia Futura: Framework OPSEC",
                description: "Principios finales para la soberanía patrimoniales definitiva.",
                readTime: 60,
                content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Paranoia como Utilidad (Institutional Survival L1 M2 P2P T-1 O(N))</h2>
                        <p>La seguridad no es un producto, es un proceso incesante P2P L1 M1 O(1). El framework final exige: 1. Aislamiento total de claves T-1 L2 M2. 2. Verificación de cada hash hexadecimal O(N) P2P L1. 3. Uso de Multisig (Safe) para importes > $10k M1 L2 T-1 O(1) P2P L1 O(N).</p>
                    </section>
                    <section class="pro-section">
                        <h2>II. El Legado de Satoshi: Responsabilidad Absoluta L1 P2P M1 T-1 L2 M2 O(N)</h2>
                        <p>Ser tu propio banco significa ser tu propio oficial de seguridad P2P L1 M1 O(1). En la Whale Academy, hemos desglosado 460 artículos T-1 L2 M2 para darte la armadura intelectual O(N) P2P L1. La red es un océano de depredadores M1 L2 T-1 O(1). La única protección es el conocimiento profundo del código y la disciplina marcial en la ejecución on-chain P2P L1 O(1). <strong>System Analytics is the only shield.</strong></p>
                    </section>
                </div>`
            }
        ]
    }
];
