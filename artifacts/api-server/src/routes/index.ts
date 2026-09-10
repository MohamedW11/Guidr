import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import organizationsRouter from "./organizations.js";
import usersRouter from "./users.js";
import importsRouter from "./imports.js";
import childrenRouter from "./children.js";
import locationsRouter from "./locations.js";
import clubsRouter from "./clubs.js";
import membershipsRouter from "./memberships.js";
import operationsRouter from "./operations.js";

const router = Router();

// Health Check
router.use("/healthz", healthRouter);

// Auth & Global Organization Tenant Routes
router.use("/auth", authRouter);
router.use("/organizations", organizationsRouter);

// Organization-scoped Tenant Sub-routes
router.use("/organizations/:orgSlug/users/import", importsRouter);
router.use("/organizations/:orgSlug/users", usersRouter);
router.use("/organizations/:orgSlug/locations", locationsRouter);
router.use("/organizations/:orgSlug/clubs", clubsRouter);
router.use("/organizations/:orgSlug/club-memberships", membershipsRouter);
router.use("/organizations/:orgSlug", membershipsRouter);
router.use("/organizations/:orgSlug", operationsRouter);
router.use("/organizations/:orgSlug", childrenRouter);

export default router;
