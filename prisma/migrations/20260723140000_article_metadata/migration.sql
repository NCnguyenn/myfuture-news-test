-- AlterTable: add article metadata fields (nullable / safe defaults)
ALTER TABLE "Article" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Article" ADD COLUMN "originalImageUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageSourcePageUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageIsPlaceholder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Article" ADD COLUMN "authorName" TEXT;
ALTER TABLE "Article" ADD COLUMN "authorSlug" TEXT;
ALTER TABLE "Article" ADD COLUMN "authorType" TEXT;
ALTER TABLE "Article" ADD COLUMN "authorVerificationNote" TEXT;
ALTER TABLE "Article" ADD COLUMN "dateModified" TIMESTAMP(3);
ALTER TABLE "Article" ADD COLUMN "tags" JSONB;
ALTER TABLE "Article" ADD COLUMN "evidence" JSONB;
ALTER TABLE "Article" ADD COLUMN "verification" JSONB;
