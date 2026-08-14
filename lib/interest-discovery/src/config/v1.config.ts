import type { InterestDiscoveryConfig } from "../types.js";

export const v1Config = {
  version: "v1",
  scale: {
    min: 1,
    max: 5,
    labels: [
      "Not at all like me",
      "A little like me",
      "Somewhat like me",
      "Mostly like me",
      "Very much like me",
    ],
  },
  questions: [
    {
      id: "q1",
      text: "The fan or AC breaks before iftar and guests are coming. You try to fix it yourself before calling anyone.",
      signals: ["building_making", "problem_solving"],
    },
    {
      id: "q2",
      text: "On a free Friday, you would rather fix something with your hands (a bike, a phone, a charger) than watch a video about how to fix it.",
      signals: ["building_making", "experimentation"],
    },
    {
      id: "q3",
      text: "On a school trip to a factory, you like watching the machines work more than listening to the guide talk.",
      signals: ["technology_systems", "analytical_thinking"],
    },
    {
      id: "q4",
      text: "When the WiFi at home stops working, you try to fix it yourself before calling for help.",
      signals: ["technology_systems", "problem_solving"],
    },
    {
      id: "q5",
      text: "A full day of physical work, like helping set up for a family event, with no time to sit and think makes you feel tired, not excited.",
      signals: ["analytical_thinking", "organization_planning"],
    },
    {
      id: "q6",
      text: "Your grade in a subject goes down this term. Before asking your teacher, you check your answer sheet yourself to find out why.",
      signals: ["analytical_thinking", "problem_solving"],
    },
    {
      id: "q7",
      text: "Your teacher asks a hard question in class that no one can answer right away. You feel curious, not uncomfortable.",
      signals: ["scientific_inquiry", "analytical_thinking"],
    },
    {
      id: "q8",
      text: "You want to know why something works, not just that it works.",
      signals: ["scientific_inquiry", "analytical_thinking"],
    },
    {
      id: "q9",
      text: "Once you solve a math problem one way, you move to the next question. You don't try to find a better way.",
      signals: ["quantitative_thinking", "problem_solving"],
    },
    {
      id: "q10",
      text: "Long videos that explain how something works lose your attention quickly.",
      signals: ["experimentation", "building_making"],
    },
    {
      id: "q11",
      text: "Your teacher gives you an assignment with strict rules — an exact number of pages, a fixed structure — and no freedom. You feel stuck, not comfortable.",
      signals: ["creativity", "visual_expression"],
    },
    {
      id: "q12",
      text: "You often change or personalize things, like your notebook, your room, your playlist, without anyone asking you to.",
      signals: ["creativity", "visual_expression"],
    },
    {
      id: "q13",
      text: "When your class is planning a trip, you are usually the one who suggests something different from the usual plan.",
      signals: ["creativity", "leadership_initiative"],
    },
    {
      id: "q14",
      text: "You feel more comfortable when a question has one clear answer, like in math, than when it's open, like an essay.",
      signals: ["quantitative_thinking", "analytical_thinking"],
    },
    {
      id: "q15",
      text: "You would rather follow the exact method your tutor taught you than try your own way, even if yours might also work.",
      signals: ["organization_planning", "analytical_thinking"],
    },
    {
      id: "q16",
      text: "A classmate is behind in a subject you're good at. The night before an exam, you want to actually teach them, not just send your notes.",
      signals: ["helping_service", "communication"],
    },
    {
      id: "q17",
      text: "You notice when a friend is quiet in the group chat, even before they say something is wrong. You check on them.",
      signals: ["helping_service", "communication"],
    },
    {
      id: "q18",
      text: "Studying with a group before exams feels better to you than studying alone, even if you cover less material.",
      signals: ["communication", "helping_service"],
    },
    {
      id: "q19",
      text: "You would rather study completely alone than with a group.",
      signals: ["analytical_thinking", "verbal_expression"],
    },
    {
      id: "q20",
      text: "In a group project, you focus on finishing your own part well. You don't check if your teammates understand theirs.",
      signals: ["organization_planning", "problem_solving"],
    },
    {
      id: "q21",
      text: "When your school plans a charity event or a National Day event, you like leading the planning more than doing one small task.",
      signals: ["leadership_initiative", "organization_planning"],
    },
    {
      id: "q22",
      text: "It is easy for you to convince your parents or a teacher to agree with you — like getting permission for a trip.",
      signals: ["persuasion_influence", "communication"],
    },
    {
      id: "q23",
      text: "You would rather explain your idea to the whole class than write it and hand it in quietly.",
      signals: ["communication", "persuasion_influence", "leadership_initiative"],
    },
    {
      id: "q24",
      text: "Being in charge of a school event stresses you more than it excites you.",
      signals: ["leadership_initiative", "organization_planning"],
    },
    {
      id: "q25",
      text: "You have thought about starting something of your own — a small shop, tutoring other students, a social media page.",
      signals: ["leadership_initiative", "creativity", "persuasion_influence"],
    },
    {
      id: "q26",
      text: "You keep your study schedule and notes organized without your parents telling you to.",
      signals: ["organization_planning", "analytical_thinking"],
    },
    {
      id: "q27",
      text: "You feel satisfied when you finish a task by following a checklist step by step.",
      signals: ["organization_planning"],
    },
    {
      id: "q28",
      text: "When your class collects money for a trip, you want to track every pound carefully.",
      signals: ["quantitative_thinking", "organization_planning"],
    },
    {
      id: "q29",
      text: "You often forget deadlines because you focus on the big picture, not the small details.",
      signals: ["creativity", "leadership_initiative"],
    },
    {
      id: "q30",
      text: "Filling out a form, like a scholarship application, feels boring to you, not satisfying.",
      signals: ["organization_planning", "verbal_expression"],
    },
    {
      id: "q31",
      text: "Your school is running a charity drive during Ramadan. Would you rather (a) collect donations door-to-door yourself, or (b) plan and manage the whole collection for your class?",
      signals: ["helping_service", "leadership_initiative", "organization_planning"],
    },
    {
      id: "q32",
      text: "For your school science fair, would you rather (a) build the model and make it work, or (b) work out the math and theory behind it?",
      signals: ["building_making", "scientific_inquiry", "quantitative_thinking"],
    },
    {
      id: "q33",
      text: "Your class has an open project for National Day. Would you rather (a) make something new from scratch, even if it's not perfect, or (b) take something that already exists and improve it?",
      signals: ["creativity", "problem_solving", "building_making"],
    },
    {
      id: "q34",
      text: "Your school is talking to a bus company for a cheaper trip price. Would you rather (a) be the one who negotiates with the company, or (b) spend that time helping a classmate study for an exam?",
      signals: ["persuasion_influence", "helping_service", "communication"],
    },
    {
      id: "q35",
      text: "You're choosing a school club to join. Which is more true for you: (a) \"I want to see what it's like, I'm curious,\" or (b) \"It will look good on my university application\"?",
      signals: ["scientific_inquiry", "organization_planning"],
    },
    {
      id: "q36",
      text: "Think about a subject you work hard in. Which is more true: (a) \"I enjoy doing it,\" or (b) \"It's expected of me — by my family, or because of my exam score and which college it can get me into\"?",
      signals: ["creativity", "scientific_inquiry", "organization_planning"],
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
