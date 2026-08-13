import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import studentRouter from "./student.js";
import opportunitiesRouter from "./opportunities.js";
import lessonsRouter from "./lessons.js";
import lessonChatRouter from "./lesson-chat.js";
import adminOpportunitiesRouter from "./admin-opportunities.js";
import adminLessonsRouter from "./admin-lessons.js";
import adminSettingsRouter from "./admin-settings.js";
import interestDiscoveryRouter from "./interest-discovery.js";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/student", studentRouter);
router.use("/opportunities", opportunitiesRouter);
router.use("/lessons", lessonsRouter);
router.use("/lessons", lessonChatRouter);
router.use("/interest-discovery", interestDiscoveryRouter);
router.use("/admin/opportunities", adminOpportunitiesRouter);
router.use("/admin/lessons", adminLessonsRouter);
router.use("/admin/settings", adminSettingsRouter);

export default router;
