import { prisma } from "../config/db.js";

export const getDrives = async (req, res) => {
  try {
    const drives = await prisma.placementDrive.findMany({
      include: {
        company: true,
        students: { 
          include: { StudentProfile: { select: { placementStatus: true } } } 
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const userId = req.user?.id;
    const mapped = drives.map(d => ({
      ...d,
      applicantCount: d.students.length,
      offersCount: d.students.filter(s => s.StudentProfile?.placementStatus === "OFFERED").length,
      hasApplied: userId ? d.students.some(s => s.id === userId) : false,
    }));
    
    res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error("getDrives error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDrive = async (req, res) => {
  try {
    const { companyId, date, title, role, type, salary, location, description } = req.body;
    const drive = await prisma.placementDrive.create({
      data: { companyId, date: new Date(date), title: title || "Placement Drive", role, type, salary, location, description }
    });
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    console.error("createDrive error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyToDrive = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check if already applied
    const existing = await prisma.placementDrive.findFirst({
      where: { id, students: { some: { id: userId } } }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already applied to this drive" });
    }

    await prisma.placementDrive.update({
      where: { id },
      data: { students: { connect: { id: userId } } }
    });

    // Update student placement status
    await prisma.studentProfile.updateMany({
      where: { userId },
      data: { placementStatus: "APPLIED" }
    });

    res.status(200).json({ success: true, message: "Applied successfully" });
  } catch (error) {
    console.error("applyToDrive error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/placement/drives/:id/applicants
 * Returns the full list of students who applied to the drive with their profiles.
 */
export const getDriveApplicants = async (req, res) => {
  const { id } = req.params;
  try {
    const drive = await prisma.placementDrive.findUnique({
      where: { id },
      include: {
        company: true,
        students: {
          select: {
            id: true, name: true, email: true, usn: true, fullName: true,
            StudentProfile: { select: { cgpa: true, readinessScore: true, branch: true, placementStatus: true } }
          }
        }
      }
    });
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    const applicants = drive.students.map(u => ({
      id: u.id,
      name: u.name || u.fullName || u.email.split("@")[0],
      email: u.email,
      roll: u.usn || "N/A",
      cgpa: u.StudentProfile?.cgpa ?? 0,
      readiness: u.StudentProfile?.readinessScore ?? 0,
      branch: u.StudentProfile?.branch ?? "—",
      placementStatus: u.StudentProfile?.placementStatus ?? "APPLIED",
    }));

    res.json({ success: true, data: { drive, applicants } });
  } catch (error) {
    console.error("getDriveApplicants error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/placement/drives/:driveId/applicants/:studentId
 * Update the status of a single applicant (shortlisted, offered, rejected, etc.)
 */
export const updateApplicantStatus = async (req, res) => {
  const { driveId, studentId } = req.params;
  const { status } = req.body;
  const VALID = ["APPLIED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED"];
  if (!VALID.includes(status?.toUpperCase())) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    await prisma.studentProfile.updateMany({
      where: { userId: studentId },
      data: { placementStatus: status.toUpperCase() }
    });
    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("updateApplicantStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
