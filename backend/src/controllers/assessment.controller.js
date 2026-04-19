import { prisma } from "../config/db.js";

export const createAssessment = async (req, res) => {
  const { title, description, type, subject, topic, scheduledAt, duration, questions, studentIds } = req.body;

  if (!title || !scheduledAt || !duration) {
    return res.status(400).json({ message: "Missing required assessment fields" });
  }

  try {
    const createdById = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Handle Questions first
      const questionIds = [];
      if (questions && Array.isArray(questions)) {
        for (const q of questions) {
          // Process tags
          let tagConnect = [];
          if (q.tags && Array.isArray(q.tags)) {
            for (const tagName of q.tags) {
              const tag = await tx.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });
              tagConnect.push({ id: tag.id });
            }
          }
          const savedQ = await tx.question.create({
            data: {
              text: q.text,
              answer: q.answer || "",
              options: q.options || null,
              type: q.type || "MCQ",
              subject: q.subject || subject,
              topic: q.topic || topic,
              difficulty: q.difficulty,
              uploadedBy: { connect: { id: createdById } },
              isVisible: true, // Auto-visible for practice
              tags: { connect: tagConnect }
            }
          });
          questionIds.push({ id: savedQ.id });
        }
      }

      // 2. Fetch valid students to avoid Prisma connection errors if mock IDs are sent from frontend
      // Ensure we only query for valid UUIDs to avoid Postgres type errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUuidStudentIds = (studentIds || []).filter(id => uuidRegex.test(id));

      const validStudents = await tx.user.findMany({
        where: {
          id: { in: validUuidStudentIds },
          role: "STUDENT"
        },
        select: { id: true }
      });

      // 3. Create Assessment
      const assessment = await tx.assessment.create({
        data: {
          title,
          description,
          type,
          subject,
          topic,
          scheduledAt: new Date(scheduledAt),
          duration: parseInt(duration) || 60,
          createdBy: { connect: { id: createdById } },
          questions: { connect: questionIds },
          students: {
            connect: validStudents.map(s => ({ id: s.id }))
          }
        },
        include: {
          questions: true,
          students: true
        }
      });

      return assessment;
    });

    return res.status(201).json({
      success: true,
      message: "Assessment scheduled and questions processed successfully",
      data: result
    });

  } catch (error) {
    console.error("Assessment Creation Detailed Error:", error);
    // Explicitly return the Prisma error message to help debug
    const errorMessage = error.meta?.cause || error.message || "Unknown Database Error";
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create assessment", 
      error: errorMessage,
      details: error.stack 
    });
  }
};

export const getAssessments = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === "STUDENT") {
      where.students = { some: { id: req.user.id } };
    } else if (req.user.role === "FACULTY" || req.user.role === "PLACEMENT") {
      where.createdById = req.user.id;
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        questions: {
          include: { tags: true }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { scheduledAt: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error) {
    console.error("Fetch Assessments Error:", error);
    return res.status(500).json({ message: "Failed to fetch assessments", error: error.message });
  }
};
