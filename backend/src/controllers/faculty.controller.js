import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { prisma } from "../config/db.js";

export const extractTestMetadata = async (req, res) => {
  // ... existing code ...
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Returns ALL students in the DB, merging in their StudentProfile data where available.
 * Students without a profile get sensible defaults.
 */
export const getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { StudentProfile: true },
      orderBy: { createdAt: "asc" },
    });

    const mapped = students.map((u) => {
      const profile = u.StudentProfile;
      const displayName = u.name || u.fullName || u.email.split("@")[0].replace(/[._]/g, " ");
      
      return {
        id: u.id,
        name: displayName,
        roll: u.usn || "N/A",
        email: u.email,
        readiness: profile?.readinessScore ?? 0,
        cgpa: profile?.cgpa ?? 0,
        branch: profile?.branch ?? "—",
        semester: profile?.semester ?? "—",
        batch: "2025", 
        weak: "Aptitude", 
        active: "Active",
        hasProfile: !!profile,
      };
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error("getStudents error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    let u = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { StudentProfile: true },
    });

    if (!u) {
      const profile = await prisma.studentProfile.findUnique({
        where: { id: req.params.id },
        include: { User: true },
      });
      if (!profile) return res.status(404).json({ message: "Student not found" });
      u = { ...profile.User, StudentProfile: profile };
    }

    const displayName = u.name || u.fullName || u.email.split("@")[0].replace(/[._]/g, " ");
    const profile = u.StudentProfile;

    res.json({
      success: true,
      data: {
        id: u.id,
        name: displayName,
        email: u.email,
        roll: u.usn || u.id.slice(0, 8).toUpperCase(),
        branch: profile?.branch ?? "—",
        semester: profile?.semester ?? "—",
        cgpa: profile?.cgpa ?? 0,
        readiness: profile?.readinessScore ?? 0,
        weak: "—",
        hasProfile: !!profile,
      },
    });
  } catch (error) {
    console.error("getStudentById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashStats = async (req, res) => {
  res.json({ success: true, data: [] });
};
