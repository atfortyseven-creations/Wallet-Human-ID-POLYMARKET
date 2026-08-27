# P2-C.1 Studio Pilot — Final Test Results

> Updated: 2026-08-24  
> Phase: **Step 5 (E2E & Security) & Step 6 (Final Gate)**  
> Mode Tested: **PILOT**  

---

## 1. E2E & Mutation Results

En el entorno QA con la bandera `NEXT_PUBLIC_IDENTITY_SIWE_STUDIO_ENABLED="PILOT"`, se verificó que la integración del Identity Adapter reacciona y resuelve ambas identidades en paralelo.

| Endpoint | Resultado PILOT | Comportamiento |
|---|---|---|
| `POST /api/passport` | HTTP 201 | Creado correctamente validando ambas sesiones (humanity_session / ledger_session) |
| `POST /api/premium/prover` | HTTP 403 | Bloqueo por Tier (funcionamiento idéntico y correcto) |
| `POST /api/aztec/transfer` | HTTP 403 | Verificación fallida de saldo/claims (funcionamiento correcto) |
| `POST /api/provenance/log` | HTTP 200 | Log insertado correctamente. |

---

## 2. Revocation Race Gap Closure (Option D Verification)

Se diseñó una prueba destructiva (`Step 8`) explícitamente para comprobar que Option D neutraliza la vulnerabilidad:

1. **ANTES (Baseline)**: Si un atacante mantenía el JWT y la sesión de BD se revocaba, podía seguir enviando mutaciones y éstas se ejecutaban.
2. **DESPUÉS (Pilot)**: 
   - Petición con JWT y sesión BD Válida → `HTTP 201 (SUCCESS)`
   - Se revoca la `HumanitySession` en la Base de Datos (`revokedAt = now()`)
   - Petición con el MISMO JWT no expirado → `HTTP 401 (UNAUTHORIZED)`

**FINDING**: ✅ SUCCESS: Revocation correctly blocks mutations via Option D inside Prisma Transaction.
El Transaction Hook impide la escritura al interceptar la lectura de la sesión en el mismo statement.

---

## 3. Concurrency Check

Para la concurrencia a nivel de base de datos se lanzaron N=5 mutaciones simultáneas de creación de pasaportes.

* N=5 | 201=3 | 429/403=2 
* El sistema soportó la sobrecarga atómica sin colgar transacciones en la capa de persistencia (la rate limit saltó para 2 peticiones y el Transaction Isolation manejó correctamente los 3 exitosos).

---

## 4. Final Gate

```
P2-C.1 Studio Pilot:
- QA Baseline          → PASS
- Identity Migration   → PASS
- Transaction Security → PASS
- Concurrency Tests    → PASS
- Revocation tests     → PASS
```

**ESTADO FINAL DE P2-C.1**: PILOT COMPLETADO SATISFACTORIAMENTE.
