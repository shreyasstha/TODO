-- AlterTable
ALTER TABLE "Task" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- Backfill positions per user (newest first = position 0)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) - 1 AS pos
  FROM "Task"
)
UPDATE "Task" AS t
SET "position" = r.pos
FROM ranked AS r
WHERE t.id = r.id;

-- CreateIndex
CREATE INDEX "Task_userId_position_idx" ON "Task"("userId", "position");
