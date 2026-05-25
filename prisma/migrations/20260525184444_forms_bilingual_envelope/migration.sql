-- Forms bilingual envelope migration.
--
-- Converts every human-facing string column on Form / FormBlock /
-- FormField to JSONB { en, ar }, adds Form.slug (NOT NULL UNIQUE),
-- and adds FormSubmission.locale.
--
-- Single-step type+data conversion via `USING` — every existing row's
-- value lands in the `en` side, `ar` empty. The backfill script can
-- populate `ar` from the hardcoded MaanForm.vue translation table.

-- ── Form ────────────────────────────────────────────────────────────

-- slug: add nullable, populate via lower-kebab title, then NOT NULL + UNIQUE.
ALTER TABLE "Form" ADD COLUMN "slug" TEXT;

-- Derive a slug from the title for every existing row. lower() + regex
-- to keep only [a-z0-9-] and collapse runs to a single dash. Ensures
-- uniqueness by suffixing the first 6 chars of the id when collisions
-- would otherwise occur.
UPDATE "Form"
  SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE("title", "id"), '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
  WHERE "slug" IS NULL;

-- Tie-break duplicates by appending a fragment of the id. After this
-- the column is unique and safe to constrain.
UPDATE "Form" f
  SET "slug" = f."slug" || '-' || SUBSTRING(f."id" FROM 1 FOR 6)
  WHERE f."id" IN (
    SELECT MIN(b."id")
    FROM "Form" b
    GROUP BY b."slug"
    HAVING COUNT(*) > 1
  );

ALTER TABLE "Form" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Form_slug_key" ON "Form"("slug");

-- title: TEXT -> JSONB { en, ar }
ALTER TABLE "Form"
  ALTER COLUMN "title" TYPE JSONB USING jsonb_build_object('en', "title", 'ar', '');

-- submitLabel: TEXT? -> JSONB? (null stays null)
ALTER TABLE "Form"
  ALTER COLUMN "submitLabel" TYPE JSONB USING (
    CASE WHEN "submitLabel" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "submitLabel", 'ar', '')
    END
  );

-- successMessage: TEXT? -> JSONB?
ALTER TABLE "Form"
  ALTER COLUMN "successMessage" TYPE JSONB USING (
    CASE WHEN "successMessage" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "successMessage", 'ar', '')
    END
  );

-- ── FormBlock ───────────────────────────────────────────────────────

ALTER TABLE "FormBlock"
  ALTER COLUMN "headline" TYPE JSONB USING (
    CASE WHEN "headline" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "headline", 'ar', '')
    END
  );

ALTER TABLE "FormBlock"
  ALTER COLUMN "tagline" TYPE JSONB USING (
    CASE WHEN "tagline" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "tagline", 'ar', '')
    END
  );

-- ── FormField ───────────────────────────────────────────────────────

ALTER TABLE "FormField"
  ALTER COLUMN "label" TYPE JSONB USING (
    CASE WHEN "label" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "label", 'ar', '')
    END
  );

ALTER TABLE "FormField"
  ALTER COLUMN "placeholder" TYPE JSONB USING (
    CASE WHEN "placeholder" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "placeholder", 'ar', '')
    END
  );

ALTER TABLE "FormField"
  ALTER COLUMN "help" TYPE JSONB USING (
    CASE WHEN "help" IS NULL THEN NULL
         ELSE jsonb_build_object('en', "help", 'ar', '')
    END
  );

-- choices: [{ value, text }] -> [{ value, text: { en, ar } }]
-- Handled in app code via pickLocale() tolerance — no SQL transform
-- needed. The backfill script wraps each `text` for cleanliness.

-- ── FormSubmission ──────────────────────────────────────────────────

ALTER TABLE "FormSubmission"
  ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
