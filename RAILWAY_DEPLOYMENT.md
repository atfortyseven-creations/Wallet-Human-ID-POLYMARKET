# Railway Deployment - Quick Reference

This guide helps you resolve the intermittent access failures caused by database migration issues and case-sensitivity problems.

## 🚨 Problem Summary

- **Migration `20260131120000_phase2_3_4_init` rolled back**: Database is in inconsistent state
- **Case-sensitive paths**: Windows development vs Linux production causing module resolution failures  
- **Middleware blocking valid requests**: Requests without origin (health checks) being blocked

## ✅ Fixes Applied

### 1. Database Migration Handling
- Created `scripts/check-migration-status.ts` - Diagnoses database state
- Created `scripts/resolve-migration.sh` - Interactive migration resolution
- Updated `package.json` with `build:railway` script that runs `npx prisma migrate deploy` before build
- Updated `railway.json` to use `build:railway` command

### 2. Case-Sensitivity Protection  
- Installed `case-sensitive-paths-webpack-plugin`
- Added plugin to `next.config.js` webpack configuration
- Will catch Windows/Linux path mismatches during build

### 3. Middleware Improvements
- Fixed middleware to allow requests without `origin` header (Railway health checks, SSR)
- Maintains security by blocking unauthorized origins
- Added better logging for debugging

## 📋 Deployment Checklist

### Before Deploying

```bash
# 1. Run pre-deployment checks
bash scripts/pre-deploy-check.sh

# 2. Verify local build works
npm run build:railway

# 3. Check migration status (optional)
npm run check-migration
```

### Deploy to Railway

```bash
# Commit changes
git add .
git commit -m "fix: resolve database migration and routing issues"
git push

# Railway will automatically:
# 1. Run `npm run build:railway`
# 2. Execute `npx prisma migrate deploy`
# 3. Build the application
# 4. Start with `npm start`
```

### After Deployment

Monitor Railway logs for:
- ✅ "Migration 20260131120000_phase2_3_4_init applied" or "already applied"
- ✅ Build completes without "Module not found" errors
- ✅ No middleware "Blocked request" warnings from valid sources
- ✅ `/api/auth/session` requests succeed

### Testing Access

Test with different scenarios:
1. **Existing user login** - Should work immediately
2. **New user registration** - Should work after migration fix
3. **Wallet features** - `/api/wallet/*` endpoints should respond
4. **Different browsers/devices** - Verify consistent access

## 🔧 Manual Migration Fix (if auto-deploy fails)

If automatic migration fails, connect to Railway database:

```bash
# Check database state
railway run npm run check-migration

# Option A: Tables exist but marked as rolled back
railway run npx prisma migrate resolve --applied 20260131120000_phase2_3_4_init

# Option B: Tables don't exist
railway run npx prisma migrate deploy
```

## 📊 Files Modified

- `package.json` - Added `build:railway`, `migrate:status`, `check-migration` scripts
- `railway.json` - Updated build command to `npm run build:railway`
- `next.config.js` - Added case-sensitive paths webpack plugin
- `middleware.ts` - Fixed origin validation logic

## 🆘 Troubleshooting

**Build fails with "Module not found":**
- Check case-sensitivity of all imports
- Verify all file references match exact filesystem case

**Users still can't access:**
- Check Railway logs for migration status
- Verify all environment variables are set
- Check middleware isn't blocking legitimate requests

**Database errors persist:**
- Manually run migration resolution script via Railway CLI
- Verify DATABASE_URL is correctly configured
