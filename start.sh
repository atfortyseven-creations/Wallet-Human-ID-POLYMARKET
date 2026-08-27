#!/bin/bash
set -e

echo "[start.sh] Booting Ledger Network — humanidfi.com"
echo "[start.sh] NODE_ENV=${NODE_ENV}"
echo "[start.sh] PORT=${PORT:-3000}"

# Run pending Prisma migrations (non-breaking — only applies new migrations)
if [ -f "/app/prisma/schema.prisma" ]; then
  echo "[start.sh] Running Prisma migrations..."
  npx prisma migrate deploy --schema=/app/prisma/schema.prisma 2>/dev/null || echo "[start.sh] Migration skipped or already up-to-date."
fi

# Start the Next.js production server
echo "[start.sh] Starting Next.js server on port ${PORT:-3000}..."
exec npm run start:prod
