import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { getInterestDiscoveryConfig } from "../src/load-config.js";
import { scoreInterestDiscovery, validateAnswers } from "../src/score.js";
import type { AnswerMap } from "../src/types.js";

describe("Interest Discovery Scoring Engine", () => {
  const config = getInterestDiscoveryConfig("v1");

  test("loads valid V1 configuration with 36 questions", () => {
    assert.equal(config.version, "v1");
    assert.equal(config.questions.length, 36);
    assert.equal(config.signals.length, 19);
    assert.equal(config.interests.length, 22);
  });

  test("validates complete and valid answers", () => {
    const validAnswers: AnswerMap = {};
    for (let i = 1; i <= 36; i++) {
      validAnswers[`q${i}`] = 3;
    }
    const err = validateAnswers(config, validAnswers);
    assert.equal(err, null);
  });

  test("rejects missing questions or invalid score values", () => {
    const incompleteAnswers: AnswerMap = { q1: 5, q2: 4 };
    const err1 = validateAnswers(config, incompleteAnswers);
    assert.ok(err1?.includes("Missing or invalid answer"));

    const invalidValueAnswers: AnswerMap = {};
    for (let i = 1; i <= 36; i++) {
      invalidValueAnswers[`q${i}`] = 3;
    }
    // @ts-ignore
    invalidValueAnswers["q1"] = 6;
    const err2 = validateAnswers(config, invalidValueAnswers);
    assert.ok(err2?.includes("Missing or invalid answer"));
  });

  test("scores neutral responses (all 3s) without crashing or wild skew", () => {
    const neutralAnswers: AnswerMap = {};
    for (let i = 1; i <= 36; i++) {
      neutralAnswers[`q${i}`] = 3;
    }

    const result = scoreInterestDiscovery(config, neutralAnswers);
    assert.equal(result.version, "v1");
    assert.equal(result.topInterests.length, 5);
    assert.ok(result.summaryText.length > 0);
    assert.ok(result.disclaimer.length > 0);
  });

  test("ranks STEM high when STEM questions have high scores", () => {
    const stemAnswers: AnswerMap = {};
    for (let i = 1; i <= 36; i++) {
      stemAnswers[`q${i}`] = 1;
    }
    // Q1 (Problem solving), Q3 (Math/Logic), Q4 (Building/Engineering), Q5 (Technology/CS), Q6 (Experimentation)
    stemAnswers["q1"] = 5;
    stemAnswers["q3"] = 5;
    stemAnswers["q4"] = 5;
    stemAnswers["q5"] = 5;
    stemAnswers["q6"] = 5;

    const result = scoreInterestDiscovery(config, stemAnswers);
    const topLabels = result.topInterests.map((item) => item.label);
    
    assert.ok(
      topLabels.includes("Computer Science") ||
      topLabels.includes("Engineering") ||
      topLabels.includes("Mathematics") ||
      topLabels.includes("Research"),
      `Expected STEM interests in top list, got: ${topLabels.join(", ")}`
    );
  });
});
