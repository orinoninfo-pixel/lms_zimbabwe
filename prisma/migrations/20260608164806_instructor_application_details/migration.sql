-- AlterTable
ALTER TABLE "InstructorApplication" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "certifications" TEXT,
ADD COLUMN     "expertise" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredCategorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "resumeData" BYTEA,
ADD COLUMN     "resumeFileName" TEXT,
ADD COLUMN     "resumeFileSize" INTEGER,
ADD COLUMN     "resumeFileType" TEXT,
ADD COLUMN     "sampleCourseProposal" TEXT,
ADD COLUMN     "yearsExperience" INTEGER;
