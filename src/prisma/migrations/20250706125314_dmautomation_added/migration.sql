-- CreateTable
CREATE TABLE "IgDmAutomation" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "dmAutomationId" INTEGER NOT NULL,

    CONSTRAINT "IgDmAutomation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IgDmAutomation" ADD CONSTRAINT "IgDmAutomation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
