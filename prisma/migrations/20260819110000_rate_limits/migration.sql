CREATE TABLE "RateLimitEvent" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RateLimitEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RateLimitEvent_action_keyHash_createdAt_idx" ON "RateLimitEvent"("action", "keyHash", "createdAt");
CREATE INDEX "RateLimitEvent_createdAt_idx" ON "RateLimitEvent"("createdAt");
