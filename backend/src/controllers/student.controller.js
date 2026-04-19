import { prisma } from "../config/db.js";

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { studentProfile: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    // In a real app, these would be calculated from assessments
    res.json({
      success: true,
      data: {
        readiness: student?.readinessScore || 0,
        skillsOverTime: [],
        skillRadar: [],
        weakAreas: [],
        readinessTrend: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTraining = async (req, res) => {
  res.json({ success: true, data: [] });
};
