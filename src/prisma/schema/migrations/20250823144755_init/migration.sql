-- CreateEnum
CREATE TYPE "public"."MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'REMOVED');

-- CreateTable
CREATE TABLE "public"."AccountMember" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "status" "public"."MemberStatus" NOT NULL DEFAULT 'INVITED',
    "scope" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "svgIcon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "igUserId" TEXT,
    "igUsername" TEXT,
    "igFollowers" INTEGER,
    "igFollowing" INTEGER,
    "igPostCount" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Configurations" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "config" JSONB NOT NULL,

    CONSTRAINT "Configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IgComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isReply" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "mediaOwnerId" TEXT NOT NULL,
    "parentCommentId" TEXT,

    CONSTRAINT "IgComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IgCommentAutomation" (
    "id" SERIAL NOT NULL,
    "mediaId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "commentAutomationId" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IgCommentAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IgDmAutomation" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "dmAutomationId" INTEGER NOT NULL,

    CONSTRAINT "IgDmAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IgMedia" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "IgMedia_pkey" PRIMARY KEY ("id","ownerId")
);

-- CreateTable
CREATE TABLE "public"."Integration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "config" JSONB NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Leads" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "requirements" TEXT[],
    "maxGenerationAttemptsPerProspect" INTEGER NOT NULL,
    "minGapBetweenPerGenerationAttempt" INTEGER NOT NULL,

    CONSTRAINT "Leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prospect" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "accountId" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "lastLeadsGenerationAttempt" INTEGER NOT NULL,
    "totalLeadsGenerationAttempts" INTEGER NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountMember_accountId_memberId_key" ON "public"."AccountMember"("accountId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUserId_key" ON "public"."Account"("igUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUsername_key" ON "public"."Account"("igUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Configurations_accountId_integrationId_key" ON "public"."Configurations"("accountId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "IgCommentAutomation_mediaId_key" ON "public"."IgCommentAutomation"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "IgDmAutomation_accountId_key" ON "public"."IgDmAutomation"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_name_key" ON "public"."Integration"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Leads_accountId_key" ON "public"."Leads"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "public"."Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_accountId_userId_key" ON "public"."Prospect"("accountId", "userId");

-- AddForeignKey
ALTER TABLE "public"."AccountMember" ADD CONSTRAINT "AccountMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccountMember" ADD CONSTRAINT "AccountMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Configurations" ADD CONSTRAINT "Configurations_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Configurations" ADD CONSTRAINT "Configurations_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_mediaId_mediaOwnerId_fkey" FOREIGN KEY ("mediaId", "mediaOwnerId") REFERENCES "public"."IgMedia"("id", "ownerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgComment" ADD CONSTRAINT "IgComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."IgComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgCommentAutomation" ADD CONSTRAINT "IgCommentAutomation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgDmAutomation" ADD CONSTRAINT "IgDmAutomation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IgMedia" ADD CONSTRAINT "IgMedia_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Account"("igUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Leads" ADD CONSTRAINT "Leads_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prospect" ADD CONSTRAINT "Prospect_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
