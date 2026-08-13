import type { InterestDiscoveryConfig } from "../types.js";

export const v1Config = {
  version: "v1",
  scale: {
    min: 1,
    max: 5,
    labels: [
      "Not interested at all",
      "Not interested",
      "Not sure",
      "Interested",
      "Very interested",
    ],
  },
  questions: [
    {
      id: "q1",
      text: "Solving a difficult problem that requires you to try several different approaches.",
      signals: ["problem_solving", "analytical_thinking"],
    },
    {
      id: "q2",
      text: "Finding out why something happened when the answer is not immediately obvious.",
      signals: ["scientific_inquiry", "analytical_thinking"],
    },
    {
      id: "q3",
      text: "Using numbers, patterns, or logic to solve challenging problems.",
      signals: ["quantitative_thinking", "problem_solving", "analytical_thinking"],
    },
    {
      id: "q4",
      text: "Building or designing something that solves a real-world problem.",
      signals: ["building_making", "problem_solving"],
    },
    {
      id: "q5",
      text: "Learning how computers or digital systems work and finding ways to make them do useful things.",
      signals: ["technology_systems", "problem_solving"],
    },
    {
      id: "q6",
      text: "Conducting an experiment to test whether your idea is correct.",
      signals: ["scientific_inquiry", "experimentation"],
    },
    {
      id: "q7",
      text: "Investigating how the human body works and why people develop certain health problems.",
      signals: ["scientific_inquiry", "helping_service"],
    },
    {
      id: "q8",
      text: "Exploring how animals, plants, or other living things work.",
      signals: ["scientific_inquiry", "nature_environment"],
    },
    {
      id: "q9",
      text: "Understanding how materials and substances behave and change.",
      signals: ["scientific_inquiry", "experimentation"],
    },
    {
      id: "q10",
      text: "Understanding why physical things happen—for example, how electricity, motion, or forces work.",
      signals: ["scientific_inquiry", "quantitative_thinking", "analytical_thinking"],
    },
    {
      id: "q11",
      text: "Creating a new idea for a product, project, or business and figuring out how to make it work.",
      signals: ["creativity", "leadership_initiative", "problem_solving"],
    },
    {
      id: "q12",
      text: "Understanding how money, markets, businesses, or financial decisions work.",
      signals: ["quantitative_thinking", "analytical_thinking", "organization_planning"],
    },
    {
      id: "q13",
      text: "Taking responsibility for organizing a team and making sure everyone works toward a goal.",
      signals: ["leadership_initiative", "organization_planning", "communication"],
    },
    {
      id: "q14",
      text: "Presenting an idea to a group and trying to convince them that your idea is worth considering.",
      signals: ["communication", "persuasion_influence", "leadership_initiative"],
    },
    {
      id: "q15",
      text: "Discussing a controversial issue and building arguments for or against different positions.",
      signals: ["persuasion_influence", "communication", "analytical_thinking"],
    },
    {
      id: "q16",
      text: "Helping solve a problem that affects people in your school or community.",
      signals: ["helping_service", "communication", "leadership_initiative"],
    },
    {
      id: "q17",
      text: "Designing a poster, logo, visual identity, or other creative visual work.",
      signals: ["creativity", "visual_expression"],
    },
    {
      id: "q18",
      text: "Creating videos, social-media content, or other media to communicate an idea.",
      signals: ["creativity", "communication", "visual_expression", "verbal_expression"],
    },
    {
      id: "q19",
      text: "Writing stories, articles, essays, or other pieces to express your ideas.",
      signals: ["verbal_expression", "creativity"],
    },
    {
      id: "q20",
      text: "Learning a new language and discovering how people communicate in different cultures.",
      signals: ["communication", "cultural_historical_exploration", "verbal_expression"],
    },
    {
      id: "q21",
      text: "Understanding how societies and cultures have changed throughout history.",
      signals: ["cultural_historical_exploration", "analytical_thinking"],
    },
    {
      id: "q22",
      text: "Investigating environmental problems and thinking about ways to protect nature or use resources more sustainably.",
      signals: ["nature_environment", "scientific_inquiry", "helping_service"],
    },
    {
      id: "q23",
      text: "Training to improve your physical performance or competing in a sport.",
      signals: ["physical_activity_performance"],
    },
    {
      id: "q24",
      text: "Playing music, singing, acting, dancing, or performing for others.",
      signals: ["artistic_performance", "creativity"],
    },
  ],
  signals: [
    { id: "problem_solving", label: "Problem Solving", summaryPhrase: "solving problems" },
    { id: "analytical_thinking", label: "Analytical Thinking", summaryPhrase: "understanding how things work" },
    { id: "quantitative_thinking", label: "Quantitative Thinking", summaryPhrase: "working with numbers and patterns" },
    { id: "scientific_inquiry", label: "Scientific Inquiry", summaryPhrase: "investigating and exploring" },
    { id: "experimentation", label: "Experimentation", summaryPhrase: "experimenting with ideas" },
    { id: "building_making", label: "Building & Making", summaryPhrase: "building and designing things" },
    { id: "technology_systems", label: "Technology & Systems", summaryPhrase: "working with technology" },
    { id: "creativity", label: "Creativity", summaryPhrase: "creating new ideas" },
    { id: "visual_expression", label: "Visual Expression", summaryPhrase: "expressing ideas visually" },
    { id: "verbal_expression", label: "Verbal Expression", summaryPhrase: "expressing ideas in writing" },
    { id: "communication", label: "Communication", summaryPhrase: "communicating with others" },
    { id: "helping_service", label: "Helping & Service", summaryPhrase: "helping people in your community" },
    { id: "leadership_initiative", label: "Leadership & Initiative", summaryPhrase: "leading and organizing" },
    { id: "persuasion_influence", label: "Persuasion & Influence", summaryPhrase: "persuading and debating" },
    { id: "organization_planning", label: "Organization & Planning", summaryPhrase: "planning and organizing" },
    { id: "nature_environment", label: "Nature & Environment", summaryPhrase: "caring about nature and the environment" },
    { id: "physical_activity_performance", label: "Physical Activity & Performance", summaryPhrase: "physical activity and sports" },
    { id: "cultural_historical_exploration", label: "Cultural & Historical Exploration", summaryPhrase: "exploring cultures and history" },
    { id: "artistic_performance", label: "Artistic Performance", summaryPhrase: "performing and expressing artistically" },
  ],
  interests: [
    {
      id: "computer_science",
      label: "Computer Science",
      weights: { problem_solving: 0.35, analytical_thinking: 0.25, technology_systems: 0.3, quantitative_thinking: 0.1 },
    },
    {
      id: "engineering",
      label: "Engineering",
      weights: { problem_solving: 0.3, building_making: 0.3, technology_systems: 0.2, analytical_thinking: 0.2 },
    },
    {
      id: "mathematics",
      label: "Mathematics",
      weights: { quantitative_thinking: 0.5, analytical_thinking: 0.3, problem_solving: 0.2 },
    },
    {
      id: "physics",
      label: "Physics",
      weights: { scientific_inquiry: 0.35, quantitative_thinking: 0.3, problem_solving: 0.2, experimentation: 0.15 },
    },
    {
      id: "chemistry",
      label: "Chemistry",
      weights: { scientific_inquiry: 0.4, experimentation: 0.35, analytical_thinking: 0.15, quantitative_thinking: 0.1 },
    },
    {
      id: "biology",
      label: "Biology",
      weights: { scientific_inquiry: 0.4, nature_environment: 0.35, experimentation: 0.15, analytical_thinking: 0.1 },
    },
    {
      id: "medicine_healthcare",
      label: "Medicine & Healthcare",
      weights: { helping_service: 0.35, scientific_inquiry: 0.3, analytical_thinking: 0.2, experimentation: 0.15 },
    },
    {
      id: "business_entrepreneurship",
      label: "Business & Entrepreneurship",
      weights: { leadership_initiative: 0.35, persuasion_influence: 0.25, creativity: 0.2, organization_planning: 0.2 },
    },
    {
      id: "economics_finance",
      label: "Economics & Finance",
      weights: { quantitative_thinking: 0.4, analytical_thinking: 0.35, organization_planning: 0.15, leadership_initiative: 0.1 },
    },
    {
      id: "research",
      label: "Research",
      weights: { scientific_inquiry: 0.4, analytical_thinking: 0.3, experimentation: 0.2, problem_solving: 0.1 },
    },
    {
      id: "leadership",
      label: "Leadership",
      weights: { leadership_initiative: 0.45, organization_planning: 0.25, communication: 0.2, persuasion_influence: 0.1 },
    },
    {
      id: "public_speaking_debate",
      label: "Public Speaking & Debate",
      weights: { communication: 0.4, persuasion_influence: 0.35, verbal_expression: 0.15, leadership_initiative: 0.1 },
    },
    {
      id: "law_politics",
      label: "Law & Politics",
      weights: {
        persuasion_influence: 0.35,
        communication: 0.25,
        analytical_thinking: 0.2,
        leadership_initiative: 0.1,
        cultural_historical_exploration: 0.1,
      },
    },
    {
      id: "arts_design",
      label: "Arts & Design",
      weights: { creativity: 0.45, visual_expression: 0.45, building_making: 0.1 },
    },
    {
      id: "media_content_creation",
      label: "Media & Content Creation",
      weights: { creativity: 0.3, communication: 0.3, visual_expression: 0.2, verbal_expression: 0.2 },
    },
    {
      id: "writing_literature",
      label: "Writing & Literature",
      weights: { verbal_expression: 0.5, creativity: 0.35, cultural_historical_exploration: 0.15 },
    },
    {
      id: "languages",
      label: "Languages",
      weights: { communication: 0.4, verbal_expression: 0.3, cultural_historical_exploration: 0.3 },
    },
    {
      id: "social_impact_volunteering",
      label: "Social Impact & Volunteering",
      weights: { helping_service: 0.5, communication: 0.2, leadership_initiative: 0.15, nature_environment: 0.15 },
    },
    {
      id: "environment_sustainability",
      label: "Environment & Sustainability",
      weights: { nature_environment: 0.5, scientific_inquiry: 0.25, analytical_thinking: 0.15, helping_service: 0.1 },
    },
    {
      id: "sports_fitness",
      label: "Sports & Fitness",
      weights: { physical_activity_performance: 0.85, leadership_initiative: 0.1, problem_solving: 0.05 },
    },
    {
      id: "music_performing_arts",
      label: "Music & Performing Arts",
      weights: { artistic_performance: 0.55, creativity: 0.35, communication: 0.1 },
    },
    {
      id: "history",
      label: "History",
      weights: { cultural_historical_exploration: 0.6, analytical_thinking: 0.25, verbal_expression: 0.15 },
    },
  ],
  results: {
    topN: 5,
    minTopN: 3,
    introTitle: "Let's discover what you might enjoy.",
    introBody:
      "You don't need to know your interests already. We'll ask you about different activities and situations. There are no right or wrong answers.",
    resultsTitle: "We discovered some areas you may enjoy",
    resultsFooter:
      "These are suggestions based on your answers, not fixed labels. Your interests can change as you discover new things.",
    disclaimer:
      "This assessment is research-informed and designed to suggest areas worth exploring. It does not diagnose personality, ability, or future career.",
  },
} as const satisfies InterestDiscoveryConfig;
