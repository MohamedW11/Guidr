import { Router } from "express";
import { db } from "@workspace/db";
import { opportunitiesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireRole } from "../middlewares/auth.js";

const router = Router();

router.use(requireRole("admin"));

// List all opportunities for admin
router.get("/", async (req, res) => {
  try {
    const opps = await db.select().from(opportunitiesTable).orderBy(desc(opportunitiesTable.createdAt));
    res.json(opps);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch admin opportunities" });
  }
});

// Create opportunity
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [created] = await db
      .insert(opportunitiesTable)
      .values({
        name: body.name,
        categories: body.categories || [],
        types: body.types || [],
        description: body.description,
        organization: body.organization,
        deadlineDate: body.deadlineDate || null,
        deadlineTime: body.deadlineTime || null,
        locationType: body.locationType || "online",
        locationDetails: body.locationDetails || null,
        gradeMin: body.gradeMin ? Number(body.gradeMin) : null,
        gradeMax: body.gradeMax ? Number(body.gradeMax) : null,
        eligibleGovernorates: body.eligibleGovernorates || ["All"],
        genderRequirement: body.genderRequirement || "All",
        additionalRequirements: body.additionalRequirements || null,
        timeline: body.timeline || null,
        applicationProcess: body.applicationProcess || null,
        applicationLink: body.applicationLink || null,
        status: body.status || "draft",
      })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error("Create opportunity error:", err);
    res.status(500).json({ message: err.message || "Failed to create opportunity" });
  }
});

// Update opportunity
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const [updated] = await db
      .update(opportunitiesTable)
      .set({
        name: body.name,
        categories: body.categories || [],
        types: body.types || [],
        description: body.description,
        organization: body.organization,
        deadlineDate: body.deadlineDate || null,
        deadlineTime: body.deadlineTime || null,
        locationType: body.locationType || "online",
        locationDetails: body.locationDetails || null,
        gradeMin: body.gradeMin ? Number(body.gradeMin) : null,
        gradeMax: body.gradeMax ? Number(body.gradeMax) : null,
        eligibleGovernorates: body.eligibleGovernorates || ["All"],
        genderRequirement: body.genderRequirement || "All",
        additionalRequirements: body.additionalRequirements || null,
        timeline: body.timeline || null,
        applicationProcess: body.applicationProcess || null,
        applicationLink: body.applicationLink || null,
        status: body.status || "draft",
        updatedAt: new Date(),
      })
      .where(eq(opportunitiesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update opportunity" });
  }
});

// Update status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [updated] = await db
      .update(opportunitiesTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(opportunitiesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update opportunity status" });
  }
});

// Delete (soft-delete / archive) opportunity
router.delete("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);
    const [updated] = await db
      .update(opportunitiesTable)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(opportunitiesTable.id, id))
      .returning();

    res.json({ success: true, message: "Opportunity archived successfully", opportunity: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to archive opportunity" });
  }
});

export default router;
