-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "customName" TEXT,
ALTER COLUMN "dishId" DROP NOT NULL;
