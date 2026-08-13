# Guidr Interest Discovery Feature

## 1. Purpose

During onboarding:

What are you interested in?

Choose the areas you'd like to explore.

The student sees:

I know what I'm interested in

I'm not sure yet → Discover my interests

They click:

Discover my interests

Guidr Interest Discovery helps Egyptian secondary-school students discover possible areas of interest when they do not already know what they want to explore.

The feature should **not diagnose the student's personality, ability, or future career**. It should identify areas that may be worth exploring based on the activities and situations the student finds interesting.

Core principle:

> Do not ask students to know their interests before Guidr can help them discover them.

The assessment is designed to be short enough for onboarding: approximately **24 questions / 5–7 minutes**.

---

## 2. Scientific foundation

The assessment should be informed by established vocational-interest research, especially **Holland's RIASEC framework** and the **O*NET Interest Profiler**.

RIASEC describes broad vocational-interest patterns:

- Realistic — practical, hands-on, building
- Investigative — investigating, analyzing, solving problems
- Artistic — creating and expressing
- Social — helping, teaching, communicating
- Enterprising — leading, persuading, organizing
- Conventional — organizing information and structured activities

O*NET's Interest Profiler measures interest in work activities using the RIASEC framework.

Important distinction:

**The Guidr 22-category mapping is a Guidr product taxonomy, not an already validated psychological model.**

Therefore:
- Do not claim the assessment is clinically or scientifically validated.
- Describe it as research-informed until Guidr conducts pilot testing and validation.
- Do not use an LLM to decide or guess the student's interests.
- Use deterministic scoring for the assessment.
- An LLM may later explain results in natural language.

---

## 3. Target users

Primary users:

**Egyptian secondary-school students.**

The questions should therefore:
- Use simple English if the interface is English.
- Avoid university-level terminology.
- Avoid assuming students already know specific careers or academic fields.
- Use situations familiar to teenagers and school students.
- Avoid social/economic assumptions that would make an activity inaccessible.
- Focus on activities rather than prestige or career stereotypes.

The system should eventually support Arabic localization, but translations must preserve the meaning of the underlying construct.

---

## 4. User experience

### Entry point

During onboarding:

> What are you interested in?

Show the normal interest-selection experience plus:

> **I'm not sure yet — help me discover my interests**

If the student chooses discovery, launch the assessment.

### Assessment introduction

Recommended copy:

> **Let's discover what you might enjoy.**
>
> You don't need to know your interests already. We'll ask you about different activities and situations. There are no right or wrong answers.

Then start the questions.

### Answer scale

For the current V1, use the same 5-point scale:

1. Not interested at all
2. Not interested
3. Not sure
4. Interested
5. Very interested

Keep the interaction simple:
- One question per screen.
- Clear progress indicator, e.g. `Question 7 of 24`.
- Allow previous/next navigation.
- Save answers as the student progresses.
- Do not show scores during the assessment.

---

## 5. V1 question bank

Use these 24 questions.

### Q1
Solving a difficult problem that requires you to try several different approaches.

### Q2
Finding out why something happened when the answer is not immediately obvious.

### Q3
Using numbers, patterns, or logic to solve challenging problems.

### Q4
Building or designing something that solves a real-world problem.

### Q5
Learning how computers or digital systems work and finding ways to make them do useful things.

### Q6
Conducting an experiment to test whether your idea is correct.

### Q7
Investigating how the human body works and why people develop certain health problems.

### Q8
Exploring how animals, plants, or other living things work.

### Q9
Understanding how materials and substances behave and change.

### Q10
Understanding why physical things happen—for example, how electricity, motion, or forces work.

### Q11
Creating a new idea for a product, project, or business and figuring out how to make it work.

### Q12
Understanding how money, markets, businesses, or financial decisions work.

### Q13
Taking responsibility for organizing a team and making sure everyone works toward a goal.

### Q14
Presenting an idea to a group and trying to convince them that your idea is worth considering.

### Q15
Discussing a controversial issue and building arguments for or against different positions.

### Q16
Helping solve a problem that affects people in your school or community.

### Q17
Designing a poster, logo, visual identity, or other creative visual work.

### Q18
Creating videos, social-media content, or other media to communicate an idea.

### Q19
Writing stories, articles, essays, or other pieces to express your ideas.

### Q20
Learning a new language and discovering how people communicate in different cultures.

### Q21
Understanding how societies and cultures have changed throughout history.

### Q22
Investigating environmental problems and thinking about ways to protect nature or use resources more sustainably.

### Q23
Training to improve your physical performance or competing in a sport.

### Q24
Playing music, singing, acting, dancing, or performing for others.

---

## 6. Internal measurement layer

Do NOT map each question directly to one of the 22 final interests.

Instead, questions should contribute to underlying interest signals.

Initial Guidr signals:

1. Problem Solving
2. Analytical Thinking
3. Quantitative Thinking
4. Scientific Inquiry
5. Experimentation
6. Building & Making
7. Technology & Systems
8. Creativity
9. Visual Expression
10. Verbal Expression
11. Communication
12. Helping & Service
13. Leadership & Initiative
14. Persuasion & Influence
15. Organization & Planning
16. Nature & Environment
17. Physical Activity & Performance
18. Cultural & Historical Exploration
19. Artistic Performance

This layer allows multiple interests to overlap naturally.

For example:
- Computer Science can share Problem Solving with Mathematics.
- Research can share Scientific Inquiry with Biology, Chemistry, and Physics.
- Leadership can share Communication with Public Speaking.
- Business can share Leadership and Persuasion.
- Arts & Design can share Creativity with Media.

This overlap is intentional.

---

## 7. Initial question-to-signal mapping

The following is the initial product hypothesis.

### Q1
- Problem Solving
- Analytical Thinking

### Q2
- Scientific Inquiry
- Analytical Thinking

### Q3
- Quantitative Thinking
- Problem Solving
- Analytical Thinking

### Q4
- Building & Making
- Problem Solving

### Q5
- Technology & Systems
- Problem Solving

### Q6
- Scientific Inquiry
- Experimentation

### Q7
- Scientific Inquiry
- Helping & Service

### Q8
- Scientific Inquiry
- Nature & Environment

### Q9
- Scientific Inquiry
- Experimentation

### Q10
- Scientific Inquiry
- Quantitative Thinking
- Analytical Thinking

### Q11
- Creativity
- Leadership & Initiative
- Problem Solving

### Q12
- Quantitative Thinking
- Analytical Thinking
- Organization & Planning

### Q13
- Leadership & Initiative
- Organization & Planning
- Communication

### Q14
- Communication
- Persuasion & Influence
- Leadership & Initiative

### Q15
- Persuasion & Influence
- Communication
- Analytical Thinking

### Q16
- Helping & Service
- Communication
- Leadership & Initiative

### Q17
- Creativity
- Visual Expression

### Q18
- Creativity
- Communication
- Visual Expression
- Verbal Expression

### Q19
- Verbal Expression
- Creativity

### Q20
- Communication
- Cultural & Historical Exploration
- Verbal Expression

### Q21
- Cultural & Historical Exploration
- Analytical Thinking

### Q22
- Nature & Environment
- Scientific Inquiry
- Helping & Service

### Q23
- Physical Activity & Performance

### Q24
- Artistic Performance
- Creativity

These mappings are **initial hypotheses** and should be stored as configuration, not hard-coded throughout the application.

---

## 8. Guidr's 22 final interest categories

The final user-facing categories are:

1. Computer Science
2. Engineering
3. Mathematics
4. Physics
5. Chemistry
6. Biology
7. Medicine & Healthcare
8. Business & Entrepreneurship
9. Economics & Finance
10. Research
11. Leadership
12. Public Speaking & Debate
13. Law & Politics
14. Arts & Design
15. Media & Content Creation
16. Writing & Literature
17. Languages
18. Social Impact & Volunteering
19. Environment & Sustainability
20. Sports & Fitness
21. Music & Performing Arts
22. History

---

## 9. Initial interest-to-signal mapping

Use configurable weights. The following are starting product weights, NOT scientifically validated coefficients.

### Computer Science
- Problem Solving: 0.35
- Analytical Thinking: 0.25
- Technology & Systems: 0.30
- Quantitative Thinking: 0.10

### Engineering
- Problem Solving: 0.30
- Building & Making: 0.30
- Technology & Systems: 0.20
- Analytical Thinking: 0.20

### Mathematics
- Quantitative Thinking: 0.50
- Analytical Thinking: 0.30
- Problem Solving: 0.20

### Physics
- Scientific Inquiry: 0.35
- Quantitative Thinking: 0.30
- Problem Solving: 0.20
- Experimentation: 0.15

### Chemistry
- Scientific Inquiry: 0.40
- Experimentation: 0.35
- Analytical Thinking: 0.15
- Quantitative Thinking: 0.10

### Biology
- Scientific Inquiry: 0.40
- Nature & Environment: 0.35
- Experimentation: 0.15
- Analytical Thinking: 0.10

### Medicine & Healthcare
- Helping & Service: 0.35
- Scientific Inquiry: 0.30
- Analytical Thinking: 0.20
- Experimentation: 0.15

### Business & Entrepreneurship
- Leadership & Initiative: 0.35
- Persuasion & Influence: 0.25
- Creativity: 0.20
- Organization & Planning: 0.20

### Economics & Finance
- Quantitative Thinking: 0.40
- Analytical Thinking: 0.35
- Organization & Planning: 0.15
- Leadership & Initiative: 0.10

### Research
- Scientific Inquiry: 0.40
- Analytical Thinking: 0.30
- Experimentation: 0.20
- Problem Solving: 0.10

### Leadership
- Leadership & Initiative: 0.45
- Organization & Planning: 0.25
- Communication: 0.20
- Persuasion & Influence: 0.10

### Public Speaking & Debate
- Communication: 0.40
- Persuasion & Influence: 0.35
- Verbal Expression: 0.15
- Leadership & Initiative: 0.10

### Law & Politics
- Persuasion & Influence: 0.35
- Communication: 0.25
- Analytical Thinking: 0.20
- Leadership & Initiative: 0.10
- Cultural & Historical Exploration: 0.10

### Arts & Design
- Creativity: 0.45
- Visual Expression: 0.45
- Building & Making: 0.10

### Media & Content Creation
- Creativity: 0.30
- Communication: 0.30
- Visual Expression: 0.20
- Verbal Expression: 0.20

### Writing & Literature
- Verbal Expression: 0.50
- Creativity: 0.35
- Cultural & Historical Exploration: 0.15

### Languages
- Communication: 0.40
- Verbal Expression: 0.30
- Cultural & Historical Exploration: 0.30

### Social Impact & Volunteering
- Helping & Service: 0.50
- Communication: 0.20
- Leadership & Initiative: 0.15
- Nature & Environment: 0.15

### Environment & Sustainability
- Nature & Environment: 0.50
- Scientific Inquiry: 0.25
- Analytical Thinking: 0.15
- Helping & Service: 0.10

### Sports & Fitness
- Physical Activity & Performance: 0.85
- Leadership & Initiative: 0.10
- Problem Solving: 0.05

### Music & Performing Arts
- Artistic Performance: 0.55
- Creativity: 0.35
- Communication: 0.10

### History
- Cultural & Historical Exploration: 0.60
- Analytical Thinking: 0.25
- Verbal Expression: 0.15

---

## 10. Scoring

For each question:

- Not interested at all = 1
- Not interested = 2
- Not sure = 3
- Interested = 4
- Very interested = 5

Each selected answer contributes its score to the signals attached to that question.

For V1, use the simplest implementation:

```text
signal_score =
    average of the student's answers
    for questions assigned to that signal
```

Normalize the signal score to 0–100 if needed for the UI.

Then calculate each Guidr interest using its configured signal weights:

```text
interest_score =
    Σ(signal_score × signal_weight)
```

Normalize to 0–100.

Important:
- Do not use an LLM for scoring.
- Keep scoring deterministic.
- Store the configuration in the database or a versioned configuration file.
- Include an `assessment_version`, e.g. `v1`.

---

## 11. Results

Do not show all 22 categories as a ranking.

Show approximately the top 3–5.

Example:

> ## We discovered some areas you may enjoy
>
> **Computer Science**
>
> **Research**
>
> **Engineering**
>
> **Mathematics**
>
> You seem to enjoy solving problems, understanding how things work, and experimenting with ideas.

Then explain:

> These are suggestions based on your answers, not fixed labels. Your interests can change as you discover new things.

---

and give the option for go back and choose your interests

if the student choose the interests and dont need enter the assessment, before submit and creating the account raise message that it is better to try this assessment and if he/she said no so skip it

for the ui ux use the same theme of the onboarding 


Interest Discovery — Implementation Plan
This plan maps the spec in Guidr interest discovery feature.md onto the existing Guidr MVP stack (React/Vite frontend, Express API, Drizzle/Postgres, OpenAPI codegen).

Current state
What exists	What's missing
22 interest categories in STUDENT_INTERESTS (governorates.ts)
Assessment questions, signals, weights
student_profiles.interests (text array)
Scoring engine
Signup step 3 — manual multi-select (Signup.tsx)
Discovery flow UI
Profile interest editing
Assessment persistence / retake
OpenAPI + codegen pipeline
Interest-based recommendations (cosmetic today)
The spec’s 22 categories already match the codebase exactly. V1 can write discovered interests into the existing interests[] column with no profile schema change.

Architecture overview
Manual select
Discover interests
Accept
Choose manually
Signup Step 3
Path?
Nudge modal optional
Intro screen
24 questions - client state
POST /interest-discovery/score
Top 3-5 interests
Results screen
Accept or go back?
Pre-fill interests → signup
POST /auth/signup
Core principles from the spec:

Deterministic server-side scoring (no LLM for scores)
Mappings stored as versioned config, not scattered in code
Pre-auth flow during signup (answers live in client state until account creation)
Same onboarding theme (auth guidr, progress bar, g-btn, g-label)
Phase 1 — Config & scoring engine
1.1 Versioned assessment config
Create a single versioned JSON file (simplest for V1; move to DB later if admin editing is needed):

lib/interest-discovery/
  v1.json          # questions, question→signal map, interest→signal weights
  types.ts         # TypeScript types
  score.ts         # Pure scoring function (unit-testable)
  index.ts         # export getConfig(version), scoreAssessment(answers, version)
Structure of v1.json:

{
  "version": "v1",
  "scale": { "min": 1, "max": 5, "labels": ["Not interested at all", "..."] },
  "questions": [{ "id": "q1", "text": "...", "signals": ["problem_solving", "analytical_thinking"] }],
  "signals": [{ "id": "problem_solving", "label": "Problem Solving" }],
  "interests": [{ "id": "computer_science", "label": "Computer Science", "weights": { "problem_solving": 0.35, ... } }],
  "results": { "topN": 5, "minTopN": 3 }
}
Use stable snake_case IDs internally; map labels to existing STUDENT_INTERESTS strings on output.

1.2 Scoring algorithm (deterministic)
Implement exactly as specified:

For each signal: signal_score = average(answer values for questions mapped to that signal)
Normalize each signal to 0–100: (avg - 1) / 4 * 100
For each interest: interest_score = Σ(signal_score × weight)
Normalize interest scores to 0–100 (max possible = 100 if weights sum to 1)
Return top 3–5 interests (sort desc, break ties alphabetically)
Also return top 2–3 signals for the results summary line (template-based, no LLM in V1):

"You seem to enjoy solving problems, understanding how things work, and experimenting with ideas."

Map signals → plain-language phrases in config.

1.3 Tests
Add unit tests for score.ts:

All 3s → middling scores, no wild outliers
High STEM answers → CS/Engineering/Math rank high
Edge cases: unanswered questions (should not happen if UI validates), tie-breaking
Phase 2 — Backend API
2.1 New endpoints (OpenAPI-first)
Add to lib/api-spec/openapi.yaml:

Method	Path	Auth	Purpose
GET
/interest-discovery/config
None
Return question bank + scale labels for ?version=v1
POST
/interest-discovery/score
None
Accept 24 answers, return ranked interests + summary signals
Why no auth on V1 score endpoint: Assessment runs before account creation during signup. The endpoint is stateless and idempotent — it only transforms answers into scores.

Request body for score:

{
  version: "v1",
  answers: { q1: 4, q2: 5, ... q24: 3 }  // values 1–5
}
Response:

{
  version: "v1",
  topInterests: [
    { label: "Computer Science", score: 87 },
    { label: "Research", score: 82 },
    ...
  ],
  summarySignals: ["Problem Solving", "Scientific Inquiry", "Analytical Thinking"],
  disclaimer: "These are suggestions based on your answers, not fixed labels..."
}
2.2 Route implementation
artifacts/api-server/src/routes/interest-discovery.ts
artifacts/api-server/src/lib/interest-discovery/score.ts  # re-export from lib/
Register in routes/index.ts. Validate with Zod (24 answers, values 1–5, known question IDs).

2.3 Optional persistence (V1.1 — recommend deferring)
For V1, only persist final interests via existing signup/profile APIs.

Later, if you want retake history and analytics:

interest_discovery_sessions (id, user_id, version, completed_at, top_interests jsonb)
interest_discovery_answers (session_id, question_id, value)
Not required for launch.

Phase 3 — Frontend: Signup integration
Extend Signup.tsx step 3 rather than building a separate route (keeps onboarding cohesive).

3.1 Step 3 sub-states
Replace the flat interest grid with a small state machine:

step3Mode: "choose" | "discovery_intro" | "discovery_questions" | "discovery_results"
choose (default):

Heading: "What are you interested in?"
Subcopy: "Choose the areas you'd like to explore."
Two paths:
Primary grid: manual multi-select (existing UI)
Secondary link/button: "I'm not sure yet — help me discover my interests"
discovery_intro:

Spec copy: "Let's discover what you might enjoy..."
"Start" button → discovery_questions
discovery_questions:

One question per screen
5-point Likert scale (radio or button group)
Progress: "Question 7 of 24"
Back / Next navigation
Auto-save to component state (and optionally sessionStorage key guidr-discovery-draft for refresh resilience)
On Q24 complete → call POST /interest-discovery/score
discovery_results:

Show top 3–5 interests (not all 22)
Summary line from summarySignals
Disclaimer copy from spec
Actions:
"Use these interests" → pre-fill selectedInterests, return to choose with selections highlighted, or go straight to signup
"Go back and choose manually" → return to choose grid
3.2 New components (keep Signup.tsx readable)
artifacts/mockup-sandbox/src/components/mockups/guidr/interest-discovery/
  DiscoveryIntro.tsx
  DiscoveryQuestion.tsx
  DiscoveryResults.tsx
  LikertScale.tsx
  useDiscoveryAssessment.ts   # fetch config, manage answers, call score API
Reuse existing styles from Signup.tsx and _group.css:

Same progress bar pattern (question N of 24 instead of step N of 3)
Same g-btn red, g-label, dark auth layout
Same max-width container
3.3 Manual-select nudge (spec requirement)
When the student selects interests manually and clicks Complete Setup without having taken the assessment:

Show a modal:
"Guidr can help you discover areas you might enjoy. It only takes about 5 minutes. Would you like to try it?"

Try assessment → switch to discovery_intro
Skip for now → proceed with handleFinalSignup
Track hasSeenDiscoveryPrompt in component state so the modal only shows once per session.

Phase 4 — Signup payload & profile
No schema change needed for V1.

Discovery path: pass top 3–5 (or user-edited subset) as interests[] in existing POST /auth/signup
Optionally add interestSource: "discovery" | "manual" to signup body later for analytics — not required for V1
Profile page (Profile.tsx): V1.1 addition — add "Retake interest discovery" that runs the same flow post-login and updates via PUT /api/student/profile.

Phase 5 — What to explicitly NOT build in V1
Per spec and MVP scope:

Skip for V1	Reason
LLM-generated result explanations
Spec allows later; use templates now
Claiming scientific validation
Copy must say "research-informed"
Showing all 22 ranked categories
Spec says top 3–5 only
Arabic localization
Future; structure config for i18n keys
Admin UI for editing weights
Config file is enough for pilot
Interest-based opportunity matching
Separate feature; interests storage is the handoff
Suggested implementation order
#	Task	Effort	Depends on
1
Create lib/interest-discovery/v1.json from spec
S
—
2
Implement score.ts + unit tests
M
1
3
OpenAPI endpoints + API route
S
2
4
useDiscoveryAssessment hook + LikertScale
M
3
5
Discovery sub-flow components
M
4
6
Integrate into Signup.tsx step 3
M
5
7
Skip-assessment nudge modal
S
6
8
Manual QA through full signup
S
7
M ≈ half day, S ≈ 1–2 hours for a focused implementation.

Data flow (signup with discovery)
1. User completes steps 1–2 (account info + grade)
2. Step 3 → clicks "Discover my interests"
3. GET /interest-discovery/config?version=v1  → 24 questions
4. User answers Q1–Q24 (saved in React state + sessionStorage)
5. POST /interest-discovery/score  → { topInterests: [...], summarySignals: [...] }
6. User reviews results → "Use these interests"
7. POST /auth/signup { ..., interests: ["Computer Science", "Research", ...] }
8. Redirect to Dashboard
UX copy checklist (from spec)
Include verbatim or close paraphrase:

Intro: "You don't need to know your interests already..."
Scale labels: 1–5 as specified
Results header: "We discovered some areas you may enjoy"
Footer disclaimer: "These are suggestions... not fixed labels"
Nudge: encourage assessment before manual skip
Risks & decisions
Decision	Recommendation
Pre-auth scoring endpoint
Acceptable for V1 — no PII in request; rate-limit if abused
Client vs server scoring
Server only — keeps config authoritative and testable
How many interests to save
Top 5 from assessment; user can deselect before signup
Progress if user refreshes mid-assessment
sessionStorage draft keyed by email or random session ID
Interest names must match exactly
Scoring output maps to STUDENT_INTERESTS strings
Future extensions (post-V1)
Profile retake with session persistence in DB
Arabic — separate v1.ar.json with same signal IDs
LLM explanation — optional narrative layer on top of deterministic scores
Dashboard personalization — filter opportunities by interests[] / opportunity types[]
Pilot validation — export anonymized answer data to refine weights
Summary
The feature is mostly greenfield, but it plugs cleanly into existing pieces: STUDENT_INTERESTS, signup step 3, and student_profiles.interests. The highest-value first slice is:

Versioned config + deterministic scorer in lib/interest-discovery/
Two stateless API endpoints
A sub-flow inside Signup.tsx with intro → 24 questions → results
A nudge modal for students who skip discovery
That delivers the full V1 spec without database migrations, and leaves a clear path to retakes, analytics, and personalization later.

