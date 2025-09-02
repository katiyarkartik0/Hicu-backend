-- CreateTable
CREATE TABLE "public"."IgDm" (
    "accountId" INTEGER NOT NULL,
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "IgDm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."IgDm" ADD CONSTRAINT "IgDm_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
