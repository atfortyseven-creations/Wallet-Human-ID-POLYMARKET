-- ============================================
-- SECURITY & PREMIUM TABLES
-- ============================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'FREE',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "expiresAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Watched wallets table
CREATE TABLE IF NOT EXISTS "WatchedWallet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "tags" TEXT[],
  "notes" TEXT,
  "totalValue" DECIMAL(65,30),
  "lastActivity" TIMESTAMP(3),
  "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WatchedWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WatchedWallet_userId_address_key" ON "WatchedWallet"("userId", "address");

-- Alert rules table
CREATE TABLE IF NOT EXISTS "AlertRule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "triggerCount" INTEGER NOT NULL DEFAULT 0,
  "lastTriggered" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AlertRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Whale activities table (real-time feed)
CREATE TABLE IF NOT EXISTS "WhaleActivity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "walletAddress" TEXT NOT NULL,
  "transactionHash" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "usdValue" DECIMAL(65,30) NOT NULL,
  "fromAddress" TEXT,
  "toAddress" TEXT,
  "protocol" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockNumber" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "WhaleActivity_walletAddress_idx" ON "WhaleActivity"("walletAddress");
CREATE INDEX IF NOT EXISTS "WhaleActivity_timestamp_idx" ON "WhaleActivity"("timestamp");
CREATE UNIQUE INDEX IF NOT EXISTS "WhaleActivity_transactionHash_key" ON "WhaleActivity"("transactionHash");

-- Audit logs table
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "metadata" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- Security events table
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "event" TEXT NOT NULL,
  "details" JSONB NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_timestamp_idx" ON "SecurityEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- ============================================
-- GAMIFICATION TABLES (ADDICTIVE FEATURES)
-- ============================================

-- User achievements/badges
CREATE TABLE IF NOT EXISTS "Achievement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "tier" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Achievement_userId_idx" ON "Achievement"("userId");

-- User stats (for leaderboard)
CREATE TABLE IF NOT EXISTS "UserStats" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "totalWatchedWallets" INTEGER NOT NULL DEFAULT 0,
  "totalAlerts" INTEGER NOT NULL DEFAULT 0,
  "totalCopyTrades" INTEGER NOT NULL DEFAULT 0,
  "copyTradeWinRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "totalProfitUSD" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastActiveDate" TIMESTAMP(3),
  "experiencePoints" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserStats_userId_key" ON "UserStats"("userId");

-- Daily login tracking (for streaks)
CREATE TABLE IF NOT EXISTS "DailyLogin" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "loginDate" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyLogin_userId_loginDate_key" ON "DailyLogin"("userId", "loginDate");

-- Copy trade history (for performance tracking)
CREATE TABLE IF NOT EXISTS "CopyTrade" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "signalWalletAddress" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "entryPrice" DECIMAL(65,30) NOT NULL,
  "exitPrice" DECIMAL(65,30),
  "profitUSD" DECIMAL(65,30),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "CopyTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CopyTrade_userId_idx" ON "CopyTrade"("userId");
CREATE INDEX IF NOT EXISTS "CopyTrade_status_idx" ON "CopyTrade"("status");

-- Leaderboard cache (updated hourly)
CREATE TABLE IF NOT EXISTS "Leaderboard" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DECIMAL(65,30) NOT NULL,
  "rank" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Leaderboard_metric_rank_idx" ON "Leaderboard"("metric", "rank");
CREATE INDEX IF NOT EXISTS "Leaderboard_userId_idx" ON "Leaderboard"("userId");

-- Notifications (for real-time alerts)
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "actionUrl" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
