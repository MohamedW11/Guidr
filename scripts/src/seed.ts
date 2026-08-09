import "../load-env.ts";
import { db } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  adminProfilesTable,
  opportunitiesTable,
  lessonsTable,
} from "@workspace/db/schema";

import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting Guidr Education Hub seed process...");

  const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
  const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);

  // 1. Seed Admin User & Profile
  const [adminUser] = await db
    .insert(usersTable)
    .values({
      email: "admin@guidred.org",
      passwordHash: adminPasswordHash,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  if (adminUser) {
    await db.insert(adminProfilesTable).values({
      userId: adminUser.id,
      name: "Guidr Master Admin",
      phone: "+201000000000",
      role: "super_admin",
    }).onConflictDoNothing();
    console.log("✅ Admin user seeded.");
  }

  // 2. Seed Student User & Profile
  const [studentUser] = await db
    .insert(usersTable)
    .values({
      email: "student@guidred.org",
      passwordHash: studentPasswordHash,
      role: "student",
    })
    .onConflictDoNothing()
    .returning();

  if (studentUser) {
    await db.insert(studentProfilesTable).values({
      userId: studentUser.id,
      firstName: "Omar",
      lastName: "Hassan",
      phone: "+201200000000",
      school: "STEM High School for Boys",
      governorate: "Giza",
      grade: 11,
      interests: ["Computer Science", "Engineering", "Research", "Mathematics"],
    }).onConflictDoNothing();
    console.log("✅ Student user seeded.");
  }

  // 3. Seed Initial 20 Real Opportunities
  await db.insert(opportunitiesTable).values([
    {
      name: "ISEF Egypt Science & Engineering Fair",
      categories: ["Competitions", "Research Programs"],
      types: ["STEM", "Scientific Research"],
      description: "The flagship national STEM research competition for Egyptian high school students presenting groundbreaking scientific projects.",
      organization: "Ministry of Education & Intel Egypt",
      imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-11-15",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Cairo International Convention Centre, Cairo",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://isef-egypt.org/apply",
      status: "active",
    },
    {
      name: "USAID STEM Undergraduate Scholarship Egypt",
      categories: ["Scholarships"],
      types: ["Full Tuition", "STEM Education"],
      description: "Fully funded university scholarship for top Egyptian STEM high school graduates pursuing science and technology degrees.",
      organization: "USAID Egypt & Ministry of Education",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-08-30",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Partner Egyptian Universities (AUC, GUC, Zewail)",
      gradeMin: 12,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.usaid.gov/egypt/scholarships",
      status: "active",
    },
    {
      name: "AUC Model United Nations (MUN Cairo)",
      categories: ["Workshops"],
      types: ["Leadership", "International Relations"],
      description: "Empowering Egyptian youth through diplomatic debate, global affairs analysis, and international negotiations.",
      organization: "American University in Cairo",
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-06-24",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "AUC New Cairo Campus",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.aucegypt.edu/students/activities/mun",
      status: "active",
    },
    {
      name: "INJAZ Egypt Student Company Program",
      categories: ["Workshops"],
      types: ["Entrepreneurship", "Business"],
      description: "Hands-on entrepreneurship accelerator guiding high school teams to launch real, viable student enterprises.",
      organization: "INJAZ Egypt & Junior Achievement",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-08-18",
      deadlineTime: "23:59:00",
      locationType: "hybrid",
      locationDetails: "Cairo & Alexandria Training Hubs",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://injaz-egypt.org/programs",
      status: "active",
    },
    {
      name: "NASA Space Apps Challenge Cairo",
      categories: ["Competitions"],
      types: ["Hackathon", "Space Science"],
      description: "48-hour global hackathon using open space data to solve Earth and space exploration challenges.",
      organization: "NASA & IEEE Egypt",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-09-02",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Greek Campus, Downtown Cairo",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://spaceappscairo.com",
      status: "active",
    },
    {
      name: "Flat6Labs Youth Innovation Incubator",
      categories: ["Workshops"],
      types: ["Startup Incubator", "Technology"],
      description: "Mentorship and seed incubator helping young founders refine technology prototypes into scalable ventures.",
      organization: "Flat6Labs Cairo",
      imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-09-21",
      deadlineTime: "23:59:00",
      locationType: "online",
      locationDetails: "Online Virtual Incubator",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.flat6labs.com/program/cairo",
      status: "active",
    },
    {
      name: "Zewail City Undergraduate Research Fellowship",
      categories: ["Research Programs"],
      types: ["Biotechnology", "Nanotechnology"],
      description: "Immersive summer lab fellowship pairing students with lead scientists in bio-tech, nanotech, and renewable energy.",
      organization: "Zewail City of Science and Technology",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-05-30",
      deadlineTime: "18:00:00",
      locationType: "in_person",
      locationDetails: "Zewail City Campus, 6th of October City",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://zewailcity.edu.eg/research-fellowships",
      status: "active",
    },
    {
      name: "AUC Excellence Merit Scholarship",
      categories: ["Scholarships"],
      types: ["Undergraduate Degree", "Merit Aid"],
      description: "Full and partial merit scholarships for exceptional Egyptian high school graduates across engineering and sciences.",
      organization: "The American University in Cairo",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-08-01",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "AUC New Cairo Campus",
      gradeMin: 12,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.aucegypt.edu/admissions/scholarships",
      status: "active",
    },
    {
      name: "ALX Egypt Software Engineering Bootcamp",
      categories: ["Workshops"],
      types: ["Coding", "Software Engineering"],
      description: "Rigorous 12-month software engineering and career readiness program for ambitious African developers.",
      organization: "ALX Africa & Mastercard Foundation",
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-10-15",
      deadlineTime: "23:59:00",
      locationType: "online",
      locationDetails: "ALX Tech Hub Cairo & Virtual Portal",
      gradeMin: 11,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.alxafrica.com/software-engineering",
      status: "active",
    },
    {
      name: "IEEE Egypt STEM Student Robotics Challenge",
      categories: ["Competitions"],
      types: ["Robotics", "Engineering"],
      description: "National engineering championship challenging student teams to design autonomous robots for industrial tasks.",
      organization: "IEEE Egypt Section",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-11-10",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Cairo University Sports Hall",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://ieee-egypt.org/robotics-challenge",
      status: "active",
    },
    {
      name: "Fulbright Junior Development Fellowship",
      categories: ["Exchange Programs"],
      types: ["Cultural Exchange", "Academic Grant"],
      description: "Prestigious US exchange grant for young leaders to complete academic coursework and cultural exchange in the US.",
      organization: "US-EF Commission in Egypt",
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-12-01",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Host Universities across the United States",
      gradeMin: 11,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://fulbright-egypt.org/program/jjdp",
      status: "active",
    },
    {
      name: "Egypt IoT & AI National Challenge",
      categories: ["Competitions"],
      types: ["Artificial Intelligence", "Hardware"],
      description: "National innovation competition for Internet of Things and Artificial Intelligence applications in agriculture & healthcare.",
      organization: "Ministry of Communications (MCIT) & IEEE",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-10-25",
      deadlineTime: "23:59:00",
      locationType: "hybrid",
      locationDetails: "Creativa Innovation Hubs across Egypt",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://egyptiotchallenge.org",
      status: "active",
    },
    {
      name: "Rise Egypt Social Innovation Fellowship",
      categories: ["Volunteering"],
      types: ["Social Impact", "Sustainability"],
      description: "Fellowship supporting social entrepreneurs creating sustainable economic and environmental impact across Egypt.",
      organization: "Rise Egypt Foundation",
      imageUrl: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-09-14",
      deadlineTime: "23:59:00",
      locationType: "hybrid",
      locationDetails: "Cairo Innovation Hub",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://riseegypt.org/fellowship",
      status: "active",
    },
    {
      name: "MEPI Tomorrow's Leaders Scholarship",
      categories: ["Scholarships"],
      types: ["Fully Funded", "Leadership"],
      description: "Fully funded undergraduate scholarship covering full tuition, living expenses, and leadership development.",
      organization: "US Department of State & AUC",
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-12-15",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "American University in Cairo & LAU",
      gradeMin: 12,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://tomorrowsleadersprogram.org",
      status: "active",
    },
    {
      name: "Cairo Youth Climate Action Summit",
      categories: ["Volunteering"],
      types: ["Climate Policy", "Environment"],
      description: "National summit gathering youth advocates to present renewable energy and sustainability policy recommendations.",
      organization: "Youth Loves Egypt & Ministry of Environment",
      imageUrl: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-11-05",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "National Environment Centre, Cairo",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://yle-egypt.org/climate-summit",
      status: "active",
    },
    {
      name: "CyberTalents Egypt Security Hackathon",
      categories: ["Competitions"],
      types: ["Cybersecurity", "Ethical Hacking"],
      description: "Capture the Flag (CTF) competition testing ethical hacking, cryptography, and network security skills.",
      organization: "CyberTalents & MCIT",
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-10-18",
      deadlineTime: "23:59:00",
      locationType: "online",
      locationDetails: "Online Live Cyber Range",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://cybertalents.com/competitions/egypt-national-ctf",
      status: "active",
    },
    {
      name: "Global UGRAD Exchange Program",
      categories: ["Exchange Programs"],
      types: ["Cultural Exchange", "US Study"],
      description: "Semester-long non-degree exchange program at US universities for emerging student leaders.",
      organization: "US Embassy Cairo & World Learning",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-12-15",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "Universities across the USA",
      gradeMin: 11,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://eg.usembassy.gov/education-culture/ugrad",
      status: "active",
    },
    {
      name: "Google Summer of Code (GSoC) Egypt Cohort",
      categories: ["Workshops"],
      types: ["Open Source", "Software Development"],
      description: "Global online program focusing on bringing student developers into open-source software development.",
      organization: "Google Developer Groups Cairo",
      imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-04-04",
      deadlineTime: "23:59:00",
      locationType: "online",
      locationDetails: "Online Remote Mentorship",
      gradeMin: 11,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://summerofcode.withgoogle.com",
      status: "active",
    },
    {
      name: "UNDP Egypt Youth Sustainability Fellowship",
      categories: ["Research Programs"],
      types: ["Sustainable Development", "Policy"],
      description: "Research grant pairing student researchers with UN policy analysts working on sustainable development goals.",
      organization: "United Nations Development Programme Egypt",
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-11-20",
      deadlineTime: "23:59:00",
      locationType: "hybrid",
      locationDetails: "UNDP Egypt Office, Cairo",
      gradeMin: 10,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://www.undp.org/egypt/youth-fellowship",
      status: "active",
    },
    {
      name: "Egyptian STEM Schools National Science Fair",
      categories: ["Competitions"],
      types: ["Capston Research", "STEM"],
      description: "Annual national exhibition showcasing capstone engineering and scientific innovations from Egypt's STEM schools.",
      organization: "STEM Egypt & EGF Foundation",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
      deadlineDate: "2026-12-12",
      deadlineTime: "23:59:00",
      locationType: "in_person",
      locationDetails: "STEM High School Campus, 6th of October City",
      gradeMin: 9,
      gradeMax: 12,
      eligibleGovernorates: ["All"],
      applicationLink: "https://stemegypt.edu.eg/national-fair",
      status: "active",
    },
  ]).onConflictDoNothing();
  console.log("✅ 20 Real opportunities seeded.");

  // 4. Seed Initial 3 Requested Lessons for Guidr Tutor
  await db.insert(lessonsTable).values([
    {
      title: "What Are Extracurricular Activities?",
      module: "General",
      description: "Understand how clubs, competitions, volunteering, and projects shape your personal growth and college readiness.",
      content: `Extracurricular activities are any pursuits you engage in outside of standard academic coursework. They allow you to explore personal interests, develop practical skills, and demonstrate commitment to future goals.

### 1. Why Are Extracurriculars Important?
- **Skill Development**: Build teamwork, leadership, problem-solving, and communication abilities.
- **Interest Exploration**: Test different fields (such as robotics, public speaking, software, or community service) before choosing a university major.
- **Distinction**: Show university admissions and scholarship committees what makes you unique beyond grades and test scores.

### 2. Key Types of Extracurricular Activities
- **Competitions & Fairs**: ISEF Science Fairs, NASA Space Apps, Hackathons, and Olympiads.
- **Student Organizations & Clubs**: Model United Nations (MUN Cairo), Student Unions, and Debate Societies.
- **Community Service & Volunteering**: Environmental initiatives, tutoring younger students, and local non-profit work.
- **Personal Projects**: Building an app, writing research papers, running a blog, or founding an initiative.

### 3. Quality vs. Quantity
Admissions officers prefer **deep engagement in 2–3 meaningful activities** where you showed initiative and impact, rather than superficial participation in a dozen clubs.`,
      status: "published",
      sortOrder: 1,
    },
    {
      title: "What Is a Scholarship?",
      module: "General",
      description: "Learn about merit-based, need-based, and fully funded scholarships available for Egyptian students.",
      content: `A scholarship is financial aid awarded to students to assist with educational expenses, ranging from full tuition and living stipends to partial program grants.

### 1. Types of Scholarships
- **Merit-Based Scholarships**: Awarded for academic excellence, scientific research, leadership, or athletic achievement (e.g., AUC Merit Scholarship).
- **Need-Based Financial Aid**: Awarded based on a student’s demonstrated financial need to ensure education is accessible.
- **Fully Funded Grants**: Covers tuition, housing, airfare, monthly living stipends, and health insurance (e.g., USAID STEM Scholarship, MEPI Tomorrow's Leaders, Global UGRAD).

### 2. Essential Application Components
- **Official Academic Transcripts**: High school grade records.
- **Personal Statement & Essays**: Narratives highlighting your goals, achievements, and resilience.
- **Letters of Recommendation**: Written by teachers or mentors who know your character and work ethic.
- **Standardized Tests & English Proficiency**: TOEFL/IELTS or SAT scores where required.

### 3. Tips for Scholarship Success
1. **Start Early**: Research deadlines 6–12 months in advance.
2. **Tailor Your Essays**: Answer the specific prompt directly without generic templates.
3. **Proofread Carefully**: Ensure zero spelling or grammatical mistakes.`,
      status: "published",
      sortOrder: 2,
    },
    {
      title: "How to Use Guidr",
      module: "General",
      description: "Discover how to explore opportunities, track deadlines, complete lessons, and chat with your AI Tutor.",
      content: `Guidr is your personal compass for navigating educational opportunities, scholarships, and academic growth across Egypt.

### 1. Exploring & Filtering Opportunities
- Navigate to the **Opportunities** page to browse curated competitions, scholarships, summer programs, and workshops.
- Use the **Checkboxes Filter Sidebar** to filter by Category, Interests, and Mode (In-Person vs. Online).
- Sort by **Closing Soon (Deadline)** to never miss an important application cutoff!

### 2. Saving & Tracking Deadlines
- Click the **Bookmark icon** on any opportunity card to save it to your personal dashboard.
- Saved opportunities appear right at the top of your **Dashboard** and **Saved** tab for quick access.

### 3. Learning with Guidr Tutor & AI Study Buddy
- Go to **Guidr Tutor** to follow structured learning paths designed for Egyptian high school students.
- Complete lessons sequentially—finishing one automatically unlocks the next step!
- Use the **Guidr AI Tutor** sidebar inside any lesson to ask questions, clarify confusing concepts, or start a **New Chat** anytime.`,
      status: "published",
      sortOrder: 3,
    },
  ]).onConflictDoNothing();
  console.log("✅ 3 Requested Guidr Tutor lessons seeded.");

  console.log("🎉 Seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
