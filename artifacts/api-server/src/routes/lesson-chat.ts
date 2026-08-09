import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, chatMessagesTable } from "@workspace/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireRole } from "../middlewares/auth.js";
import { generateTutorResponse } from "../lib/ai/rag.js";

const router = Router();

router.use(requireRole("student"));

// Send chat message to AI Tutor
router.post("/:id/chat", async (req, res) => {
  try {
    const lessonId = String(req.params.id);
    const { message } = req.body;
    const studentProfile = req.user!.studentProfile!;

    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
    if (!lesson || lesson.status !== "published") {
      res.status(403).json({ message: "Lesson is locked or unavailable for chat" });
      return;
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ message: "Message text is required" });
      return;
    }

    const tutorResponse = await generateTutorResponse(studentProfile.id, lessonId, message.trim());
    res.json(tutorResponse);
  } catch (err: any) {
    console.error("Tutor chat error:", err);
    res.status(500).json({ message: err.message || "Failed to process AI chat message" });
  }
});

// Get chat message history
router.get("/:id/chat/history", async (req, res) => {
  try {
    const lessonId = String(req.params.id);
    const studentProfile = req.user!.studentProfile!;

    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
    if (!lesson || lesson.status !== "published") {
      res.status(403).json({ message: "Lesson is locked or unavailable for history" });
      return;
    }

    const history = await db
      .select()
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.studentId, studentProfile.id),
          eq(chatMessagesTable.lessonId, lessonId),
        ),
      )
      .orderBy(asc(chatMessagesTable.createdAt));

    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch chat history" });
  }
});

export default router;
