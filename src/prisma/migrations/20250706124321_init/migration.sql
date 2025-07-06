-- CreateTable
CREATE TABLE "IgCommentAutomation" (
    "id" SERIAL NOT NULL,
    "mediaId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "commentAutomationId" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IgCommentAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IgCommentAutomation_mediaId_key" ON "IgCommentAutomation"("mediaId");

-- AddForeignKey
ALTER TABLE "IgCommentAutomation" ADD CONSTRAINT "IgCommentAutomation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
