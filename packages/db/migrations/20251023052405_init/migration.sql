-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeChannel" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeVideo" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "parentId" TEXT,
    "text" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorChannelId" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YoutubeComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramPage" (
    "id" TEXT NOT NULL,
    "fbPageId" TEXT NOT NULL,
    "igId" TEXT,
    "username" TEXT,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramMedia" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "caption" TEXT,
    "permalink" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstagramMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramComment" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "parentId" TEXT,
    "text" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstagramComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationRule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModerationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_provider_key" ON "Account"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeChannel_channelId_key" ON "YoutubeChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeVideo_videoId_key" ON "YoutubeVideo"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "YoutubeComment_commentId_key" ON "YoutubeComment"("commentId");

-- CreateIndex
CREATE INDEX "YoutubeComment_videoId_idx" ON "YoutubeComment"("videoId");

-- CreateIndex
CREATE INDEX "YoutubeComment_authorChannelId_idx" ON "YoutubeComment"("authorChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramPage_fbPageId_key" ON "InstagramPage"("fbPageId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramMedia_mediaId_key" ON "InstagramMedia"("mediaId");

-- CreateIndex
CREATE INDEX "InstagramMedia_pageId_idx" ON "InstagramMedia"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramComment_commentId_key" ON "InstagramComment"("commentId");

-- CreateIndex
CREATE INDEX "InstagramComment_mediaId_idx" ON "InstagramComment"("mediaId");

-- CreateIndex
CREATE INDEX "InstagramComment_username_idx" ON "InstagramComment"("username");

-- CreateIndex
CREATE INDEX "ModerationRule_userId_enabled_idx" ON "ModerationRule"("userId", "enabled");

-- CreateIndex
CREATE INDEX "ModerationAction_status_idx" ON "ModerationAction"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_platform_createdAt_idx" ON "WebhookLog"("platform", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeChannel" ADD CONSTRAINT "YoutubeChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeVideo" ADD CONSTRAINT "YoutubeVideo_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "YoutubeChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YoutubeComment" ADD CONSTRAINT "YoutubeComment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "YoutubeVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramPage" ADD CONSTRAINT "InstagramPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramMedia" ADD CONSTRAINT "InstagramMedia_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "InstagramPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramComment" ADD CONSTRAINT "InstagramComment_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "InstagramMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationRule" ADD CONSTRAINT "ModerationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ModerationRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
