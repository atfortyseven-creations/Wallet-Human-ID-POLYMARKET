#!/bin/bash

# ============================================================================
# Pre-Deployment Verification Script
# ============================================================================
# 
# Run this script BEFORE deploying to Railway to catch potential issues
#
# Usage: bash scripts/pre-deploy-check.sh
# ============================================================================

set -e

echo "🔍 Pre-Deployment Verification for Railway"
echo "==========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Current version: $NODE_VERSION"
if [[ ! "$NODE_VERSION" =~ ^v2[0-9]\. ]]; then
    echo -e "${YELLOW}⚠️  Warning: Node version should be >= 20.x${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Node version OK${NC}"
fi
echo ""

# Check 2: Environment variables
echo "🔐 Checking critical environment variables..."
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing: $var${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✅ $var is set${NC}"
    fi
done
echo ""

# Check 3: Prisma schema validation
echo "🗄️  Validating Prisma schema..."
if npx prisma validate; then
    echo -e "${GREEN}✅ Prisma schema is valid${NC}"
else
    echo -e "${RED}❌ Prisma schema validation failed${NC}"
    ((ERRORS++))
fi
echo ""

# Check 4: TypeScript compilation (without running next build)
echo "📝 Type-checking TypeScript..."
if npx tsc --noEmit --skipLibCheck; then
    echo -e "${GREEN}✅ TypeScript compilation OK${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript has errors (may not be critical)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 5: Check for case-sensitive path issues
echo "📁 Checking for case-sensitive path plugin..."
if grep -q "case-sensitive-paths-webpack-plugin" package.json; then
    echo -e "${GREEN}✅ Case-sensitive paths plugin is installed${NC}"
else
    echo -e "${RED}❌ Case-sensitive paths plugin is missing${NC}"
    echo "   Run: npm install --save-dev case-sensitive-paths-webpack-plugin"
    ((ERRORS++))
fi
echo ""

# Check 6: Verify migration files exist
echo "📋 Checking database migration files..."
MIGRATION_DIR="prisma/migrations/20260131120000_phase2_3_4_init"
if [ -d "$MIGRATION_DIR" ]; then
    echo -e "${GREEN}✅ Migration 20260131120000_phase2_3_4_init exists${NC}"
else
    echo -e "${RED}❌ Migration directory not found: $MIGRATION_DIR${NC}"
    ((ERRORS++))
fi
echo ""

# Check 7: Verify build:railway script
echo "🚂 Checking Railway build script..."
if grep -q '"build:railway"' package.json; then
    echo -e "${GREEN}✅ build:railway script is configured${NC}"
else
    echo -e "${RED}❌ build:railway script is missing in package.json${NC}"
    ((ERRORS++))
fi
echo ""

# Check 8: Test local build (optional, takes time)
read -p "🔨 Run full build test? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building application..."
    if npm run build; then
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        ((ERRORS++))
    fi
    echo ""
fi

# Summary
echo "==========================================="
echo "📊 PRE-DEPLOYMENT SUMMARY"
echo "==========================================="
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED${NC}"
    echo ""
    echo "✅ You're ready to deploy to Railway!"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m \"fix: resolve database migration and routing issues\""
    echo "3. git push"
    echo "4. Monitor Railway deployment logs"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) detected${NC}"
    echo ""
    echo "You can proceed with caution, but review the warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) detected${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) detected${NC}"
    echo ""
    echo "Please fix the errors before deploying to Railway."
    exit 1
fi
