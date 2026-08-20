ALTER TABLE "Transaction"
ADD COLUMN "subjectPackageId" UUID,
ADD COLUMN "providerPollUrl" TEXT,
ADD COLUMN "providerReference" TEXT,
ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");
CREATE UNIQUE INDEX "Transaction_enrollmentId_type_key" ON "Transaction"("enrollmentId", "type");
CREATE INDEX "Transaction_userId_status_createdAt_idx" ON "Transaction"("userId", "status", "createdAt");
CREATE INDEX "Transaction_subjectPackageId_status_idx" ON "Transaction"("subjectPackageId", "status");
CREATE UNIQUE INDEX "Invoice_userId_reference_key" ON "Invoice"("userId", "reference");

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subjectPackageId_fkey"
FOREIGN KEY ("subjectPackageId") REFERENCES "SubjectPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
