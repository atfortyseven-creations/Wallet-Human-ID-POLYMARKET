#!/bin/bash
set -euo pipefail

echo "============================================================"
echo "  AZTEC TESTNET COMPILATION — v4.4.0 — Precisión Absoluta"
echo "============================================================"

# ── Rutas absolutas confirmadas por inspección WSL ──────────────
AZTEC_VERSION="4.4.0"
AZTEC_BASE="/home/atfortyseven/.aztec/versions/$AZTEC_VERSION"
NARGO_BIN="$AZTEC_BASE/internal-bin/nargo"
AZTEC_CLI="$AZTEC_BASE/bin/aztec"

# ── Verificar que los binarios existen ─────────────────────────
if [ ! -f "$NARGO_BIN" ]; then
  echo "[ERROR] nargo no encontrado en: $NARGO_BIN"
  exit 1
fi
if [ ! -f "$AZTEC_CLI" ]; then
  echo "[ERROR] aztec CLI no encontrado en: $AZTEC_CLI"
  exit 1
fi

# ── Cargar nvm (node 20.19.0) ──────────────────────────────────
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ── CRÍTICO: añadir nargo al PATH antes de cualquier compilación ─
# El CLI de aztec invoca "nargo" como proceso hijo — debe estar en PATH
export PATH="$AZTEC_BASE/internal-bin:$AZTEC_BASE/bin:$PATH"

echo "[env] Node:  $(node --version)"
echo "[env] nargo: $($NARGO_BIN --version 2>/dev/null | head -1)"
echo "[env] aztec: $AZTEC_CLI"
echo "[env] nargo en PATH: $(which nargo)"

# ── Contratos a compilar ───────────────────────────────────────
PROJECT_ROOT="/mnt/d/Projects/Wallet Human Polymarket ID"
CONTRACTS_DIR="$PROJECT_ROOT/noir-projects/contracts"

CONTRACTS=(
  "registry-contract"
  "paymaster-contract"
  "account-contract"
)

ERRORS=0

echo ""
echo "[compile] Iniciando compilación..."

for contract in "${CONTRACTS[@]}"; do
  CONTRACT_PATH="$CONTRACTS_DIR/$contract"
  echo ""
  echo "  ⏳ $contract"

  if [ ! -d "$CONTRACT_PATH" ]; then
    echo "  ❌ Directorio no encontrado: $CONTRACT_PATH"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  if [ ! -f "$CONTRACT_PATH/Nargo.toml" ]; then
    echo "  ❌ Nargo.toml faltante"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  cd "$CONTRACT_PATH"

  # Usar el aztec CLI v4.4.0 — nargo está en PATH ahora
  if "$AZTEC_CLI" compile 2>&1; then
    echo "  ✅ $contract — compilado con éxito"
  else
    echo "  ❌ $contract — error"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "============================================================"
if [ "$ERRORS" -eq 0 ]; then
  echo "  🚀 Todos los contratos compilados para Testnet"
else
  echo "  ⚠️  $ERRORS contrato(s) con errores"
fi
echo "============================================================"

exit $ERRORS
