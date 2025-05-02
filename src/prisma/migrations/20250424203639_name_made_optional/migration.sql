-- AlterTable
ALTER TABLE "AccountMember" ALTER COLUMN "status" SET DEFAULT 'INVITED';

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "name" DROP NOT NULL;
