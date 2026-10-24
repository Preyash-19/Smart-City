-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'OFFICER', 'CONTRACTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ROAD', 'SANITATION', 'WATER_SUPPLY', 'ELECTRICAL', 'DRAINAGE', 'TRAFFIC', 'GENERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'AI_PROCESSING', 'ROUTED', 'OFFICER_REVIEW', 'CONTRACTOR_ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'CLOSED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "department" "Department",
    "departmentRole" TEXT DEFAULT 'OFFICER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "invitationToken" TEXT,
    "invitationExpires" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "voiceUrl" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "department" "Department" NOT NULL DEFAULT 'GENERAL',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "severity" TEXT DEFAULT 'MEDIUM',
    "severityScore" INTEGER DEFAULT 50,
    "confidence" DOUBLE PRECISION DEFAULT 0.85,
    "civicRelevance" TEXT DEFAULT 'RELEVANT',
    "departmentMatch" TEXT DEFAULT 'MATCH',
    "verificationStatus" TEXT DEFAULT 'PENDING',
    "aiPredictedDept" TEXT,
    "aiPredictedIssue" TEXT,
    "aiPredictedSeverity" TEXT,
    "aiExplanation" TEXT,
    "aiExplanationHi" TEXT,
    "aiExplanationMr" TEXT,
    "severityReasons" TEXT,
    "modelVersion" TEXT DEFAULT 'v2.1-civic-vision',
    "humanVerified" BOOLEAN NOT NULL DEFAULT false,
    "humanRemarks" TEXT,
    "aiCategory" TEXT,
    "evidenceScore" INTEGER NOT NULL DEFAULT 0,
    "aiSummary" TEXT,
    "isFake" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 1,
    "masterComplaintId" TEXT,
    "citizenId" TEXT NOT NULL,
    "contractorId" TEXT,
    "assignedOfficerId" TEXT,
    "completionImage" TEXT,
    "completionRemark" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "adminId" TEXT,
    "adminName" TEXT,
    "targetId" TEXT,
    "targetEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusLog" (
    "id" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complaintId" TEXT NOT NULL,

    CONSTRAINT "StatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STATUS_UPDATE',
    "complaintId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complaintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_invitationToken_key" ON "User"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_idempotencyKey_key" ON "Complaint"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_complaintId_key" ON "Feedback"("complaintId");

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_assignedOfficerId_fkey" FOREIGN KEY ("assignedOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_masterComplaintId_fkey" FOREIGN KEY ("masterComplaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLog" ADD CONSTRAINT "StatusLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
