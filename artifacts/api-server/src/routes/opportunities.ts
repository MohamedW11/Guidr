import { Router } from "express";
import { db } from "@workspace/db";
import { opportunitiesTable, savedOpportunitiesTable, studentProfilesTable } from "@workspace/db/schema";
import { eq, and, ilike, arrayContains, sql, inArray } from "drizzle-orm";
import { attachUserMiddleware, requireRole } from "../middlewares/auth.js";

const router = Router();

router.use(attachUserMiddleware);

// Get list of active opportunities
router.get("/", async (req, res) => {
  try {
    const { search, category, type, governorate, grade } = req.query;

    let query = db.select().from(opportunitiesTable).where(eq(opportunitiesTable.status, "active"));

    const opportunities = await query;

    let studentSavedSet = new Set<string>();
    if (req.user?.role === "student" && req.user.studentProfile) {
      const savedList = await db
        .select()
        .from(savedOpportunitiesTable)
        .where(eq(savedOpportunitiesTable.studentId, req.user.studentProfile.id));
      savedList.forEach((s) => studentSavedSet.add(s.opportunityId));
    }

    let filtered = opportunities.map((opp) => ({
      ...opp,
      isSaved: studentSavedSet.has(opp.id),
    }));

    if (search && typeof search === "string") {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (opp) =>
          opp.name.toLowerCase().includes(s) ||
          opp.description.toLowerCase().includes(s) ||
          opp.organization.toLowerCase().includes(s),
      );
    }

    if (category && typeof category === "string" && category !== "All") {
      filtered = filtered.filter((opp) => opp.categories?.includes(category));
    }

    if (type && typeof type === "string" && type !== "All") {
      filtered = filtered.filter((opp) => opp.types?.includes(type));
    }

    if (governorate && typeof governorate === "string" && governorate !== "All") {
      filtered = filtered.filter(
        (opp) =>
          !opp.eligibleGovernorates ||
          opp.eligibleGovernorates.includes("All") ||
          opp.eligibleGovernorates.includes(governorate),
      );
    }

    if (grade) {
      const g = Number(grade);
      filtered = filtered.filter((opp) => {
        if (opp.gradeMin && g < opp.gradeMin) return false;
        if (opp.gradeMax && g > opp.gradeMax) return false;
        return true;
      });
    }

    res.json(filtered);
  } catch (err: any) {
    console.error("List opportunities error:", err);
    res.status(500).json({ message: err.message || "Failed to list opportunities" });
  }
});

// Get saved opportunities for current student
router.get("/saved", requireRole("student"), async (req, res) => {
  try {
    const studentProfile = req.user!.studentProfile!;

    const savedRecords = await db
      .select()
      .from(savedOpportunitiesTable)
      .where(eq(savedOpportunitiesTable.studentId, studentProfile.id));

    if (savedRecords.length === 0) {
      res.json([]);
      return;
    }

    const oppIds = savedRecords.map((s) => s.opportunityId);
    const opps = await db.select().from(opportunitiesTable).where(inArray(opportunitiesTable.id, oppIds));

    res.json(opps.map((opp) => ({ ...opp, isSaved: true })));
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to list saved opportunities" });
  }
});

// Get opportunity by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [opp] = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.id, id)).limit(1);

    if (!opp) {
      res.status(404).json({ message: "Opportunity not found" });
      return;
    }

    let isSaved = false;
    if (req.user?.role === "student" && req.user.studentProfile) {
      const [saved] = await db
        .select()
        .from(savedOpportunitiesTable)
        .where(
          and(
            eq(savedOpportunitiesTable.studentId, req.user.studentProfile.id),
            eq(savedOpportunitiesTable.opportunityId, id),
          ),
        )
        .limit(1);
      isSaved = !!saved;
    }

    res.json({ ...opp, isSaved });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch opportunity" });
  }
});

// Save opportunity
router.post("/:id/save", requireRole("student"), async (req, res) => {
  try {
    const opportunityId = String(req.params.id);
    const studentProfile = req.user!.studentProfile!;

    await db
      .insert(savedOpportunitiesTable)
      .values({
        studentId: studentProfile.id,
        opportunityId,
      })
      .onConflictDoNothing();

    res.json({ success: true, message: "Opportunity saved successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to save opportunity" });
  }
});

// Unsave opportunity
router.delete("/:id/save", requireRole("student"), async (req, res) => {
  try {
    const opportunityId = String(req.params.id);
    const studentProfile = req.user!.studentProfile!;

    await db
      .delete(savedOpportunitiesTable)
      .where(
        and(
          eq(savedOpportunitiesTable.studentId, studentProfile.id),
          eq(savedOpportunitiesTable.opportunityId, opportunityId),
        ),
      );

    res.json({ success: true, message: "Opportunity unsaved successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to unsave opportunity" });
  }
});

export default router;
