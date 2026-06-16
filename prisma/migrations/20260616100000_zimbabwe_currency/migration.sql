ALTER TYPE "CurrencyCode" ADD VALUE 'USD';
ALTER TYPE "CurrencyCode" ADD VALUE 'ZWL';

ALTER TABLE "Transaction" ALTER COLUMN "currency" SET DEFAULT 'USD';
ALTER TABLE "Invoice" ALTER COLUMN "currency" SET DEFAULT 'USD';
ALTER TABLE "SubjectPackage" ALTER COLUMN "currency" SET DEFAULT 'USD';
ALTER TABLE "SubjectEnrollment" ALTER COLUMN "currency" SET DEFAULT 'USD';

UPDATE "Transaction" SET "currency" = 'USD' WHERE "currency" = 'ZAR';
UPDATE "Invoice" SET "currency" = 'USD' WHERE "currency" = 'ZAR';
UPDATE "SubjectPackage" SET "currency" = 'USD' WHERE "currency" = 'ZAR';
UPDATE "SubjectEnrollment" SET "currency" = 'USD' WHERE "currency" = 'ZAR';
