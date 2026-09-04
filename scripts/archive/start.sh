#!/bin/sh
# 
# SOVEREIGN TERMINAL — CRASH-PROOF BOOT SEQUENCE WITH AZTEC PXE
# 
# Phases:
#   0. Aztec PXE sidecar startup (connects to rpc.testnet.aztec-labs.com)
#   1. Prisma client generation
#   2. Database schema sync
#   3. PM2 process mesh

export PRISMA_HIDE_UPDATE_MESSAGE=1
export NPM_CONFIG_UPDATE_NOTIFIER=false
export NO_UPDATE_NOTIFIER=1

# ─── PHASE 0: Aztec PXE Sidecar ─────────────────────────────────────────────
echo "[System] "
echo "[System] Phase 0: Starting Aztec Mainnet PXE sidecar..."
echo "[System] "

AZTEC_NODE_URL="${AZTEC_NODE_URL:-https://rpc.testnet.aztec-labs.com}"
AZTEC_PXE_PORT="${PXE_PORT:-8080}"

if command -v aztec > /dev/null 2>&1; then
  echo "[Aztec] CLI found: $(aztec --version 2>/dev/null || echo 'unknown')"
  echo "[Aztec] Connecting PXE to: $AZTEC_NODE_URL"

  aztec start --pxe \
    --pxe.nodeUrl "$AZTEC_NODE_URL" \
    --pxe.port "$AZTEC_PXE_PORT" \
    > /tmp/pxe.log 2>&1 &

  PXE_PID=$!
  echo "[Aztec] PXE process started (PID: $PXE_PID), waiting for readiness..."

  READY=0
  for i in $(seq 1 20); do
    sleep 3
    if curl -sf "http://localhost:$AZTEC_PXE_PORT/status" > /dev/null 2>&1; then
      READY=1
      echo "[Aztec] ✅ PXE ready on port $AZTEC_PXE_PORT"
      break
    fi
    echo "[Aztec] Waiting... attempt $i/20"
  done

  if [ "$READY" = "0" ]; then
    echo "[Aztec] ⚠️  PXE did not respond in time — app will continue without live PXE."
    echo "[Aztec] PXE log:"
    cat /tmp/pxe.log || true
  fi
else
  echo "[Aztec] CLI not installed. To enable real Aztec transfers, install aztec CLI in the Dockerfile."
  echo "[Aztec] Alternatively, set AZTEC_PXE_URL to an external PXE endpoint."
fi

# ─── Fallback: Rewrite DATABASE_URL to internal Railway URL ─────────────────
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *proxy.rlwy.net*)
      echo "[System] Rewriting public proxy DATABASE_URL to internal Railway network..."
      export DATABASE_URL=$(echo "$DATABASE_URL" | sed -E 's/@[^/]+/@postgres.railway.internal:5432/')
      MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/:[^:@/]+@/:****@/')
      echo "[System] Internal DATABASE_URL: $MASKED_URL"
      ;;
  esac
fi

# ─── PHASE 1: Prisma ─────────────────────────────────────────────────────────
echo "[System] "
echo "[System] Phase 1: Prisma client generation..."
echo "[System] "
npx --quiet prisma generate 2>&1 | grep -v 'npm notice' | grep -v 'Update available' | grep -v 'major update' | grep -v 'pris.ly' | grep -v 'npm i ' || echo "[System] WARNING: prisma generate failed — continuing"

# ─── PHASE 2: Database sync ──────────────────────────────────────────────────
echo "[System] "
echo "[System] Phase 2: Database schema synchronization..."
echo "[System] "

node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function clean() {
  try {
    const res1 = await p.\$executeRawUnsafe(\`
      DELETE FROM \"WatchedWallet\" a
      USING \"WatchedWallet\" b
      WHERE a.id > b.id
        AND a.\"userId\" = b.\"userId\"
        AND a.address = b.address
    \`);
    console.log('[System] WatchedWallet Dedup OK — rows removed: ' + res1);
  } catch(e) { console.log('[System] WatchedWallet Dedup skipped: ' + e.message); }

  try {
    const res2 = await p.\$executeRawUnsafe(\`
      DELETE FROM \"ExchangeBalance\" a
      USING \"ExchangeBalance\" b
      WHERE a.id > b.id
        AND a.\"userId\" = b.\"userId\"
        AND a.asset = b.asset
    \`);
    console.log('[System] ExchangeBalance Dedup OK — rows removed: ' + res2);
  } catch(e) { console.log('[System] ExchangeBalance Dedup skipped: ' + e.message); }
  
  await p.\$disconnect();
}
clean();
" || echo "[System] Dedup step skipped"

npx prisma db push --accept-data-loss 2>&1 | grep -v 'npm notice' | grep -v 'Update available' | grep -v 'major update' | grep -v 'pris.ly' | grep -v 'npm i ' || echo "[System] WARNING: db push failed"

echo "[System] Phase 2.1: Database Seeding..."
npm run db:seed || echo "[System] WARNING: db seed failed"

# ─── PHASE 3: Launch PM2 ─────────────────────────────────────────────────────
echo "[System] "
echo "[System] Phase 3: Launching PM2 process mesh..."
echo "[System] Port: ${PORT:-3000}"
echo "[System] "
exec ./node_modules/.bin/pm2-runtime start /app/ecosystem.config.json
