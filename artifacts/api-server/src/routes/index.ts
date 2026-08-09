import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentRouter from "./student";
import opportunitiesRouter from "./opportunities";
import lessonsRouter from "./lessons";
import lessonChatRouter from "./lesson-chat";
import adminOpportunitiesRouter from "./admin-opportunities";
import adminLessonsRouter from "./admin-lessons";
import adminSettingsRouter from "./admin-settings";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/student", studentRouter);
router.use("/opportunities", opportunitiesRouter);
router.use("/lessons", lessonsRouter);
router.use("/lessons", lessonChatRouter);
router.use("/admin/opportunities", adminOpportunitiesRouter);
router.use("/admin/lessons", adminLessonsRouter);
router.use("/admin/settings", adminSettingsRouter);

export default router;
