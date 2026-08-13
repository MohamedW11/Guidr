import { Router, type Request, type Response } from "express";
import {
  getInterestDiscoveryConfig,
  scoreInterestDiscovery,
  toPublicConfig,
  validateAnswers,
} from "@workspace/interest-discovery";

const router = Router();

/**
 * GET /interest-discovery/config?version=v1
 * Returns public question bank and Likert scale for frontend consumption.
 */
router.get("/config", (req: Request, res: Response) => {
  const version = typeof req.query.version === "string" ? req.query.version : "v1";

  try {
    const config = getInterestDiscoveryConfig(version);
    const publicConfig = toPublicConfig(config);
    res.json(publicConfig);
  } catch (err: any) {
    res.status(404).json({ message: err.message || "Unknown assessment version" });
  }
});

/**
 * POST /interest-discovery/score
 * Pre-auth endpoint to score answers deterministically and return top 3-5 interests.
 */
router.post("/score", (req: Request, res: Response) => {
  const { version = "v1", answers } = req.body || {};

  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    res.status(400).json({ message: "Invalid request body: 'answers' must be a JSON object" });
    return;
  }

  try {
    const config = getInterestDiscoveryConfig(version);
    const validationError = validateAnswers(config, answers);
    
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const result = scoreInterestDiscovery(config, answers);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to score assessment" });
  }
});

export default router;
