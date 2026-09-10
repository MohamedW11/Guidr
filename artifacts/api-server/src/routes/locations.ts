import { Router } from "express";
import { db, eq } from "@workspace/db";
import { locationsTable } from "@workspace/db/schema";
import { requireAuth, requireOrganizationRole } from "../middlewares/auth.js";

const locationsRouter = Router({ mergeParams: true });

locationsRouter.use(requireAuth);

/**
 * GET /api/organizations/:orgSlug/locations
 * Lists all locations in the school organization
 */
locationsRouter.get("/", async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;

    const locations = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.organizationId, orgId));

    res.json(locations);
  } catch (err: any) {
    console.error("List locations error:", err);
    res.status(500).json({ message: "Failed to load locations." });
  }
});

/**
 * POST /api/organizations/:orgSlug/locations
 * Creates a new location (Lab, Field, Auditorium)
 */
locationsRouter.post("/", requireOrganizationRole("ADMIN"), async (req, res) => {
  try {
    const orgId = req.orgContext!.organizationId;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Location name is required." });
      return;
    }

    const [location] = await db
      .insert(locationsTable)
      .values({
        organizationId: orgId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    res.status(201).json(location);
  } catch (err: any) {
    console.error("Create location error:", err);
    res.status(500).json({ message: "Failed to create location." });
  }
});

export default locationsRouter;
