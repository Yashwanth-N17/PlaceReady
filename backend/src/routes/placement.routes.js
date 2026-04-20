import express from "express";
import { getDrives, createDrive, applyToDrive, getDriveApplicants, updateApplicantStatus, getTrends } from "../controllers/drive.controller.js";
import { getCompanies, createCompany } from "../controllers/company.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/companies", authenticate, getCompanies);
router.post("/companies", authenticate, authorize("PLACEMENT"), createCompany);

router.get("/drives", authenticate, getDrives);
router.post("/drives", authenticate, authorize("PLACEMENT"), createDrive);
router.post("/drives/:id/apply", authenticate, authorize("STUDENT"), applyToDrive);
router.get("/drives/:id/applicants", authenticate, authorize("PLACEMENT"), getDriveApplicants);
router.patch("/drives/:driveId/applicants/:studentId", authenticate, authorize("PLACEMENT"), updateApplicantStatus);

router.get("/trends", authenticate, authorize("PLACEMENT"), getTrends);

router.get("/shortlist", authenticate, authorize("PLACEMENT"), async (req, res) => {
  const { prisma } = await import("../config/db.js");
  const minCgpa = parseFloat(req.query.minCgpa) || 0;
  const minReadiness = parseFloat(req.query.minReadiness) || 0;
  const branch = req.query.branch || null;
  try {
    const profiles = await prisma.studentProfile.findMany({
      where: {
        cgpa: { gte: minCgpa },
        readinessScore: { gte: minReadiness },
        ...(branch ? { branch } : {})
      },
      include: { 
        User: { 
          select: { 
            id: true, name: true, email: true, usn: true, fullName: true,
            assessmentAttempts: { select: { focusLossCount: true } }
          } 
        } 
      }
    });
    
    const data = profiles.map(p => {
      const attempts = p.User.assessmentAttempts || [];
      const totalFocusLoss = attempts.reduce((sum, a) => sum + (a.focusLossCount || 0), 0);
      const disciplineScore = attempts.length > 0 
        ? Math.max(0, Math.min(100, Math.round(100 - (totalFocusLoss / attempts.length) * 8)))
        : 100;

      return {
        id: p.User.id,
        name: p.User.name || p.User.fullName || p.User.email.split("@")[0],
        email: p.User.email,
        roll: p.User.usn || "N/A",
        cgpa: p.cgpa ?? 0,
        readiness: p.readinessScore ?? 0,
        branch: p.branch ?? "—",
        placementStatus: p.placementStatus,
        disciplineScore,
      };
    });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
