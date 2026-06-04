export const advancedAnalyticsModules = [
    {
        id: "advanced-analytics",
    title: "III. Arquitectura Profunda y Opcode Analytics",
    description: "Inmersión en las entrañas de la EVM: Opcodes, gestión de memoria y auditoría de bajo nivel. 20 Módulos de Máxima Perfección.",
    articles: [
        {
            id: "access-lists-eip-2930",
            title: "1. Access Lists (EIP-2930)",
            description: "Mitigación de riesgos de gas en slots 'cold': Estructura de pre-acceso institucional.",
            readTime: 180,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Geometría del Pre-Acceso: EIP-2930</h2>
                        <p>Tras la implementación del EIP-2929, que incrementó drásticamente el costo de las operaciones de lectura de estado "frías" (aquellas que no han sido accedidas previamente en la transacción), la eficiencia de las transacciones complejas se vio degradada. El <strong>EIP-2930</strong> introdujo un nuevo tipo de transacción que permite declarar una <strong>Access List</strong> (Lista de Acceso). Esta estructura pre-calienta los slots de almacenamiento y las direcciones de contratos, reduciendo el costo marginal de acceso de 2100 gas a 100 gas por slot, optimizando el ruteo institucional.</p>
                        
                        <div class="technical-deep-dive">
                            <h3>Estructura de la Lista de Acceso</h3>
                            <p>Una Access List es un array de tuplas <code>[address, storageKeys[]]</code>. Al declarar estos recursos por adelantado, el nodo puede precargar la data necesaria en memoria caché antes de iniciar la ejecución del bytecode, eliminando la latencia de I/O en tiempo real.</p>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Mitigación de DoS y Preservación de Invariantes</h2>
                        <p>El riesgo forense del EIP-2929 era el bloqueo de contratos antiguos que dependían de límites de gas fijos (Hardcoded Gas Limits). Las Access Lists actúan como una "póliza de seguro" técnica: si un contrato falla por falta de gas al intentar leer un slot frío, declarar ese slot en la Access List reduce el costo lo suficiente para que la transacción sea válida. En la Whale Academy, consideramos el uso de Access Lists como un estándar de <strong>Higiene de Gas</strong> para cualquier interacción con bóvedas multi-sig o protocolos de gobernanza.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="300" height="120" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="200" y="40" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Sin Access List (Cold)</text>
                                <text x="200" y="100" fill="#fff" text-anchor="middle">SLOAD: 2,100 Gas</text>
                                <text x="200" y="130" fill="#ff4d4d" text-anchor="middle">I/O Disk Latency ️</text>
                                
                                <path d="M400 110 L450 110" stroke="#fff" stroke-width="2" marker-end="url(#arrowhead)" />
                                
                                <rect x="500" y="50" width="250" height="120" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="625" y="40" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Con EIP-2930 (Warm)</text>
                                <text x="625" y="100" fill="#fff" text-anchor="middle">SLOAD: 100 Gas</text>
                                <text x="625" y="130" fill="#4dff88" text-anchor="middle">Cache Ready </text>
                            </svg>
                            <p class="diagram-caption">Figura 1: Reducción asintótica del costo de acceso mediante pre-warming de slots de estado.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "transient-storage-tload",
            title: "2. Almacenamiento Transitorio (TLOAD/TSTORE)",
            description: "Control de estado efímero: La solución al reentrancy y la eficiencia de gas en EIP-1153.",
            readTime: 190,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Fin de la Tiranía del SSTORE: EIP-1153</h2>
                        <p>Tradicionalmente, la Ethereum Virtual Machine solo permitía dos tipos de almacenamiento: <code>Stack/Memory</code> (volátil y limitado al ámbito de una función) y <code>Storage</code> (persistente y prohibitivamente caro). El **EIP-1153** introdujo el tercer paradigma: <strong>Transient Storage</strong> (Almacenamiento Transitorio). Los opcodes <code>TSTORE</code> y <code>TLOAD</code> permiten que los datos persistan a lo largo de toda la transacción (incluso entre diferentes llamadas a contratos) pero se purguen automáticamente al finalizar el bloque de ejecución, costando solo 100 gas (frente a los 2,900-20,000 del almacenamiento convencional).</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Reentrancy Guards de Grado Titán</h2>
                        <p>El uso más revolucionario del almacenamiento transitorio es la implementación de candados de reentrada. Antes de EIP-1153, un <code>nonReentrant</code> guard requería escribir en el disco del estado, lo que era un desperdicio de recursos. Con <code>TSTORE</code>, el candado es efímero; protege el hilo de ejecución actual sin dejar basura digital en el estado global. Esto habilita patrones de <strong>Flash Accounting</strong> en agregadores de liquidez, donde el balance final solo se verifica al cerrar la transacción, permitiendo una compositividad infinita sin fricción.</p>
                        
                        <div class="technical-box">
                            <strong>Flash Accounting Workflow:</strong>
                            <p>Un protocolo singleton puede permitir retiros masivos temporalmente siempre que, al final de la interacción, el almacenamiento transitorio verifique que <code>net_balance == 0</code>. Esto elimina la necesidad de transferencias de tokens intermedias, ahorrando hasta un 80% en costos de gas operativo.</p>
                        </div>

                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="60" width="200" height="80" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="150" y="105" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">TSTORE (Start)</text>
                                
                                <path d="M250 100 L350 100" stroke="#fff" marker-end="url(#arrowhead)" />
                                
                                <rect x="350" y="40" width="300" height="120" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" />
                                <text x="500" y="80" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">Logic Execution Context</text>
                                <text x="500" y="110" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Estado compartido persistente dentro de la TX)</text>
                                <text x="500" y="130" fill="#fff" text-anchor="middle" style="font-size: 11px;">Acceso vía TLOAD</text>
                                
                                <path d="M650 100 L750 100" stroke="#ff4d4d" stroke-width="2" stroke-dasharray="4" />
                                <text x="700" y="140" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">AUTO-WIPE</text>
                            </svg>
                            <p class="diagram-caption">Figura 2: Ciclo de vida efímero del almacenamiento transitorio para seguridad de alto rendimiento.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "warm-cold-storage-eip-2929",
            title: "3. Almacenamiento Warm vs Cold (EIP-2929)",
            description: "Dinamismo del costo de gas: Cómo la EVM penaliza el acceso a slots no cacheados.",
            readTime: 210,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Termodinámica del Estado: Slots Warm vs Cold</h2>
                        <p>La arquitectura de red de Ethereum evolucionó con el **EIP-2929** para reflejar la realidad física de los nodos. Acceder a un slot de almacenamiento por primera vez en una transacción (<strong>Cold Access</strong>) requiere una lectura física de la base de datos (LevelDB/RocksDB) del nodo, un proceso costoso en términos de latencia de disco. Los accesos subsiguientes (<strong>Warm Access</strong>) son prácticamente instantáneos al estar ya cargados en la memoria RAM del cliente. Esta asimetría se codifica en el gas: 2,100 gas para el primer contacto y solo 100 gas para los siguientes.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Mapa de Calor Forense: Auditoría de I/O</h2>
                        <p>Para el analista forense, el EIP-2929 es vital para detectar ataques de agotamiento de recursos. Un exploit de DoS (Denial of Service) puede saturar a un validador forzándolo a realizar miles de lecturas "frías" en un solo bloque, retrasando la validación y provocando la bifurcación de la red. En la Whale Academy, auditamos los contratos para garantizar que los datos críticos estén agrupados (Data Locality), minimizando los saltos entre slots aislados y asegurando una ejecución predecible y económica.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>Operación</th><th>Estado</th><th>Costo de Gas</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>SLOAD</td><td>Cold (Nuevo)</td><td>2,100</td></tr>
                                    <tr><td>SLOAD</td><td>Warm (Cache)</td><td>100</td></tr>
                                    <tr><td>EXTCODESIZE</td><td>Cold</td><td>2,600</td></tr>
                                    <tr><td>EXTCODESIZE</td><td>Warm</td><td>100</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "blobs-eip-4844-da-forensics",
            title: "4. Blobs y EIP-4844: Forense de Disponibilidad de Datos",
            description: "Análisis de la nueva capa de datos efímeros para Layer 2 y su impacto en la escalabilidad.",
            readTime: 250,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Paradigma de los Blobs: EIP-4844</h2>
                        <p>Ethereum ha pasado de ser una plataforma de ejecución pura a una red de disponibilidad de datos (Data Availability). Los **Blobs** (Binary Large Objects) introducidos por el **EIP-4844 (Proto-Danksharding)** permiten a los Rollups de Capa 2 publicar volúmenes masivos de datos en Ethereum sin competir por el gas de ejecución de la EVM. Estos datos residen en la capa de consenso y se purgan automáticamente tras 18 días, reduciendo los costos operativos institucionales en órdenes de magnitud.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Criptografía de Compromiso: KZG Polynomials</h2>
                        <p>Los blobs son "opacos" para la EVM: un contrato no puede leer su contenido directamente. Sin embargo, puede verificar que los datos publicados son correctos mediante un <strong>KZG Commitment</strong> (Compromiso Polinómico de Kate-Zaverucha-Goldberg). Esto permite que las Capas 2 prueben el estado de sus transacciones con una seguridad matemática equivalente a la de la Capa 1, pero con una fracción del costo. Para la forense institucional, esto requiere una nueva metodología: auditar la validez del compromiso <code>versioned_hash</code> frente a los datos del secuenciador.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="200" height="100" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="150" y="105" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">L2 Transaction Batch</text>
                                
                                <path d="M250 100 L350 70" stroke="#fff" marker-end="url(#arrowhead)" />
                                <text x="300" y="60" fill="#fff" text-anchor="middle" style="font-size: 10px;">To Execution (Expensive)</text>
                                
                                <path d="M250 100 L350 130" stroke="#ffa600" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="300" y="145" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">TO BLOB (EIP-4844)</text>
                                
                                <rect x="500" y="80" width="250" height="60" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" />
                                <text x="625" y="115" fill="#fff" text-anchor="middle">KZG Proof + Data Shard</text>
                            </svg>
                            <p class="diagram-caption">Figura 4: Desvío de la carga de datos hacia la capa de disponibilidad de blobs efímeros.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "calldata-vs-memory-loading",
            title: "5. Calldata vs Memory: La Estrategia de Carga",
            description: "Optimización de costos de entrada: Por qué leer de calldata es 10x más eficiente.",
            readTime: 170,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Ingestión de Datos: Calldata vs Memory</h2>
                        <p>Toda interacción externa con un contrato comienza en la región de **Calldata**, un área de memoria de solo lectura e inmutable que contiene los argumentos de la función. El error más común en la optimización institucional es copiar ciegamente los datos de <code>Calldata</code> hacia la <code>Memory</code> volátil. Mientras que <code>Calldata</code> es virtualmente gratuita para leer (solo el costo de gas del byte de transacción), expandir la <code>Memory</code> incurre en un costo lineal y eventualmente cuadrático.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Zero-Copy Architecture y Foreman Auditor</h2>
                        <p>La arquitectura <strong>Zero-Copy</strong> implica procesar los datos directamente desde el puntero de calldata usando el opcode <code>CALLDATALOAD</code>. Para el analista forense, los contratos que usan este patrón demuestran una sofisticación superior, ya que no dejan rastros en la memoria del ejecutor que puedan ser manipulados por exploits de sobreescritura de memoria. Al mantener los datos en la región inmutable de calldata, se garantiza la integridad de los argumentos durante todo el ciclo de vida del dispatch de la función.</p>
                        
                        <div class="technical-box">
                            <strong>Métrica de Eficiencia:</strong>
                            <p>Procesar un array de 100 elementos desde <code>calldata</code> ahorra aproximadamente 60,000 gas en comparación con cargarlo en <code>memory</code>, una diferencia crítica en protocolos de arbitraje de alta frecuencia.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "create2-deterministic-deploy",
            title: "6. CREATE2: Despliegue Determinista",
            description: "Análisis del opcode de despliegue con salt: De counterfactuals a exploits de predicción.",
            readTime: 220,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Predicción Atómica: CREATE2 vs CREATE</h2>
                        <p>En la arquitectura estándar de Ethereum (<code>CREATE</code>), la dirección de un nuevo contrato se deriva de forma secuencial: <code>hash(sender, nonce)</code>. Esto hace que el despliegue sea sensible al orden de las transacciones. El opcode <strong>CREATE2</strong> (EIP-1014) revolucionó el ecosistema al desacoplar la dirección del nonce, basándose en el <strong>Bytecode de Inicialización (init_code)</strong> y un valor arbitrario denominado <strong>salt</strong>. Esto permite el despliegue <em>Counterfactual</em>: conocer y fondear una dirección antes de que el contrato exista físicamente on-chain.</p>
                        
                        <div class="technical-box">
                            <strong>Fórmula de Derivación:</strong>
                            <code>keccak256(0xff ++ sender ++ salt ++ keccak256(init_code))[12:]</code>
                        </div>
                    </section>

                    <section class="pro-section">
                        <h2>II. Metamorphic Contracts y Riesgo Forense</h2>
                        <p>La propiedad más potente (y peligrosa) de <code>CREATE2</code> es la capacidad de desplegar un contrato en una dirección, destruirlo mediante <code>SELFDESTRUCT</code>, y luego volver a desplegar un bytecode <strong>diferente</strong> en la misma dirección exacta, siempre que el <code>init_code</code> (que puede ser un proxy) permanezca constante. Estos se denominan <strong>Contratos Metamórficos</strong>. Para un analista forense institucional, esto significa que el historial de una dirección no garantiza su comportamiento futuro; se debe auditar el <code>salt</code> y la autoridad de despliegue para prevenir sustituciones maliciosas de lógica en protocolos de puentes o billeteras inteligentes.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="150" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="125" y="105" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">User / Factory</text>
                                
                                <path d="M200 100 L350 100" stroke="#fff" marker-end="url(#arrowhead)" />
                                <text x="275" y="90" fill="#fff" text-anchor="middle" style="font-size: 10px;">Deterministic Salt</text>
                                
                                <rect x="350" y="50" width="220" height="100" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="460" y="105" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">PRE-CALCULATED ADDR</text>
                                <text x="460" y="125" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Funds sent before deploy)</text>
                                
                                <path d="M570 100 L700 100" stroke="#ffa600" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="635" y="130" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">CREATE2 EXEC</text>
                            </svg>
                            <p class="diagram-caption">Figura 6: El flujo de vida counterfactual: fondeo y despliegue asíncrono determinista.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "merkle-to-verkle-trees",
            title: "7. De Merkle Trees a Verkle Trees",
            description: "La evolución de la prueba de estado: Testigos sin estado y la reducción del ancho de banda.",
            readTime: 300,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Límite de la Escalabilidad de Merkle</h2>
                        <p>La estructura actual de Ethereum utiliza <strong>Merkle-Patricia Trees</strong> para probar la validez de los balances y el almacenamiento. El problema fundamental es el tamaño de las "Pruebas de Testigo" (Witness): para probar un solo dato en un árbol gigante, se necesita enviar una rama completa de hashes, lo que satura el ancho de banda de los nodos. Los <strong>Verkle Trees</strong> (Vercel-Merkle) sustituyen los hashes por <strong>Compromisos Polinómicos (Vector Commitments)</strong>, permitiendo pruebas que son dramáticamente más pequeñas (hasta 20 veces menos datos).</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Statelessness y la Purga del Estado</h2>
                        <p>La implementación de Verkle Trees es el habilitador tecnológico para el <strong>Stateless Ethereum</strong>. Permitirá que los nodos validen bloques sin necesidad de almacenar los gigabytes del estado completo en un disco duro, basándose únicamente en los testigos compactos incluidos en el bloque. Para la Whale Academy, esto representa la democratización total del hardware de validación: un analista podrá verificar la integridad de la red global desde un dispositivo ligero (Light Client), manteniendo la soberanía sin la carga de una infraestructura de servidor masiva.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <circle cx="150" cy="110" r="80" fill="rgba(255,255,255,0.05)" stroke="#555" />
                                <text x="150" y="40" fill="#fff" text-anchor="middle" style="font-weight: bold;">Merkle Tree (witness size O(log N))</text>
                                <path d="M150 110 L230 110" stroke="#ff4d4d" stroke-width="3" />
                                <text x="190" y="100" fill="#ff4d4d" style="font-size: 10px;">Large Proof</text>
                                
                                <path d="M300 110 L500 110" stroke="#fff" marker-end="url(#arrowhead)" stroke-width="2" stroke-dasharray="4" />
                                
                                <circle cx="650" cy="110" r="80" fill="rgba(77,255,136,0.1)" stroke="#4dff88" />
                                <text x="650" y="40" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Verkle Tree (witness size O(1))</text>
                                <path d="M650 110 L680 110" stroke="#4dff88" stroke-width="3" />
                                <text x="665" y="100" fill="#4dff88" style="font-size: 10px;">Compact</text>
                            </svg>
                            <p class="diagram-caption">Figura 7: Transición hacia pruebas de integridad de alta densidad y bajo ancho de banda.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "delegatecall-shared-context",
            title: "8. Delegatecall y el Contexto Compartido",
            description: "Forense de la vulnerabilidad más peligrosa: Cuando el código ajeno controla tu almacenamiento.",
            readTime: 240,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Identidad Prestada: Riesgo de Delegatecall</h2>
                        <p>El opcode <code>DELEGATECALL</code> es la base de casi todos los sistemas de actualización (Proxies) y carteras multifirma. Su característica definitoria es que ejecuta el código de una librería externa <strong>pero preserva el contexto del llamante</strong>: el <code>msg.sender</code>, el <code>msg.value</code> y, lo más crítico, el <strong>Storage</strong> del contrato original. Para la forense institucional, esta es la superficie de ataque más volátil, ya que un error de un solo byte en la alineación del mapa de almacenamiento (Storage Layout) puede permitir que una función inocente sobreescriba el rol de <code>owner</code> o drene el balance total del protocolo.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Auditoría del Mapa de Memoria</h2>
                        <p>Un analista forense debe verificar que el contrato Proxy y su Implementación compartan una estructura de variables idéntica línea por línea. Cualquier desviación provoca una <strong>Colisión de Slots</strong>. Si el Proxy espera el balance en el Slot 1, pero la Implementación escribe el <code>nonce</code> en ese mismo Slot, el sistema colapsará matemáticamente. La Whale Academy recomienda el uso estricto del estándar <strong>EIP-1967</strong>, que sitúa los punteros críticos en slots aleatorios al final del espacio de memoria (cerca de 2^256) para blindar la arquitectura contra sobreescrituras accidentales.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="250" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="175" y="40" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Proxy (State Storage)</text>
                                <text x="175" y="105" fill="#fff" text-anchor="middle">Slot 0: Owner</text>
                                
                                <path d="M300 100 L500 100" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="400" y="90" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold; font-size: 11px;">DELEGATECALL</text>
                                
                                <rect x="500" y="50" width="250" height="100" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" />
                                <text x="625" y="40" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">Logic (Code only)</text>
                                <text x="625" y="105" fill="#fff" text-anchor="middle">Slot 0: LogicVar</text>
                                
                                <path d="M625 150 Q400 180 175 110" stroke="#ff4d4d" marker-end="url(#arrowhead)" stroke-dasharray="4" />
                                <text x="400" y="175" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">COLLISION: Sobreescribe Owner</text>
                            </svg>
                            <p class="diagram-caption">Figura 8: Anatomía de una colisión de almacenamiento por desajuste de contexto en llamadas delegadas.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "gas-schedule-economics-eip-2929",
            title: "9. Economía del Gas Schedule y EIP-2929",
            description: "Análisis del equilibrio termodinámico de la EVM: Costos de opcodes y prevención de DoS.",
            readTime: 210,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Termodinámica del Gas: EIP-2929</h2>
                        <p>El gas no es solo una tarifa; es un mecanismo de defensa contra el <em>Halting Problem</em> (problema de la parada). El **EIP-2929** introdujo un ajuste masivo en la economía del gas (Gas Schedule), incrementando el costo de las instrucciones de I/O (SSTORE, SLOAD, balance, etc.) cuando se accede a un slot por primera vez. Esto se hizo para mitigar ataques que buscaban saturar el procesamiento de los nodos mediante el acceso ruidoso al disco. Entender el gradiente entre costos <strong>Cold</strong> y <strong>Warm</strong> es el primer paso para diseñar algoritmos institucionales de alta eficiencia.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Coste del Estado y el Gas Refund Paradox</h2>
                        <p>La EVM incentiva la limpieza del estado mediante <strong>Gas Refunds</strong> (devoluciones). Al poner un slot de almacenamiento a cero (borrar datos), el usuario recibe una devolución de gas al final de la transacción. Sin embargo, para evitar ataques de especulación de gas (donde protocolos almacenaban datos baratos para borrarlos cuando el gas era caro y recibir devoluciones），el EIP-3529 limitó estas devoluciones al 20% del gas total usado. La Whale Academy audita los circuitos de limpieza para maximizar este beneficio sin comprometer la integridad atómica del estado corporativo.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>EIP</th><th>Cambio Económico</th><th>Impacto Forense</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>2929</td><td>Acceso Cold a 2100 gas</td><td>Penaliza la fragmentación de datos.</td></tr>
                                    <tr><td>3529</td><td>Reducción de Refund al 20%</td><td>Inutiliza el arbitraje de Gas Tokens.</td></tr>
                                    <tr><td>1559</td><td>BaseFee + Priority Fee</td><td>Predictibilidad del tiempo de bloque.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "push0-opcode-eip-3855",
            title: "10. El Opcode PUSH0 (EIP-3855)",
            description: "Optimización de bytecode: Reduciendo el desperdicio de gas en el despliegue de contratos.",
            readTime: 140,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Triunfo de la Eficiencia: PUSH0</h2>
                        <p>Durante años, la Ethereum Virtual Machine desperdició millones de bytes de calldata y gas simplemente para empujar un valor de cero (<code>0</code>) al stack. Dado que no existía un opcode dedicado, los compiladores debían usar <code>PUSH1 0x00</code> (costando 3 de gas y usando 2 bytes de bytecode: el opcode y el literal). El **EIP-3855** introdujo finalmente el opcode <strong>PUSH0</strong>, que simplemente pone un cero en el stack costando solo 2 de gas y consumiendo 1 solo byte de espacio.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Impacto en el Despliegue y Bytecode Analytics</h2>
                        <p>Para un contrato institucional masivo que roza el límite de los 24KB (EIP-170), el uso de <code>PUSH0</code> puede ser la diferencia entre poder desplegarse o requerir una refactorización costosa. Un analista forense identifica los contratos modernos (compilados con Solidity 0.8.20+) por la presencia sistemática de este opcode. Su ausencia en contratos que manejan lógica multipila densa es un indicador de deuda técnica o compiladores obsoletos que no aprovechan el espectro térmico completo de la EVM actual.</p>
                        
                        <div class="technical-box">
                            <strong>Ahorro Estimado:</strong>
                            <p>En despliegues de proxies tipo EIP-1967, el uso de <code>PUSH0</code> reduce el costo de creación en aproximadamente un 1.5% anual en volumen total de gas, optimizando la tesorería de la DAO.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "stack-vs-memory-anatomy",
            title: "11. El Stack vs Memory: La Anatomía del Ejecutor",
            description: "Análisis de la arquitectura basada en pilas: De registros de 256 bits a la memoria volátil.",
            readTime: 230,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Jerarquía de Datos: Stack vs Memory</h2>
                        <p>La EVM opera bajo una arquitectura basada en pilas (Stack-based), donde la mayoría de los opcodes consumen y producen valores en una estructura de "último en entrar, primero en salir" con una profundidad máxima de 1024 niveles. Cada palabra en el stack tiene exactamente 256 bits. Sin embargo, el stack es restrictivo: solo los primeros 16 elementos son accesibles directamente (<code>DUP1</code>-<code>DUP16</code>). Cuando un algoritmo requiere manipular estructuras de datos complejas o buffers de gran tamaño, debe recurrir a la <strong>Memory</strong>, un array de bytes volátil de expansión lineal.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Error "Stack Too Deep" y la Forense de Memoria</h2>
                        <p>El infame error <code>Stack Too Deep</code> no es un límite de capacidad total, sino de alcance (reachability). Un desarrollador de élite soluciona esto moviendo variables intermedias a <code>Memory</code> utilizando <code>MSTORE</code> y <code>MLOAD</code>. Para el analista forense, entender esta danza es crucial: los exploits de manipulación de punteros suelen ocurrir cuando se calculan incorrectamente los offsets de memoria, permitiendo que un dato malicioso sobreescriba una variable crítica (como un booleano de validación) que reside accidentalmente en el mismo segmento de memoria volátil.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="40" width="150" height="150" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="125" y="30" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">STACK (LIFO)</text>
                                <text x="125" y="70" fill="#fff" text-anchor="middle">Word 1: 0x... (Top)</text>
                                <text x="125" y="100" fill="#fff" text-anchor="middle">Word 2</text>
                                <text x="125" y="130" fill="#aaa" text-anchor="middle">...</text>
                                <text x="125" y="160" fill="#aaa" text-anchor="middle">Word 1024 (Bottom)</text>
                                
                                <path d="M200 110 L350 110" stroke="#fff" marker-end="url(#arrowhead)" stroke-width="2" />
                                <text x="275" y="100" fill="#fff" text-anchor="middle" style="font-size: 10px;">MSTORE / MLOAD</text>
                                
                                <rect x="350" y="40" width="400" height="150" fill="rgba(255,166,0,0.1)" stroke="#ffa600" stroke-width="2" />
                                <text x="550" y="30" fill="#ffa600" text-anchor="middle" style="font-weight: bold;">MEMORY (Linear Byte Array)</text>
                                <rect x="370" y="60" width="360" height="30" fill="rgba(255,255,255,0.05)" />
                                <text x="550" y="80" fill="#fff" text-anchor="middle" style="font-size: 11px;">0x00 - 0x20: Reserved (Scratch Space)</text>
                                <rect x="370" y="100" width="360" height="30" fill="rgba(255,255,255,0.05)" />
                                <text x="550" y="120" fill="#fff" text-anchor="middle" style="font-size: 11px;">0x40: Free Memory Pointer</text>
                            </svg>
                            <p class="diagram-caption">Figura 11: Interacción entre la pila de ejecución y el heap de memoria lineal.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "eof-future-evm-format",
            title: "12. EOF: El Futuro del Formato EVM (EIP-3540)",
            description: "Separación de código y datos: Hacia una EVM más segura y fácil de auditar.",
            readTime: 260,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Hacia una EVM Estructurada: EOF</h2>
                        <p>Históricamente, el bytecode de la EVM es una secuencia de bytes informe donde el código (instrucciones) y los datos (metadatos, tablas de salto) están mezclados, lo que dificulta el análisis estático y la seguridad. El **EOF (EVM Object Format)**, introducido por una serie de EIPs (incluyendo el 3540), establece un formato de contenedor estructurado. Esto permite que la EVM verifique el código en el momento del despliegue, garantizando que no se ejecuten datos como si fueran instrucciones y eliminando la necesidad de chequeos de seguridad en tiempo de ejecución de alto costo.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Seguridad Determinista y el Fin de los Saltos Dinámicos</h2>
                        <p>Uno de los mayores riesgos forenses es el uso de <code>JUMP</code> y <code>JUMPI</code> con destinos calculados dinámicamente, lo que puede llevar a comportamientos impredecibles si un atacante manipula el stack. EOF introduce **Static Jumps**, donde todos los destinos deben ser validados previamente. En la Whale Academy, vemos el EOF como la transición de la EVM de ser una "máquina de estados salvaje" a un entorno de ejecución de grado industrial, donde la integridad del flujo de control es una garantía matemática, no una esperanza del desarrollador.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>Sección EOF</th><th>Propósito Técnico</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Header</td><td>Versión y Magic Number (0xEF00).</td></tr>
                                    <tr><td>Types</td><td>Firmas de funciones y stack requirements.</td></tr>
                                    <tr><td>Code</td><td>Bytecode puro sin datos intercalados.</td></tr>
                                    <tr><td>Data</td><td>Constantes y recursos inmutables.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "memory-expansion-quadratic-cost",
            title: "13. Expansión de Memoria y el Costo Cuadrático",
            description: "Prevención de ataques de memoria: Por qué el gas explota después de los primeros 724 bytes.",
            readTime: 180,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Curva del Dolor: Costo Cuadrático de Memoria</h2>
                        <p>La memoria en la EVM es un recurso preciado que debe ser protegido contra el abuso. Para ello, el protocolo implementa una función de costo de gas que es lineal hasta los 724 bytes (aproximadamente 22 words) y se vuelve **cuadrática** a partir de ese punto. Esto significa que doblar la cantidad de memoria usada puede costar cuatro veces más gas. Esta medida no es caprichosa; previene que una sola transacción reclame gigabytes de memoria en todos los nodos de la red, lo que causaría el colapso por agotamiento de RAM de la infraestructura global.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Análisis de Desbordamiento y Ataques de Memoria</h2>
                        <p>Para el analista forense, el costo cuadrático es un indicador de anomalías. Si una transacción consume millones de gas solo en expansión de memoria, suele ser síntoma de un <em>Buffer Overflow</em> lógico o de un intento de DoS. Al auditar protocolos de alto rendimiento (como agregadores DEX que manejan arrays dinámicos masivos), la Whale Academy prioriza la reutilización de buffers (Buffer Recycling) para mantenerse en la sección lineal de la curva de costos, asegurando que la scalabilidad del protocolo no se vea truncada por la física económica de la red.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 220" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <polyline points="50,180 250,160 450,100 650,20" fill="none" stroke="#4dff88" stroke-width="3" />
                                <text x="400" y="200" fill="#fff" text-anchor="middle">Memoria Asignada (Bytes)</text>
                                <text x="40" y="100" fill="#fff" transform="rotate(-90, 40, 100)" text-anchor="middle">Gas Cost</text>
                                <line x1="250" y1="180" x2="250" y2="40" stroke="#ff4d4d" stroke-dasharray="4" />
                                <text x="260" y="60" fill="#ff4d4d" style="font-size: 10px;">Umbral Cuadrático (~724 bytes)</text>
                            </svg>
                            <p class="diagram-caption">Figura 13: La explosión exponencial del costo de gas por expansión de memoria ineficiente.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "bytecode-size-limit-eip-170",
            title: "14. Límite de Tamaño de Bytecode (EIP-170)",
            description: "La restricción de los 24KB: Estrategias de fragmentación y contratos proxy.",
            readTime: 150,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Barrera de los 24KB: EIP-170</h2>
                        <p>Tras el ataque de "Spurious Dragon" en 2016, Ethereum introdujo el **EIP-170**, que limita el tamaño máximo de un smart contract a **24,576 bytes**. El objetivo es prevenir un vector de DoS donde un contrato gigantesco requiera un tiempo de lectura de disco y validación superior al tiempo de bloque, deteniendo la red. Aunque los compiladores modernos (especialmente con el optimizador vía IR de Yul) son eficientes, esta restricción física impone un techo duro a la complejidad de la lógica monolítica institucional.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Estrategias de Fragmentación y Diamantes (EIP-2535)</h2>
                        <p>Para superar este límite sin sacrificar la coherencia del protocolo, los arquitectos de la Whale Academy emplean el **Diamond Pattern**. En lugar de un solo contrato, se despliega un proxy que redirige llamadas a múltiples "fetas" (facets) de código, cada una ocupando sus propios 24KB. Forensemente, auditar un Diamante requiere mapear el <em>Selector-to-Facet mapping</em> para asegurar que no existan colisiones de funciones ni "huecos" de seguridad donde una llamada pueda ser interceptada por un contrato malicioso.</p>
                        
                        <div class="technical-box">
                            <strong>Métrica de Densidad:</strong>
                            <p>Un contrato de 24KB puede contener aproximadamente entre 800 y 1,200 líneas de Yul optimizado, lo que subraya la importancia de la modularidad extrema en protocolos de Yield Farming de alta complejidad.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "memory-vs-storage-atomic-persistence",
            title: "15. Memoria vs Storage: La Persistencia Atómica",
            description: "La dicotomía fundamental de la EVM: Volatilidad de ejecución vs inmutabilidad del estado.",
            readTime: 200,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. La Persistencia Atómica: Storage vs Memory</h2>
                        <p>La dicotomía entre **Storage** y **Memory** es la distinción entre el "disco duro" (persistente, caro, visible globalmente) y la "RAM" (efímera, barata, local a la llamada). Cada escritura en <code>Storage</code> (mediante <code>SSTORE</code>) implica una actualización en el Merkle-Patricia Tree global de Ethereum, lo que impacta el hash de estado de toda la red. Por el contrario, un cambio en <code>Memory</code> solo existe en el microsegundo de ejecución del mensaje, desapareciendo sin dejar rastro una vez que la llamada retorna.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Deuda Técnica y Optimización de Gas</h2>
                        <p>El analista forense busca patrones de ineficiencia crítica: contratos que escriben resultados intermedios en el storage en lugar de mantenerlos en memoria hasta el paso final. Una sola escritura innecesaria puede costar 20,000 gas (si el slot cambia de cero), mientras que mil operaciones en memoria podrían costar menos de 500 gas. En la Whale Academy, consideramos el storage como un recurso sagrado que solo debe ser tocado para registrar la "Verdad Final" de la transacción, preservando la eficiencia termodinámica del ecosistema institucional.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>Recurso</th><th>Duración</th><th>Costo Marginal</th><th>Visibilidad</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Stack</td><td>Local (Función)</td><td>3 gas (AVG)</td><td>Privada</td></tr>
                                    <tr><td>Memory</td><td>Local (Mensaje)</td><td>Linear/Cuadrático</td><td>Privada</td></tr>
                                    <tr><td>Storage</td><td>Permanente</td><td>~2,900 - 20,000 gas</td><td>Pública (On-chain)</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "precompiles-cryptographic-acceleration",
            title: "16. Precompiles: Criptografía Acelerada (0x01-0x0A)",
            description: "Puentes hacia el hardware: ECDSA, SHA256 y pruebas ZK integradas en el protocolo.",
            readTime: 220,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Atajos del Protocolo: Los Precompiles</h2>
                        <p>Existen ciertas operaciones criptográficas y matemáticas que son computacionalmente prohibitivas para ser ejecutadas como bytecode estándar de la EVM debido a su complejidad. Para solucionar esto, Ethereum utiliza <strong>Precompiles</strong>: contratos nativos integrados directamente en el código del cliente (como Geth o Nethermind) que residen en direcciones reservadas (del 0x01 al 0x0A). Al llamar a estas direcciones, se ejecuta código en lenguaje nativo (Go, Rust, C++) a una velocidad órdenes de magnitud superior, con un costo de gas predeterminado y altamente eficiente.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. El Arsenal de la Privacidad: BN128 y KZG</h2>
                        <p>Los precompiles son el motor detrás de la privacidad y el escalamiento. Direcciones como <strong>0x06</strong> (BN128 Add) y <strong>0x08</strong> (BN128 Pairing) son fundamentales para verificar pruebas de conocimiento cero (ZK-Proofs). El precompile más reciente, <strong>0x0A</strong> (Point Evaluation), es el pilar del EIP-4844, permitiendo validar los compromisos de blobs. Un analista forense debe dominar este mapa de direcciones nativas para identificar cuándo un contrato está realizando operaciones de alta seguridad o interactuando con capas de disponibilidad de datos institucionales.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>Dirección</th><th>Función Nativa</th><th>Uso Institucional</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>0x01</td><td>ecrecover</td><td>Verificación de Firmas ECDSA.</td></tr>
                                    <tr><td>0x02</td><td>SHA256</td><td>Hashing estándar industrial.</td></tr>
                                    <tr><td>0x06-0x08</td><td>Alt BN128</td><td>Verificación de Pruebas ZK.</td></tr>
                                    <tr><td>0x0A</td><td>Point Eval</td><td>Validación de Blobs EIP-4844.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "returndatacopy-calldatacopy-semantics",
            title: "17. Returndatacopy vs Calldatacopy (EIP-211)",
            description: "Gestión de buffers de entrada y salida: Cómo la EVM maneja datos de longitud dinámica.",
            readTime: 160,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Dinamismo de Intercambio: EIP-211</h2>
                        <p>Antes del **EIP-211**, los contratos de Ethereum sufrían de una rigidez ineficiente: al llamar a otro contrato, debían saber de antemano el tamaño exacto de la respuesta para asignar espacio en memoria. El opcode <code>RETURNDATACOPY</code> (junto con <code>RETURNDATASIZE</code>) introdujo la gestión de buffers dinámicos. Esto permite que un contrato capture la salida de una sub-llamada de cualquier longitud, facilitando patrones de arquitectura de "Passthrough" y Proxies universales que no necesitan conocer la interfaz del contrato subyacente.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Forense de Proxies y Manipulación de Buffers</h2>
                        <p>En la Whale Academy, auditamos cómo los proxies manejan el <code>RETURNDATA</code>. Un fallo común es no limpiar el buffer después de una llamada fallida, lo que puede llevar a que una función posterior interprete por error los datos de una respuesta anterior. El uso correcto de <code>RETURNDATACOPY</code> garantiza que la comunicación entre módulos institucionales sea atómica y que los datos de salida sean una representación fiel y fresca de la ejecución del contrato lógico, sin contaminación cruzada de memoria.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="200" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="150" y="105" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Proxy / Caller</text>
                                
                                <path d="M250 100 L350 100" stroke="#fff" marker-end="url(#arrowhead)" />
                                <text x="300" y="90" fill="#fff" text-anchor="middle" style="font-size: 10px;">CALL</text>
                                
                                <rect x="350" y="50" width="200" height="100" fill="rgba(77,255,136,0.1)" stroke="#4dff88" stroke-width="2" />
                                <text x="450" y="105" fill="#4dff88" text-anchor="middle" style="font-weight: bold;">Implementation</text>
                                
                                <path d="M450 150 Q250 180 150 110" stroke="#ffa600" marker-end="url(#arrowhead)" stroke-width="2" stroke-dasharray="4" />
                                <text x="300" y="175" fill="#ffa600" text-anchor="middle" style="font-size: 10px;">RETURNDATACOPY (Size X)</text>
                            </svg>
                            <p class="diagram-caption">Figura 17: Captura dinámica de datos de salida para interoperabilidad modular asíncrona.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "selfdestruct-eip-6780-nerf",
            title: "18. SELFDESTRUCT y el EIP-6780",
            description: "El opcode que se negó a morir: Cómo se limitó el borrado de contratos en Dencun.",
            readTime: 200,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Ocaso de un Opcode: EIP-6780</h2>
                        <p>El opcode <code>SELFDESTRUCT</code> fue concebido originalmente como una forma de limpiar el estado de Ethereum y recompensar a los usuarios por liberar espacio. Sin embargo, su capacidad para borrar contratos en cualquier momento rompió las asunciones de seguridad de los Verkle Trees y fue abusado para crear contratos "metamórficos". El **EIP-6780 (introducido en la actualización Dencun)** ha "nerfeado" este opcode: ahora solo borra el contrato y el almacenamiento si se llama en la misma transacción en la que el contrato fue creado. En cualquier otro caso, simplemente transfiere el balance de Ether a una dirección destino, pero el código persiste.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Implicaciones para la Resiliencia de Protocolos</h2>
                        <p>Este cambio estructural elimina el riesgo de "suicidio accidental" de protocolos DeFi que usaban <code>SELFDESTRUCT</code> como mecanismo de pausa de emergencia mal diseñado. Para los analistas de la Whale Academy, esto significa una mayor predictibilidad del estado: una dirección que contiene código hoy, seguirá conteniendo el mismo código mañana (a menos que sea un contrato creado en ese mismo bloque). Es un paso fundamental hacia la <strong>Inmutabilidad Absoluta</strong> del estado de la red.</p>
                        
                        <div class="technical-table">
                            <table>
                                <thead>
                                    <tr><th>Escenario</th><th>Comportamiento Pre-Dencun</th><th>Comportamiento Post-EIP-6780</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>Misma TX de creación</td><td>Borrado total + envío fondos.</td><td>Borrado total + envío fondos (Sin cambios).</td></tr>
                                    <tr><td>TX posterior</td><td>Borrado total + envío fondos.</td><td>Solo envía fondos. Bytecode PERSISTE.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "staticcall-state-immutability",
            title: "19. Staticcall y la Inmutabilidad del Estado (EIP-214)",
            description: "Seguridad de solo lectura: Protegiendo el almacenamiento durante consultas externas.",
            readTime: 190,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. Consultas de Solo Lectura: EIP-214</h2>
                        <p>Antes del **EIP-214**, no había una forma nativa a nivel de opcode de garantizar que una llamada externa no modificara el estado. El opcode <code>STATICCALL</code> solucionó esto al introducir un modo de ejecución donde cualquier instrucción que intente modificar el almacenamiento (<code>SSTORE</code>) o emitir eventos (<code>LOG*</code>) provoca una reversión inmediata de la transacción. Esto permite implementar funciones "View" y "Pure" con una garantía de seguridad a nivel de protocolo, protegiendo a los contratos contra ataques de reentrada que intenten alterar balances durante una fase de consulta.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Blindaje contra Reentrancy en Auditorías Pro</h2>
                        <p>Un error clásico en DeFi es realizar una consulta de precio a un pool de liquidez usando <code>CALL</code> en lugar de <code>STATICCALL</code>. Si el pool es malicioso, podría usar esa llamada para reentrar en el contrato original. Al usar <code>STATICCALL</code>, el contrato llamante se asegura de que el entorno externo es pasivo y seguro. En la Whale Academy, exigimos que todas las integraciones de oráculos y validaciones de balances institucionales se realicen bajo el paraguas de <code>STATICCALL</code>, garantizando la inmutabilidad local del estado durante la fase de toma de decisiones.</p>
                        
                        <div class="diagram-container">
                            <svg viewBox="0 0 800 200" style="background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <rect x="50" y="50" width="200" height="100" fill="rgba(77,148,255,0.1)" stroke="#4d94ff" stroke-width="2" />
                                <text x="150" y="105" fill="#4d94ff" text-anchor="middle" style="font-weight: bold;">Auditor Contract</text>
                                
                                <path d="M250 100 L450 100" stroke="#fff" marker-end="url(#arrowhead)" stroke-width="3" />
                                <text x="350" y="90" fill="#fff" text-anchor="middle" style="font-weight: bold;">STATICCALL</text>
                                
                                <rect x="450" y="50" width="250" height="100" fill="rgba(255,77,77,0.1)" stroke="#ff4d4d" stroke-width="2" />
                                <text x="575" y="95" fill="#ff4d4d" text-anchor="middle" style="font-weight: bold;">Untrusted Pool</text>
                                <text x="575" y="125" fill="#fff" text-anchor="middle" style="font-size: 11px;">(Intentar SSTORE  REVERSA)</text>
                                
                                <path d="M575 140 Q400 170 250 120" stroke="#ff4d4d" stroke-width="2" stroke-dasharray="4" marker-end="url(#cross)" />
                                <text x="400" y="175" fill="#ff4d4d" text-anchor="middle" style="font-size: 10px;">REENTRANCY BLOCKED ️</text>
                            </svg>
                            <p class="diagram-caption">Figura 19: El escudo de inmutabilidad forzada mediante ejecución estática.</p>
                        </div>
                    </section>
                </div>`
        },
        {
            id: "bytecode-verification-sourcify-rigor",
            title: "20. Verificación de Bytecode vs Fuente (Sourcify)",
            description: "Forense de la verdad única: Asegurando que el código desplegado coincide con el auditado.",
            readTime: 270,
            content: `<div class="academy-article">
                    <section class="pro-section">
                        <div class="pro-badge">LEGENDARY GRADE</div>
                        <h2>I. El Hash del Metadato: Forense de Sourcify</h2>
                        <p>Cuando un contrato inteligente es compilado, el compilador de Solidity añade al final del bytecode un hash <strong>CBOR-encoded</strong> que apunta a un archivo de metadatos en IPFS. Este archivo contiene la configuración exacta del compilador, las versiones de las librerías y la ruta de los archivos de origen. La verificación en exploradores comunes (como Etherscan) suele ser "parcial" si no se proporcionan los metadatos exactos. Herramientas como <strong>Sourcify</strong> permiten una verificación "full", garantizando que hasta el último comentario del código fuente coincide con el artefacto desplegado on-chain.</p>
                    </section>

                    <section class="pro-section">
                        <h2>II. Transparencia Absoluta de Grado Institucional</h2>
                        <p>Para un analista forense de la Whale Academy, la "verdad" no reside en el código pegado en una interfaz web, sino en la correspondencia aritmética entre el bytecode y el fuente. Al auditar una bóveda de $100M, realizamos una verificación local recreando el entorno de compilación exacto. Si el hash del metadato difiere, incluso por un solo bit, el contrato se considera <strong>no verificado</strong> desde una perspectiva de riesgo institucional. Esta es la base de la transparencia inyectada: el código es ley, pero solo si puedes probar que el código que ves es el código que se ejecuta.</p>
                        
                        <div class="technical-box">
                            <strong>Workflow de Verificación:</strong>
                            <ol>
                                <li>Capturar bytecode runtime desde la dirección del contrato.</li>
                                <li>Extraer el hash CBOR del final del bytecode.</li>
                                <li>Recrear la compilación con la misma versión de Solc y flags de optimización.</li>
                                <li>Comparar el hash resultante. Si coinciden, la integridad es del 100%.</li>
                            </ol>
                        </div>
                    </section>
                </div>`
        }
    ]
}
];
