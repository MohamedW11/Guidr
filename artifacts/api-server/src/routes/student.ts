import { Router } from "express";
import { db } from "@workspace/db";
import { studentProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/auth";

const router = Router();

router.use(requireRole("student"));

router.get("/profile", async (req, res) => {
  if (!req.user?.studentProfile) {
    res.status(404).json({ message: "Student profile not found" });
    return;
  }
  res.json(req.user.studentProfile);
});

router.put("/profile", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, phone, school, governorate, grade, interests } = req.body;

    const [updated] = await db
      .update(studentProfilesTable)
      .set({
        firstName,
        lastName,
        phone,
        school,
        governorate,
        grade: grade ? Number(grade) : undefined,
        interests: Array.isArray(interests) ? interests : undefined,
        updatedAt: new Date(),
      })
      .where(eq(studentProfilesTable.userId, userId))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update student profile" });
  }
});

export default router;
