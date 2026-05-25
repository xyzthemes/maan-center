-- CreateEnum
CREATE TYPE "ContentBlockType" AS ENUM ('testimonial', 'faq_item', 'stat_tile', 'team_member', 'service_card');

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "locale" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "placements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "sort" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentBlock_type_status_locale_idx" ON "ContentBlock"("type", "status", "locale");

-- CreateIndex
CREATE INDEX "ContentBlock_placements_idx" ON "ContentBlock" USING GIN ("placements");
