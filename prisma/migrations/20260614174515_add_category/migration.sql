-- Add the admin-managed Category taxonomy table.
--
-- ADDITIVE ONLY: new table + unique slug index. Does NOT touch the Post
-- table — posts keep storing categories as `Post.categories String[]` of
-- slugs (GIN index unchanged). This table is the dynamic source of truth
-- for which slugs are valid and their bilingual labels.
--
-- The 6 seed rows mirror the original static taxonomy (slugs unchanged) so
-- existing posts' category slugs still resolve after this deploys. The seed
-- INSERT is idempotent (ON CONFLICT DO NOTHING on the unique slug), so the
-- `prisma migrate deploy` release_command can run it safely on every deploy.

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "sort" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- Seed the 6 existing taxonomy categories (idempotent).
-- ids are deterministic so re-runs across machines stay stable.
INSERT INTO "Category" ("id", "slug", "nameEn", "nameAr", "sort", "createdAt", "updatedAt") VALUES
    ('cat_autism',                'autism',                'Autism Spectrum',      'طيف التوحد',      1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_down_syndrome',         'down-syndrome',         'Down Syndrome',        'متلازمة داون',    2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_learning_difficulties', 'learning-difficulties', 'Learning Difficulties', 'صعوبات التعلم',  3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_family_support',        'family-support',        'Family Support',       'دعم الأسرة',      4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_assessment',            'assessment',            'Assessment',           'التقييم',         5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat_therapy',               'therapy',               'Therapy',              'العلاج',          6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
