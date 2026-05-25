-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "placements" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Post_categories_idx" ON "Post" USING GIN ("categories");

-- CreateIndex
CREATE INDEX "Post_placements_idx" ON "Post" USING GIN ("placements");
