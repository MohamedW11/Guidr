import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, lessonProgressTable, lessonChunksTable } from "@workspace/db/schema";
import { eq, and, asc, ne } from "drizzle-orm";
import { attachUserMiddleware, requireRole } from "../middlewares/auth.js";

const router = Router();

router.use(attachUserMiddleware);

// List lessons for student (published + locked, hiding draft)
router.get("/", async (req, res) => {
  try {
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(ne(lessonsTable.status, "draft"))
      .orderBy(asc(lessonsTable.sortOrder));

    let completedSet = new Set<string>();
    if (req.user?.role === "student" && req.user.studentProfile) {
      const progressRecords = await db
        .select()
        .from(lessonProgressTable)
        .where(
          and(
            eq(lessonProgressTable.studentId, req.user.studentProfile.id),
            eq(lessonProgressTable.completed, true),
          ),
        );
      progressRecords.forEach((p) => completedSet.add(p.lessonId));
    }

    const mapped = lessons.map((l) => ({
      ...l,
      completed: completedSet.has(l.id),
    }));

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to list lessons" });
  }
});

// Get single lesson detail (blocks locked/draft for non-admins)
router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);

    if (!lesson) {
      res.status(404).json({ message: "Lesson not found" });
      return;
    }

    if (req.user?.role !== "admin" && lesson.status !== "published") {
      res.status(403).json({ message: "Lesson is locked or unavailable" });
      return;
    }

    let completed = false;
    if (req.user?.role === "student" && req.user.studentProfile) {
      const [prog] = await db
        .select()
        .from(lessonProgressTable)
        .where(
          and(
            eq(lessonProgressTable.studentId, req.user.studentProfile.id),
            eq(lessonProgressTable.lessonId, id),
          ),
        )
        .limit(1);
      completed = !!prog?.completed;
    }

    const chunks = await db.select().from(lessonChunksTable).where(eq(lessonChunksTable.lessonId, id));

    res.json({
      ...lesson,
      completed,
      chunksCount: chunks.length,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch lesson" });
  }
});

// Toggle lesson progress (blocks locked/draft)
router.post("/:id/progress", requireRole("student"), async (req, res) => {
  try {
    const lessonId = String(req.params.id);
    const { completed } = req.body;
    const studentProfile = req.user!.studentProfile!;

    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
    if (!lesson || lesson.status !== "published") {
      res.status(403).json({ message: "Lesson is locked or unavailable" });
      return;
    }

    const [existing] = await db
      .select()
      .from(lessonProgressTable)
      .where(
        and(
          eq(lessonProgressTable.studentId, studentProfile.id),
          eq(lessonProgressTable.lessonId, lessonId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(lessonProgressTable)
        .set({ completed: !!completed, updatedAt: new Date() })
        .where(eq(lessonProgressTable.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(lessonProgressTable)
        .values({
          studentId: studentProfile.id,
          lessonId,
          completed: !!completed,
        })
        .returning();
      res.json(created);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update progress" });
  }
});

export default router;
