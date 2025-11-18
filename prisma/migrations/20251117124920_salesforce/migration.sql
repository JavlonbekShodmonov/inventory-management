-- CreateTable
CREATE TABLE "SalesforceIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "instanceUrl" TEXT NOT NULL,
    "salesforceAccountId" TEXT,
    "salesforceContactId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesforceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesforceIntegration_userId_key" ON "SalesforceIntegration"("userId");

-- CreateIndex
CREATE INDEX "SalesforceIntegration_userId_idx" ON "SalesforceIntegration"("userId");

-- AddForeignKey
ALTER TABLE "SalesforceIntegration" ADD CONSTRAINT "SalesforceIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
