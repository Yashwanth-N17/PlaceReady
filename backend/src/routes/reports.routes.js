import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { prisma } from "../config/db.js";
import { success, error } from "../utils/response.js";

const router = express.Router();

// Monthly readiness by batch
router.get("/monthly-readiness", authenticate, async (req, res) => {
  try {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data = months.map(m => ({ month: m, batchA: Math.round(60 + Math.random()*25), batchB: Math.round(55 + Math.random()*25), ece: Math.round(58 + Math.random()*25) }));
    return success(res, data);
  } catch (err) { return error(res, err.message, 500); }
});

// Year over year
router.get("/yoy", authenticate, async (req, res) => {
  try {
    const data = [2021,2022,2023,2024,2025].map(yr => ({ year: String(yr), placementRate: Math.round(60+Math.random()*30), avgCtc: parseFloat((5+Math.random()*8).toFixed(1)) }));
    return success(res, data);
  } catch (err) { return error(res, err.message, 500); }
});

// Skill heatmap
router.get("/heatmap", authenticate, async (req, res) => {
  try {
    const data = ["CSE-A","CSE-B","ISE-A","ECE-A"].map(b => ({ batch: b, DSA: Math.round(55+Math.random()*35), OS: Math.round(55+Math.random()*35), DBMS: Math.round(55+Math.random()*35), Aptitude: Math.round(55+Math.random()*35), Soft: Math.round(55+Math.random()*35) }));
    return success(res, data);
  } catch (err) { return error(res, err.message, 500); }
});

// ─── NEW: Branch comparative analytics ───
router.get("/branch-comparison", authenticate, async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: { User: { select: { id: true, assessmentAttempts: { select: { score: true, focusLossCount: true }, orderBy: { createdAt: "desc" }, take: 10 } } } }
    });

    const branchMap = {};
    students.forEach(p => {
      const branch = p.branch || "Unknown";
      if (!branchMap[branch]) branchMap[branch] = { branch, students: 0, totalReadiness: 0, totalCgpa: 0, totalScore: 0, attempts: 0, focusLoss: 0 };
      const b = branchMap[branch];
      b.students++;
      b.totalReadiness += p.readinessScore || 0;
      b.totalCgpa += p.cgpa || 0;
      const userAttempts = p.User?.assessmentAttempts || [];
      userAttempts.forEach(a => { b.totalScore += a.score || 0; b.attempts++; b.focusLoss += a.focusLossCount || 0; });
    });

    const result = Object.values(branchMap).map(b => ({
      branch: b.branch,
      avgReadiness: b.students > 0 ? Math.round(b.totalReadiness / b.students) : 0,
      avgCgpa: b.students > 0 ? parseFloat((b.totalCgpa / b.students).toFixed(2)) : 0,
      avgScore: b.attempts > 0 ? Math.round(b.totalScore / b.attempts) : 0,
      avgFocusLoss: b.attempts > 0 ? parseFloat((b.focusLoss / b.attempts).toFixed(1)) : 0,
      studentCount: b.students,
    }));

    return success(res, result);
  } catch (err) { return error(res, err.message, 500); }
});

// ─── NEW: Company tier analytics ───
router.get("/company-tiers", authenticate, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { drives: { include: { students: { include: { StudentProfile: { select: { placementStatus: true, cgpa: true, readinessScore: true } } } } } } }
    });

    const tiers = {};
    companies.forEach(c => {
      const tier = c.tier || "Service";
      if (!tiers[tier]) tiers[tier] = { tier, companies: 0, drives: 0, applicants: 0, offers: 0, avgCgpa: 0, avgReadiness: 0 };
      const t = tiers[tier];
      t.companies++;
      t.drives += c.drives.length;
      c.drives.forEach(d => {
        t.applicants += d.students.length;
        d.students.forEach(s => {
          if (["OFFERED","PLACED"].includes(s.StudentProfile?.placementStatus)) t.offers++;
          t.avgCgpa += s.StudentProfile?.cgpa || 0;
          t.avgReadiness += s.StudentProfile?.readinessScore || 0;
        });
      });
    });

    const result = Object.values(tiers).map(t => ({
      ...t,
      conversionRate: t.applicants > 0 ? Math.round((t.offers / t.applicants) * 100) : 0,
      avgCgpa: t.applicants > 0 ? parseFloat((t.avgCgpa / t.applicants).toFixed(2)) : 0,
      avgReadiness: t.applicants > 0 ? Math.round(t.avgReadiness / t.applicants) : 0,
    }));

    return success(res, result);
  } catch (err) { return error(res, err.message, 500); }
});

export default router;
