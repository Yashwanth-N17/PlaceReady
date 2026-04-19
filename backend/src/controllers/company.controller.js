import { prisma } from "../config/db.js";

export const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { drives: true }
    });
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompany = async (req, res) => {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
