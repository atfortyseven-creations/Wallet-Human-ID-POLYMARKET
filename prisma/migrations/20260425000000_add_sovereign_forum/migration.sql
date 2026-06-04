-- 
-- SOVEREIGN FORUM  Manual Migration
-- Creates all 6 Forum tables atomically. Leaves all existing tables untouched.
-- 

-- ForumCategory
CREATE TABLE IF NOT EXISTS "ForumCategory" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "slug"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "color"       TEXT NOT NULL DEFAULT '#888888',
    "orderIndex"  INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ForumCategory_slug_key" ON "ForumCategory"("slug");

-- ForumTag
CREATE TABLE IF NOT EXISTS "ForumTag" (
    "id"   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    CONSTRAINT "ForumTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ForumTag_name_key" ON "ForumTag"("name");

-- ForumTopic
CREATE TABLE IF NOT EXISTS "ForumTopic" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title"      TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "views"      INTEGER NOT NULL DEFAULT 0,
    "isPinned"   BOOLEAN NOT NULL DEFAULT false,
    "isLocked"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumTopic_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ForumTopic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ForumCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ForumTopic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ForumTopic_categoryId_createdAt_idx" ON "ForumTopic"("categoryId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ForumTopic_authorId_createdAt_idx" ON "ForumTopic"("authorId", "createdAt" DESC);

-- ForumTopic  ForumTag (M2M join table)
CREATE TABLE IF NOT EXISTS "_TopicTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TopicTags_AB_pkey" PRIMARY KEY ("A", "B"),
    CONSTRAINT "_TopicTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ForumTag"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TopicTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "_TopicTags_B_index" ON "_TopicTags"("B");

-- ForumPost
CREATE TABLE IF NOT EXISTS "ForumPost" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "content"    TEXT NOT NULL,
    "topicId"    TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "replyToId"  TEXT,
    "isSolution" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ForumPost_topicId_fkey"   FOREIGN KEY ("topicId")   REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_authorId_fkey"  FOREIGN KEY ("authorId")  REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ForumPost_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ForumPost"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ForumPost_topicId_createdAt_idx" ON "ForumPost"("topicId", "createdAt" ASC);

-- ForumLike
CREATE TABLE IF NOT EXISTS "ForumLike" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"    TEXT NOT NULL,
    "topicId"   TEXT,
    "postId"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumLike_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ForumLike_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumLike_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumLike_postId_fkey"  FOREIGN KEY ("postId")  REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ForumLike_userId_topicId_key" ON "ForumLike"("userId", "topicId");
CREATE UNIQUE INDEX IF NOT EXISTS "ForumLike_userId_postId_key" ON "ForumLike"("userId", "postId");

-- ForumNotification
CREATE TABLE IF NOT EXISTS "ForumNotification" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"    TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "actorId"   TEXT NOT NULL,
    "topicId"   TEXT,
    "postId"    TEXT,
    "isRead"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumNotification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ForumNotification_userId_fkey"  FOREIGN KEY ("userId")  REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumNotification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ForumNotification_userId_isRead_createdAt_idx" ON "ForumNotification"("userId", "isRead", "createdAt" DESC);
