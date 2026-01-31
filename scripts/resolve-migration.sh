#!/bin/bash

# ============================================================================
# Railway Database Migration Resolution Script
# ============================================================================
# 
# This script resolves the rolled-back migration issue by:
# 1. Checking the current database state
# 2. Applying the appropriate resolution command
#
# Run on Railway: railway run bash scripts/resolve-migration.sh
# ============================================================================

set -e

echo "🚀 Railway Migration Resolution Script"
echo "========================================"

# Check if we're in Railway environment
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
  echo "⚠️  Warning: Not running in Railway environment"
  echo "   This script is designed for Railway deployment"
  read -p "   Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo "📊 Step 1: Checking migration status..."
npx prisma migrate status

echo ""
echo "🔍 Step 2: Checking database tables..."
npx ts-node scripts/check-migration-status.ts

echo ""
echo "💡 Step 3: Resolution Options"
echo "========================================"
echo "A) If tables exist but migration shows 'rolled back':"
echo "   → Mark migration as applied (safe, no changes)"
echo ""
echo "B) If tables are missing:"
echo "   → Deploy migration (creates tables)"
echo ""

read -p "Which option? (A/B): " -n 1 -r
echo

if [[ $REPLY =~ ^[Aa]$ ]]; then
  echo ""
  echo "✅ Marking migration as applied..."
  npx prisma migrate resolve --applied 20260131120000_phase2_3_4_init
  echo "✅ Migration marked as applied successfully!"
elif [[ $REPLY =~ ^[Bb]$ ]]; then
  echo ""
  echo "🔨 Deploying migration..."
  npx prisma migrate deploy
  echo "✅ Migration deployed successfully!"
else
  echo "❌ Invalid option. Exiting."
  exit 1
fi

echo ""
echo "🎉 DONE! Verifying final state..."
npx prisma migrate status

echo ""
echo "✅ Migration resolution complete!"
echo "   You can now deploy your application."
