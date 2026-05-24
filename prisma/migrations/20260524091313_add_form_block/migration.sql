-- CreateTable
CREATE TABLE "FormBlock" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "headline" TEXT,
    "tagline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormBlock_formId_idx" ON "FormBlock"("formId");

-- AddForeignKey
ALTER TABLE "FormBlock" ADD CONSTRAINT "FormBlock_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
