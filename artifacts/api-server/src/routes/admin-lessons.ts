import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireRole } from "../middlewares/auth.js";
import { indexLessonContent } from "../lib/ai/rag.js";

const router = Router();

router.use(requireRole("admin"));

// List all lessons for admin
router.get("/", async (req, res) => {
  try {
    const lessons = await db.select().from(lessonsTable).orderBy(asc(lessonsTable.sortOrder));
    res.json(lessons);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch admin lessons" });
  }
});

// Create lesson
router.post("/", async (req, res) => {
  try {
    const { title, module, content, status, sortOrder } = req.body;

    const [created] = await db
      .insert(lessonsTable)
      .values({
        title,
        module,
        content: content || "",
        status: status || "draft",
        sortOrder: sortOrder ? Number(sortOrder) : 1,
      })
      .returning();

    // Trigger RAG indexing
    if (created.content) {
      await indexLessonContent(created.id, created.content);
    }

    res.status(201).json(created);
  } catch (err: any) {
    console.error("Create lesson error:", err);
    res.status(500).json({ message: err.message || "Failed to create lesson" });
  }
});

// Update lesson
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, module, content, status, sortOrder } = req.body;

    const [updated] = await db
      .update(lessonsTable)
      .set({
        title,
        module,
        content: content || "",
        status: status || "draft",
        sortOrder: sortOrder ? Number(sortOrder) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(lessonsTable.id, id))
      .returning();

    // Re-index RAG content
    if (updated && updated.content) {
      await indexLessonContent(updated.id, updated.content);
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update lesson" });
  }
});

// Reorder lessons
router.patch("/reorder", async (req, res) => {
  try {
    const items: Array<{ id: string; sortOrder: number }> = req.body;

    if (Array.isArray(items)) {
      for (const item of items) {
        await db
          .update(lessonsTable)
          .set({ sortOrder: Number(item.sortOrder) })
          .where(eq(lessonsTable.id, item.id));
      }
    }

    res.json({ success: true, message: "Lessons reordered successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to reorder lessons" });
  }
});

// Delete lesson
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete lesson" });
  }
});

export default router;
