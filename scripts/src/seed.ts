// @ts-ignore
import "../load-env.ts";
import { db } from "@workspace/db";
import {
  usersTable,
  studentProfilesTable,
  adminProfilesTable,
  opportunitiesTable,
  savedOpportunitiesTable,
  lessonsTable,
} from "@workspace/db/schema";

import bcrypt from "bcryptjs";

const NEW_OPPORTUNITIES = [
  {
    name: "USAID STEM Undergraduate Scholarship",
    organization: "USAID Egypt & Ministry of Higher Education",
    categories: ["Scholarships"],
    interests: ["Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology", "Research"],
    types: ["Full Tuition", "STEM Education", "Living Allowance"],
    description: "Fully funded university scholarship for top Egyptian high school graduates pursuing science and technology degrees at premier Egyptian universities.",
    locationType: "in_person",
    locationDetails: "AUC, Zewail City, Cairo University, Ain Shams University, Alexandria University",
    deadlineDate: "2026-06-30",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.usaid.gov/egypt/scholarships",
    status: "active"
  },
  {
    name: "Sawiris Foundation Undergraduate Scholarship",
    organization: "Sawiris Foundation for Social Development",
    categories: ["Scholarships"],
    interests: ["Engineering", "Computer Science", "Economics & Finance", "Business & Entrepreneurship", "Leadership"],
    types: ["Full Tuition", "Study Abroad", "Living Allowance"],
    description: "Fully funded scholarship for high-achieving Egyptian students to complete their undergraduate studies at top universities in the US and Europe.",
    locationType: "in_person",
    locationDetails: "United States and Europe",
    deadlineDate: "2026-07-15",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.sawirisfoundation.org",
    status: "active"
  },
  {
    name: "Kennedy-Lugar Youth Exchange and Study (YES) Program",
    organization: "U.S. Department of State & Amideast Egypt",
    categories: ["Exchange Programs"],
    interests: ["Leadership", "Languages", "Public Speaking & Debate", "Social Impact & Volunteering", "History"],
    types: ["Full Cultural Exchange", "High School Year Abroad", "Living Allowance"],
    description: "Fully funded program for Egyptian secondary school students to spend one academic year living with an American host family and studying at a US high school.",
    locationType: "in_person",
    locationDetails: "United States",
    deadlineDate: "2026-10-15",
    deadlineTime: "17:00:00",
    gradeMin: 9,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.yesprograms.org/countries/egypt",
    status: "active"
  },
  {
    name: "TechGirls Exchange Program",
    organization: "U.S. Department of State & Legacy International",
    categories: ["Exchange Programs", "Summer Programs"],
    interests: ["Computer Science", "Engineering", "Mathematics", "Leadership", "Technology"],
    types: ["Full Exchange", "STEM Training", "Leadership Development"],
    description: "Fully funded summer exchange program in the US empowering young Egyptian women (ages 15-17) to pursue careers in science and technology.",
    locationType: "in_person",
    locationDetails: "Virginia Tech University & Washington D.C., USA",
    deadlineDate: "2026-12-01",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://techgirlsglobal.org",
    status: "active"
  },
  {
    name: "Intel ISEF Egypt (National Science & Engineering Fair)",
    organization: "Ministry of Education & Bibliotheca Alexandrina",
    categories: ["Competitions", "Research Programs"],
    interests: ["Computer Science", "Engineering", "Physics", "Chemistry", "Biology", "Medicine & Healthcare", "Research"],
    types: ["National Competition", "International Delegation Qualification"],
    description: "The premier nationwide STEM research competition for Egyptian students to showcase original research projects and qualify for the Regeneron ISEF in the US.",
    locationType: "hybrid",
    locationDetails: "Cairo and Alexandria Exhibition Centers",
    deadlineDate: "2026-11-30",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.bibalex.org",
    status: "active"
  },
  {
    name: "Egyptian Olympiad in Informatics (EOI)",
    organization: "Arab Academy for Science, Technology & Maritime Transport (AASTMT)",
    categories: ["Competitions"],
    interests: ["Computer Science", "Mathematics"],
    types: ["National Competition", "Algorithmic Programming", "IOI Qualification"],
    description: "National competitive programming competition testing problem-solving and algorithms in C++. Top performers represent Egypt at the International Olympiad in Informatics.",
    locationType: "hybrid",
    locationDetails: "AASTMT Campuses (Abu Kir Alexandria & Smart Village Cairo)",
    deadlineDate: "2026-12-15",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://eoi.aast.edu",
    status: "active"
  },
  {
    name: "Yale Young Global Scholars (YYGS)",
    organization: "Yale University",
    categories: ["Summer Programs"],
    interests: ["Law & Politics", "Economics & Finance", "Computer Science", "Biology", "Writing & Literature", "Leadership"],
    types: ["Academic Enrichment", "Full Need-Based Scholarship"],
    description: "An intensive 2-week academic summer program hosted by Yale University, offering full need-based financial aid covering 100% of costs for qualified international applicants.",
    locationType: "in_person",
    locationDetails: "Yale University, New Haven, CT, USA",
    deadlineDate: "2026-11-10",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://globalscholars.yale.edu",
    status: "active"
  },
  {
    name: "Research Science Institute (RSI)",
    organization: "Center for Excellence in Education (CEE) & MIT",
    categories: ["Research Programs", "Summer Programs"],
    interests: ["Mathematics", "Physics", "Computer Science", "Engineering", "Chemistry", "Biology", "Research"],
    types: ["Full Fellowship", "Lab Research", "Mentorship"],
    description: "Prestigious 6-week summer research program combining scientific theory coursework at MIT with off-campus lab research alongside leading scientists. 100% free for selected students.",
    locationType: "in_person",
    locationDetails: "Massachusetts Institute of Technology (MIT), Cambridge, USA",
    deadlineDate: "2027-01-15",
    deadlineTime: "23:59:00",
    gradeMin: 11,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.cee.org/programs/research-science-institute",
    status: "active"
  },
  {
    name: "English Access Microscholarship Program",
    organization: "U.S. Embassy Cairo & Amideast Egypt",
    categories: ["Scholarships", "Exchange Programs"],
    interests: ["Languages", "Leadership", "Public Speaking & Debate", "Writing & Literature"],
    types: ["Full Scholarship", "Language Training", "Cultural Exchange"],
    description: "Provides a foundation of English language skills and leadership training to talented 14-to-16-year-olds through after-school classes and summer camps.",
    locationType: "in_person",
    locationDetails: "Amideast Centers in Cairo, Alexandria, Luxor, Aswan, Mansoura, Assiut",
    deadlineDate: "2026-08-31",
    deadlineTime: "17:00:00",
    gradeMin: 9,
    gradeMax: 10,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.amideast.org/egypt",
    status: "active"
  },
  {
    name: "United World Colleges (UWC) Egypt National Committee Scholarship",
    organization: "UWC Egypt National Committee",
    categories: ["Scholarships", "Exchange Programs"],
    interests: ["Leadership", "Social Impact & Volunteering", "Law & Politics", "Environment & Sustainability", "Languages"],
    types: ["Full Scholarship", "International Baccalaureate", "High School Abroad"],
    description: "Selects Egyptian high school students for full 2-year International Baccalaureate (IB) Diploma scholarships at UWC campuses across the world.",
    locationType: "in_person",
    locationDetails: "Global UWC Campuses (UK, Singapore, USA, Norway, etc.)",
    deadlineDate: "2026-11-20",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://eg.uwc.org",
    status: "active"
  },
  {
    name: "Breakthrough Junior Challenge",
    organization: "Breakthrough Prize Foundation",
    categories: ["Competitions"],
    interests: ["Physics", "Mathematics", "Biology", "Media & Content Creation", "Research"],
    types: ["Global Competition", "Video Creation", "College Scholarship"],
    description: "International science video competition where students explain a complex mathematical or scientific concept in under 2 minutes to win a $250,000 scholarship.",
    locationType: "online",
    locationDetails: "Global Online Submission",
    deadlineDate: "2026-06-25",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://breakthroughjuniorchallenge.org",
    status: "active"
  },
  {
    name: "Conrad Challenge",
    organization: "Conrad Foundation",
    categories: ["Competitions"],
    interests: ["Business & Entrepreneurship", "Engineering", "Computer Science", "Environment & Sustainability", "Medicine & Healthcare"],
    types: ["Entrepreneurship Competition", "Mentorship", "Seed Funding"],
    description: "Annual innovation competition inviting teams of 2–5 students to design commercially viable solutions to global challenges across STEM and sustainability.",
    locationType: "hybrid",
    locationDetails: "Online rounds + Finals at NASA Kennedy Space Center",
    deadlineDate: "2026-11-01",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.conradchallenge.org",
    status: "active"
  },
  {
    name: "FIRST Global Challenge Team Egypt Selection",
    organization: "FIRST Global & IEEE Egypt Section",
    categories: ["Competitions", "University Clubs & Communities"],
    interests: ["Engineering", "Computer Science", "Mathematics", "Leadership"],
    types: ["Robotics Competition", "National Team Selection", "International Travel"],
    description: "Annual selection and training process for the national robotics team representing Egypt at the Olympics-style FIRST Global Challenge.",
    locationType: "in_person",
    locationDetails: "Cairo & Alexandria Training Hubs",
    deadlineDate: "2026-05-30",
    deadlineTime: "18:00:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://first.global",
    status: "active"
  },
  {
    name: "AFS Global STEM Academies",
    organization: "AFS Intercultural Programs & BP",
    categories: ["Exchange Programs", "Summer Programs"],
    interests: ["Engineering", "Environment & Sustainability", "Leadership", "Social Impact & Volunteering"],
    types: ["Full Scholarship", "Virtual Learning", "4-Week Travel Experience"],
    description: "A 16-week program combining virtual STEM and social impact coursework with a 4-week fully funded exchange trip to Brazil, Egypt, India, or Europe.",
    locationType: "hybrid",
    locationDetails: "Online + 4-Week Overseas Study Tour",
    deadlineDate: "2027-01-10",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://egypt.afs.org",
    status: "active"
  },
  {
    name: "InnovaSTEM Innovation Fund & Competition",
    organization: "Innovators and Talented Support Fund (ISF Egypt)",
    categories: ["Competitions", "Research Programs"],
    interests: ["Engineering", "Computer Science", "Physics", "Chemistry", "Biology", "Business & Entrepreneurship"],
    types: ["Innovation Grant", "Mentorship", "National Recognition"],
    description: "Government-backed initiative under Egypt's Vision 2030 providing financial and technical support to high school students with patented or innovative scientific prototypes.",
    locationType: "in_person",
    locationDetails: "Ministry of Higher Education & Scientific Research, Cairo",
    deadlineDate: "2026-10-30",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.isf.gov.eg",
    status: "active"
  },
  {
    name: "Telluride Association Summer Seminar (TASS)",
    organization: "Telluride Association",
    categories: ["Summer Programs"],
    interests: ["Writing & Literature", "History", "Law & Politics", "Public Speaking & Debate", "Research"],
    types: ["Full Scholarship", "Humanities Seminar", "Critical Thinking"],
    description: "A 6-week residential seminar in critical humanities and social sciences hosted at top US universities with 100% covered tuition, housing, and travel for accepted international students.",
    locationType: "in_person",
    locationDetails: "Cornell University / University of Maryland, USA",
    deadlineDate: "2027-01-05",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.tellurideassociation.org",
    status: "active"
  },
  {
    name: "Beaver Works Summer Institute (BWSI MIT)",
    organization: "MIT Lincoln Laboratory",
    categories: ["Summer Programs"],
    interests: ["Computer Science", "Engineering", "Mathematics"],
    types: ["Online Course", "Project-Based Learning", "AI Training"],
    description: "Rigorous STEM summer program taught by MIT researchers covering autonomous cognitive assistance, quantum software, cybersecurity, and robotics. Free online prep course open globally.",
    locationType: "online",
    locationDetails: "Virtual Classroom",
    deadlineDate: "2027-03-31",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://beaverworks.ll.mit.edu",
    status: "active"
  },
  {
    name: "Qubit x Qubit Quantum Computing High School Course",
    organization: "The Coding School & IBM Quantum",
    categories: ["Summer Programs", "University Clubs & Communities"],
    interests: ["Computer Science", "Physics", "Mathematics"],
    types: ["Full Scholarship", "Quantum Mechanics", "Python Programming"],
    description: "Year-long or summer intensive introduction to quantum computing taught by MIT and Oxford researchers. Full scholarships available for Egyptian students.",
    locationType: "online",
    locationDetails: "Virtual Course",
    deadlineDate: "2026-09-15",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.qxfactor.org",
    status: "active"
  },
  {
    name: "Egyptian Olympiad in Mathematics (EMO)",
    organization: "Egyptian Mathematical Society & Ministry of Education",
    categories: ["Competitions"],
    interests: ["Mathematics", "Research"],
    types: ["National Competition", "IMO Qualification"],
    description: "Nationwide mathematical olympiad testing proof-based geometry, number theory, algebra, and combinatorics. Top winners qualify for the Egyptian IMO team.",
    locationType: "in_person",
    locationDetails: "Governorate Directorate Testing Centers across Egypt",
    deadlineDate: "2026-11-15",
    deadlineTime: "14:00:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://moe.gov.eg",
    status: "active"
  },
  {
    name: "Egyptian Physics Olympiad (EPhO)",
    organization: "Egyptian Physical Society & Zewail City of Science and Technology",
    categories: ["Competitions"],
    interests: ["Physics", "Mathematics"],
    types: ["National Competition", "IPhO Qualification"],
    description: "Competitive physics examination selecting and training high school students to represent Egypt at the International Physics Olympiad (IPhO).",
    locationType: "in_person",
    locationDetails: "Zewail City of Science and Technology, Giza",
    deadlineDate: "2026-11-20",
    deadlineTime: "15:00:00",
    gradeMin: 10,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.zewailcity.edu.eg",
    status: "active"
  },
  {
    name: "World Food Prize Egypt Youth Institute",
    organization: "World Food Prize Foundation & AUC",
    categories: ["Events", "Research Programs"],
    interests: ["Biology", "Environment & Sustainability", "Economics & Finance", "Research", "Public Speaking & Debate"],
    types: ["Research Summit", "Global Youth Institute Qualification"],
    description: "High school students research agricultural challenges and food security solutions in Egypt, present research to world experts, and qualify for the Global Youth Institute in the US.",
    locationType: "hybrid",
    locationDetails: "American University in Cairo (New Cairo Campus)",
    deadlineDate: "2026-09-30",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.worldfoodprize.org",
    status: "active"
  },
  {
    name: "NASA Space Apps Challenge Cairo & Alexandria",
    organization: "NASA & IEEE Egypt Section",
    categories: ["Competitions", "Events"],
    interests: ["Computer Science", "Engineering", "Physics", "Arts & Design", "Environment & Sustainability"],
    types: ["48-Hour Hackathon", "Global Finalist Nomination"],
    description: "The world's largest global hackathon where teams of students use open-source space data to build software, hardware, and creative solutions.",
    locationType: "hybrid",
    locationDetails: "Cairo University & Bibliotheca Alexandrina",
    deadlineDate: "2026-09-25",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.spaceappschallenge.org",
    status: "active"
  },
  {
    name: "New York Academy of Sciences Junior Academy",
    organization: "New York Academy of Sciences (NYAS)",
    categories: ["University Clubs & Communities", "Research Programs"],
    interests: ["Computer Science", "Engineering", "Medicine & Healthcare", "Environment & Sustainability", "Research"],
    types: ["Global STEM Network", "Project Challenges", "Mentorship"],
    description: "Global virtual network connecting students (ages 13-17) with expert mentors to solve real-world sustainability and technology challenges during 10-week sprints.",
    locationType: "online",
    locationDetails: "Global Platform",
    deadlineDate: "2026-07-31",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.nyas.org/programs/global-stem-alliance/junior-academy",
    status: "active"
  },
  {
    name: "Wharton Global High School Investment Competition",
    organization: "Wharton School of the University of Pennsylvania",
    categories: ["Competitions"],
    interests: ["Economics & Finance", "Business & Entrepreneurship", "Mathematics"],
    types: ["Investment Simulation", "Team Case Study", "Global Travel to Finals"],
    description: "Teams of 4-7 students manage a $100,000 virtual investment portfolio to build a strategic financial plan for a featured client. Top global teams win trips to present at Wharton.",
    locationType: "online",
    locationDetails: "Global Online + Finals at Wharton (Philadelphia, USA)",
    deadlineDate: "2026-09-18",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://globalyouth.wharton.upenn.edu/competitions",
    status: "active"
  },
  {
    name: "Al Alfi Foundation STEM Excellence Scholarship",
    organization: "Al Alfi Foundation for Human and Social Development",
    categories: ["Scholarships"],
    interests: ["Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry"],
    types: ["Full Scholarship", "Undergraduate Degree"],
    description: "Fully funded undergraduate scholarship program for Egyptian STEM high school graduates to pursue STEM fields at top national universities.",
    locationType: "in_person",
    locationDetails: "Zewail City, AUC, AASTMT",
    deadlineDate: "2026-08-15",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.alalfifoundation.org",
    status: "active"
  },
  {
    name: "Egyptian Red Crescent Youth Volunteer Corps",
    organization: "Egyptian Red Crescent",
    categories: ["Volunteering"],
    interests: ["Medicine & Healthcare", "Social Impact & Volunteering", "Leadership"],
    types: ["First Aid Training", "Disaster Response Volunteer", "Community Service"],
    description: "Youth volunteering initiative providing practical training in emergency response, medical aid, and community assistance drives across Egypt.",
    locationType: "in_person",
    locationDetails: "Branch offices across all 27 Egyptian Governorates",
    deadlineDate: "2026-12-31",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.egyptianrc.org",
    status: "active"
  },
  {
    name: "Pioneer Academics Research Program",
    organization: "Pioneer Academics & Oberlin College",
    categories: ["Research Programs"],
    interests: ["Computer Science", "Economics & Finance", "Medicine & Healthcare", "Law & Politics", "Research", "Writing & Literature"],
    types: ["Online Research", "College Credit", "Need-Based Full Scholarship"],
    description: "Online undergraduate-level research program under US university professors, culminating in a full research paper. Need-based full scholarships available for international students.",
    locationType: "online",
    locationDetails: "Virtual Mentorship",
    deadlineDate: "2026-12-20",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://pioneeracademics.com",
    status: "active"
  },
  {
    name: "International Youth Math Challenge (IYMC)",
    organization: "IYMC Global Committee",
    categories: ["Competitions"],
    interests: ["Mathematics", "Research"],
    types: ["Online Competition", "Certificates & Cash Awards"],
    description: "International online math competition designed to unleash creative mathematical problem-solving skills in high school students worldwide.",
    locationType: "online",
    locationDetails: "Online Submissions",
    deadlineDate: "2026-10-10",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://iymc.info",
    status: "active"
  },
  {
    name: "Model United Nations Egypt High School Conference (CIMUN / ALMUN)",
    organization: "Cairo International Model United Nations / AUC",
    categories: ["Events", "University Clubs & Communities"],
    interests: ["Law & Politics", "Public Speaking & Debate", "Leadership", "Languages"],
    types: ["Diplomacy Simulation", "Debate & Public Speaking"],
    description: "High school simulation of UN assemblies where delegates represent member nations to negotiate, draft resolutions, and debate geopolitical crises.",
    locationType: "in_person",
    locationDetails: "American University in Cairo (AUC Plaza)",
    deadlineDate: "2026-10-15",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["Cairo", "Giza", "Qalyubia"],
    applicationLink: "https://www.facebook.com/CIMUN.AUC",
    status: "active"
  },
  {
    name: "Bow Seat Ocean Awareness Contest",
    organization: "Bow Seat Ocean Awareness Programs",
    categories: ["Competitions"],
    interests: ["Environment & Sustainability", "Arts & Design", "Writing & Literature", "Media & Content Creation", "Music & Performing Arts"],
    types: ["Creative Writing", "Visual Arts", "Environmental Advocacy"],
    description: "Global competition inviting youth to advocate for environmental protection through visual art, poetry, creative writing, film, or interactive multimedia.",
    locationType: "online",
    locationDetails: "Online Submission",
    deadlineDate: "2026-06-15",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://bowseat.org/contests/ocean-awareness-contest",
    status: "active"
  },
  {
    name: "Resala Youth Volunteer Network",
    organization: "Resala Charity Organization",
    categories: ["Volunteering"],
    interests: ["Social Impact & Volunteering", "Leadership", "Arts & Design", "Languages"],
    types: ["Community Development", "Literacy Tutoring", "Charity Campaigns"],
    description: "Egypt's largest youth volunteer network offering high school students hands-on engagement in anti-illiteracy teaching, orphan support, and clothes recycling drives.",
    locationType: "in_person",
    locationDetails: "Resala Branches across all governorates",
    deadlineDate: "2026-12-31",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://resala.org",
    status: "active"
  },
  {
    name: "Youth for Climate Egypt Summit",
    organization: "UNICEF Egypt & Ministry of Youth and Sports",
    categories: ["Events", "Volunteering"],
    interests: ["Environment & Sustainability", "Social Impact & Volunteering", "Public Speaking & Debate", "Law & Politics"],
    types: ["Climate Youth Forum", "Policy Advocacy"],
    description: "National climate summit bringing together Egyptian youth to present climate advocacy proposals to government leaders and international organizations.",
    locationType: "in_person",
    locationDetails: "Civic Education Center, Zamalek, Cairo",
    deadlineDate: "2026-09-01",
    deadlineTime: "17:00:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.unicef.org/egypt",
    status: "active"
  },
  {
    name: "Bibliotheca Alexandrina Youth Science Summit",
    organization: "Planetarium Science Center, Bibliotheca Alexandrina",
    categories: ["Events", "Research Programs"],
    interests: ["Physics", "Chemistry", "Biology", "Computer Science", "Research"],
    types: ["Scientific Conference", "Project Poster Session"],
    description: "Annual gathering at the Library of Alexandria where high school researchers present their independent scientific discoveries to academic researchers.",
    locationType: "in_person",
    locationDetails: "Bibliotheca Alexandrina Conference Center, Alexandria",
    deadlineDate: "2026-08-20",
    deadlineTime: "16:00:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.bibalex.org/psc",
    status: "active"
  },
  {
    name: "African Leadership Academy (ALA) Two-Year Diploma",
    organization: "African Leadership Academy",
    categories: ["Scholarships", "Exchange Programs"],
    interests: ["Leadership", "Business & Entrepreneurship", "Law & Politics", "Social Impact & Volunteering"],
    types: ["Pre-University Diploma", "Full Need-Based Scholarship", "Boarding School"],
    description: "A prestigious 2-year pre-university program in South Africa developing Africa's future leaders. Offers full need-based financial assistance.",
    locationType: "in_person",
    locationDetails: "Johannesburg, South Africa",
    deadlineDate: "2026-12-15",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 11,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.africanleadershipacademy.org",
    status: "active"
  },
  {
    name: "VEX Robotics Competition Egypt",
    organization: "Ideas Gym & Ministry of Youth",
    categories: ["Competitions"],
    interests: ["Engineering", "Computer Science", "Mathematics"],
    types: ["Robotics Championship", "STEM Team Challenge"],
    description: "National engineering and programming robotics competition where student teams design and code robots to solve a field challenge.",
    locationType: "in_person",
    locationDetails: "Youth and Sports Arena, Cairo",
    deadlineDate: "2026-11-10",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.ideasgym.com",
    status: "active"
  },
  {
    name: "Misr El Kheir University Scholarship Program",
    organization: "Misr El Kheir Foundation",
    categories: ["Scholarships"],
    interests: ["Medicine & Healthcare", "Engineering", "Computer Science", "Biology"],
    types: ["Full University Tuition", "Financial Need Assistance"],
    description: "Fully funded undergraduate scholarships targeting high-achieving Egyptian students from underprivileged families in rural and Upper Egypt governorates.",
    locationType: "in_person",
    locationDetails: "Partner Public and Private Universities across Egypt",
    deadlineDate: "2026-08-10",
    deadlineTime: "17:00:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["Assiut", "Sohag", "Qena", "Luxor", "Aswan", "Minya", "Beni Suef", "Fayoum"],
    applicationLink: "https://misrelkheir.org",
    status: "active"
  },
  {
    name: "IEEE Egypt Section High School STEM Mentorship",
    organization: "IEEE Egypt Section Young Professionals",
    categories: ["University Clubs & Communities", "Research Programs"],
    interests: ["Computer Science", "Engineering", "Mathematics", "Research"],
    types: ["Mentorship Program", "Technical Workshops"],
    description: "Pairs university engineering students and professors with high school students to guide them through engineering projects and research writing.",
    locationType: "hybrid",
    locationDetails: "Online & IEEE Student Branch Universities (Cairo, Alex, Mansoura)",
    deadlineDate: "2026-10-01",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://ieeeegypt.org",
    status: "active"
  },
  {
    name: "Lumiere Research Scholar Program",
    organization: "Lumiere Education",
    categories: ["Research Programs"],
    interests: ["Computer Science", "Economics & Finance", "Medicine & Healthcare", "Physics", "Chemistry", "Biology", "Psychology"],
    types: ["Independent Research", "Full Need-Based Scholarship"],
    description: "1-on-1 research mentorship program with PhD scholars from top US universities. Offers 100% financial aid through the Lumiere Foundation for high-need international students.",
    locationType: "online",
    locationDetails: "Virtual Mentorship",
    deadlineDate: "2026-11-15",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.lumiere-education.com",
    status: "active"
  },
  {
    name: "Zewail City STEM High School Excellence Award",
    organization: "Zewail City of Science and Technology",
    categories: ["Scholarships", "Competitions"],
    interests: ["Physics", "Chemistry", "Biology", "Mathematics", "Engineering"],
    types: ["Merit University Scholarship", "Tuition Waiver"],
    description: "Full merit scholarships awarded to the top scoring STEM high school graduates nationwide to pursue science and engineering majors at Zewail City.",
    locationType: "in_person",
    locationDetails: "Zewail City, October City, Giza",
    deadlineDate: "2026-08-25",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.zewailcity.edu.eg",
    status: "active"
  },
  {
    name: "Life Makers Youth Ambassador Initiative",
    organization: "Life Makers Foundation Egypt",
    categories: ["Volunteering", "University Clubs & Communities"],
    interests: ["Social Impact & Volunteering", "Leadership", "Media & Content Creation"],
    types: ["Youth Leadership Corps", "Social Project Management"],
    description: "Empowers high school teams to launch local development projects focused on poverty alleviation, digital literacy, and community health.",
    locationType: "in_person",
    locationDetails: "Governorate Community Centers nationwide",
    deadlineDate: "2026-09-30",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://lifemakers.org",
    status: "active"
  },
  {
    name: "Cairo ICT Youth Innovation Summit",
    organization: "Tradefairs International & Ministry of CIT",
    categories: ["Events", "Competitions"],
    interests: ["Computer Science", "Business & Entrepreneurship", "Engineering"],
    types: ["Tech Exhibition", "Pitching Competition"],
    description: "Allows high school tech innovators to exhibit software applications and AI projects to major technology companies and venture investors.",
    locationType: "in_person",
    locationDetails: "Egypt International Exhibition Center (EIEC), New Cairo",
    deadlineDate: "2026-10-15",
    deadlineTime: "18:00:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://cairoict.com",
    status: "active"
  },
  {
    name: "Google Developer Student Clubs High School Mentorship",
    organization: "Google for Developers Egypt",
    categories: ["University Clubs & Communities"],
    interests: ["Computer Science", "Engineering"],
    types: ["Tech Workshops", "Software Mentorship"],
    description: "Mentorship series led by university GDSC leads teaching web development, mobile app development (Flutter), and machine learning to high school programmers.",
    locationType: "online",
    locationDetails: "Virtual Workshops & Community Discord",
    deadlineDate: "2026-10-05",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://gdsc.community.dev",
    status: "active"
  },
  {
    name: "AUC Merit Scholarship for High School Achievers",
    organization: "American University in Cairo (AUC)",
    categories: ["Scholarships"],
    interests: ["Computer Science", "Business & Entrepreneurship", "Economics & Finance", "Engineering", "Arts & Design"],
    types: ["Merit Full Tuition", "Undergraduate Degree"],
    description: "Full and partial undergraduate merit-based scholarships for Egyptian high school graduates demonstrating outstanding academic and extracurricular achievement.",
    locationType: "in_person",
    locationDetails: "AUC New Cairo Campus",
    deadlineDate: "2026-06-01",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.aucegypt.edu/admissions/scholarships",
    status: "active"
  },
  {
    name: "AFS Germany Community Service Scholarship",
    organization: "AFS Egypt & Weltwärts Germany",
    categories: ["Exchange Programs", "Volunteering"],
    interests: ["Social Impact & Volunteering", "Languages", "Leadership", "History"],
    types: ["Full Volunteer Exchange", "German Language Immersion"],
    description: "Fully funded community service exchange program in Germany sponsored by Weltwärts, covering travel, housing, living stipend, and insurance.",
    locationType: "in_person",
    locationDetails: "Germany",
    deadlineDate: "2026-11-25",
    deadlineTime: "23:59:00",
    gradeMin: 11,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://egypt.afs.org",
    status: "active"
  },
  {
    name: "Egyptian Astronomy Olympiad",
    organization: "Egyptian Society for Astronomy & Kottamia Astronomical Observatory",
    categories: ["Competitions"],
    interests: ["Physics", "Mathematics", "Research"],
    types: ["Astronomy Competition", "IOAA National Team Selection"],
    description: "National astronomy and astrophysics competition selecting students to undergo observatory training and represent Egypt at the International Olympiad on Astronomy and Astrophysics.",
    locationType: "hybrid",
    locationDetails: "Kottamia Observatory & Online",
    deadlineDate: "2026-11-05",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.nriag.sci.eg",
    status: "active"
  },
  {
    name: "Enactus Egypt High School Outreach Program",
    organization: "Enactus Egypt",
    categories: ["University Clubs & Communities", "Volunteering"],
    interests: ["Business & Entrepreneurship", "Social Impact & Volunteering", "Environment & Sustainability", "Leadership"],
    types: ["Social Entrepreneurship Training", "Community Business Projects"],
    description: "Connects high school teams with university Enactus leaders to build sustainable social businesses that uplift low-income Egyptian communities.",
    locationType: "in_person",
    locationDetails: "Partner Universities in Cairo, Alexandria, Assiut, Delta",
    deadlineDate: "2026-10-20",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://enactus.org.eg",
    status: "active"
  },
  {
    name: "Horizon Academic Research Program",
    organization: "Horizon Academic",
    categories: ["Research Programs"],
    interests: ["Computer Science", "Economics & Finance", "Mathematics", "Physics", "Chemistry", "Biology", "Research"],
    types: ["Trimester Research", "University Instructor Mentorship", "Full Scholarship"],
    description: "Trimester-long lab or theoretical research program pairing high school students with university professors. Full merit-and-need scholarships available.",
    locationType: "online",
    locationDetails: "Virtual Classroom",
    deadlineDate: "2026-11-30",
    deadlineTime: "23:59:00",
    gradeMin: 10,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.horizoninspires.com",
    status: "active"
  },
  {
    name: "Arabian Computer Science & AI High School Challenge",
    organization: "Arab League Educational, Cultural and Scientific Organization (ALECSO)",
    categories: ["Competitions"],
    interests: ["Computer Science", "Mathematics"],
    types: ["AI Programming Contest", "Regional Recognition"],
    description: "Pan-Arab competition testing high school students on machine learning concepts, computer vision projects, and algorithmic optimization.",
    locationType: "online",
    locationDetails: "ALECSO Digital Portal",
    deadlineDate: "2026-10-10",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "http://www.alecso.org",
    status: "active"
  },
  {
    name: "Google Women Techmakers High School Mentorship",
    organization: "Google Egypt",
    categories: ["University Clubs & Communities", "Events"],
    interests: ["Computer Science", "Engineering", "Leadership"],
    types: ["Mentorship Program", "Coding Bootcamps"],
    description: "Mentorship program designed to support young women in secondary schools exploring software engineering, cloud computing, and tech leadership.",
    locationType: "hybrid",
    locationDetails: "Google Cairo Office (Smart Village) & Online",
    deadlineDate: "2026-09-05",
    deadlineTime: "23:59:00",
    gradeMin: 9,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://developers.google.com/womentechmakers",
    status: "active"
  },
  {
    name: "MEPI Tomorrow's Leaders High School College Prep",
    organization: "U.S. Department of State & AUC",
    categories: ["Exchange Programs", "Scholarships"],
    interests: ["Leadership", "Law & Politics", "Economics & Finance", "Social Impact & Volunteering"],
    types: ["Full University Scholarship", "Leadership Training", "Study Abroad Semester"],
    description: "Fully funded 4-year undergraduate scholarship at AUC or AUB providing leadership development, civic engagement, and study abroad opportunities for top regional students.",
    locationType: "in_person",
    locationDetails: "AUC Cairo Campus",
    deadlineDate: "2026-12-05",
    deadlineTime: "23:59:00",
    gradeMin: 12,
    gradeMax: 12,
    eligibleGovernorates: ["All"],
    applicationLink: "https://www.tomorrowsleadersprogram.org",
    status: "active"
  }
];

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

  // 3. Clear Existing Opportunities & Seed New 50 Opportunities
  console.log("🧹 Clearing old opportunities...");
  await db.delete(savedOpportunitiesTable);
  await db.delete(opportunitiesTable);

  const formattedOpportunities = NEW_OPPORTUNITIES.map((opp) => ({
    name: opp.name,
    organization: opp.organization,
    categories: opp.categories || [],
    types: Array.from(new Set([...(opp.types || []), ...(opp.interests || [])])),
    description: opp.description,
    locationType: opp.locationType as any,
    locationDetails: opp.locationDetails,
    deadlineDate: opp.deadlineDate,
    deadlineTime: opp.deadlineTime,
    gradeMin: opp.gradeMin,
    gradeMax: opp.gradeMax,
    eligibleGovernorates: opp.eligibleGovernorates || ["All"],
    applicationLink: opp.applicationLink,
    status: opp.status as any,
  }));

  await db.insert(opportunitiesTable).values(formattedOpportunities as any);
  console.log(`✅ ${formattedOpportunities.length} Real opportunities seeded successfully.`);

  // 4. Seed Guidr Tutor Modules & Lessons
  console.log("🧹 Clearing old lessons...");
  await db.delete(lessonsTable);

  const MODULE_LESSONS = [
    // Module 1: Know
    {
      title: "Welcome to Guidr",
      module: "Know",
      sortOrder: 1,
      status: "published",
      content: `Welcome to Guidr Tutor! Guidr is your personal companion for navigating educational opportunities across Egypt and beyond.

### What is Guidr?
Guidr empowers high school students to discover summer programs, scholarships, exchange opportunities, competitions, and volunteering paths tailored to their personal goals.

### How to Get Started
- Explore curated opportunities on the Opportunities page.
- Track deadlines and bookmark your favorite choices.
- Learn step-by-step through Guidr Tutor lessons.`,
    },
    {
      title: "What are educational opportunities?",
      module: "Know",
      sortOrder: 2,
      status: "published",
      content: `Educational opportunities encompass any out-of-classroom experiences that accelerate your academic, personal, and professional development.

### Key Characteristics
- **Growth-Focused**: Designed to help you build real-world skills.
- **Accessible**: Ranging from local community events to fully funded international exchanges.
- **Diverse**: Covering STEM, humanities, arts, leadership, and public speaking.`,
    },
    {
      title: "Why are they important?",
      module: "Know",
      sortOrder: 3,
      status: "published",
      content: `Engaging in educational opportunities transforms your student journey.

### 1. Distinction Beyond Grades
Top universities and scholarship committees look beyond GPA. They want to see curiosity, initiative, and impact.

### 2. Practical Skill Building
Develop critical thinking, teamwork, problem-solving, and communication in real-world environments.

### 3. Expanding Your Network
Connect with like-minded peers, professors, industry mentors, and alumni across the globe.`,
    },
    {
      title: "What are the different types of opportunities, and why is each one important?",
      module: "Know",
      sortOrder: 4,
      status: "published",
      content: `Discover the major categories of educational opportunities available to Egyptian high school students:

### 1. Summer Programs
Intensive academic or research programs (e.g. YYGS, RSI, TechGirls) that give you a taste of university-level study.

### 2. Competitions
National and international contests (e.g. ISEF, EOI, Conrad Challenge) to test your skills and gain global recognition.

### 3. Volunteering
Community service initiatives (e.g. Red Crescent, Resala) that develop empathy, leadership, and civic responsibility.

### 4. Exchange Programs
Cultural and academic exchanges (e.g. YES Program, AFS) to immerse yourself in new global cultures.

### 5. Events
Workshops, hackathons, and conferences (e.g. NASA Space Apps, Youth Climate Summits) for intensive networking and learning.

### 6. Clubs & Communities
Student organizations (e.g. MUN, IEEE Youth, GDSC) providing ongoing peer collaboration and leadership roles.

### 7. Scholarships
Merit and need-based financial aid awards (e.g. USAID STEM, Sawiris Foundation, UWC) opening doors to premier universities.`,
    },
    {
      title: "Which opportunities are right for you?",
      module: "Know",
      sortOrder: 5,
      status: "published",
      content: `Selecting the right opportunities depends on your personal interests, grade level, and long-term aspirations.

### 1. Assess Your Passion
Choose activities that align with your natural curiosities rather than trying to check boxes.

2. Match Your Readiness & Grade
Start with local clubs or introductory competitions in grades 9-10, progressing to national research fairs or international scholarships in grades 11-12.

3. Quality Over Quantity
Focus deeply on 2-3 meaningful commitments where you can take initiative and demonstrate tangible leadership.`,
    },

    // Module 2: Prepare
    {
      title: "What is a good student profile?",
      module: "Prepare",
      sortOrder: 6,
      status: "published",
      content: `A strong student profile is a cohesive narrative showing who you are, what drives you, and how you create impact.

### Key Components of a Strong Profile
- **Academic Foundation**: Consistent commitment in school work and curiosity beyond standard curricula.
- **Focused Extracurricular Narrative**: Clear engagement in a specific spike or combination of interests.
- **Leadership & Initiative**: Starting projects, leading team efforts, or creating solutions for your community.
- **Reflective Self-Awareness**: Ability to articulate your growth and lessons learned through essays and interviews.`,
    },
    {
      title: "How to discover your interests and strengths",
      module: "Prepare",
      sortOrder: 7,
      status: "published",
      content: `Self-discovery is an active process of experimentation and reflection.

### 1. Take the Guidr Interest Assessment
Use our interactive Interest Discovery tool to highlight top skill domains across STEM, humanities, and entrepreneurship.

### 2. Try Micro-Experiences
Attend 1-day workshops, join school clubs, or build short personal projects to test what excites you.

### 3. Reflect on Energetic Engagement
Notice which activities feel energizing rather than draining. Your natural flow is a major clue to your core strengths.`,
    },
    {
      title: "How to find the right opportunities",
      module: "Prepare",
      sortOrder: 8,
      status: "published",
      content: `Finding relevant opportunities requires effective filtering and strategic search.

### 1. Leverage Guidr Filters
Filter opportunities by Category, Mode (Online vs. In-Person), Eligible Grade, and Governorate on Guidr.

### 2. Follow Trusted Platforms
Subscribe to educational newsletters, university outreach pages, and student communities.

### 3. Keep a Pipeline
Save opportunities to your Guidr Dashboard early so you can plan application timelines months in advance.`,
    },
    {
      title: "How to read and understand an opportunity",
      module: "Prepare",
      sortOrder: 9,
      status: "published",
      content: `Deconstruct every opportunity announcement into 5 critical pillars:

### 1. Eligibility
Check grade bounds, age limits, nationality, and governorate constraints first to avoid wasted effort.

### 2. Requirements
Note required transcripts, recommendation letters, English test scores (TOEFL/IELTS), or project portfolios.

### 3. Deadline & Time Zone
Record exact cut-off dates and time zones (e.g. 23:59 Cairo local time).

### 4. Funding & Financial Support
Identify whether the program is fully funded, offers need-based financial aid, or requires application fees.

### 5. Selection Process
Understand whether the selection involves written essay rounds, technical tasks, or live interviews.`,
    },
    {
      title: "How to build a strong application",
      module: "Prepare",
      sortOrder: 10,
      status: "published",
      content: `Crafting a compelling application requires clarity, authenticity, and attention to detail.

### 1. Tell Your Story
Structure your responses to show your journey, challenges overcome, and future ambition.

### 2. Quantify Your Achievements
Instead of saying "helped clean a local park", write "organized a 15-student initiative that collected 100kg of recyclable waste".

### 3. Review & Proofread
Have a mentor, teacher, or trusted senior review your materials for grammar and tone before submission.`,
    },
    {
      title: "How to write strong essays",
      module: "Prepare",
      sortOrder: 11,
      status: "published",
      content: `Essays are your voice in the application process.

### 1. Answer the Prompt Directly
Ensure every paragraph directly addresses what the selection committee is asking.

### 2. Show, Don't Just Tell
Use specific anecdotes and concrete examples to demonstrate leadership and problem-solving.

### 3. Hook the Reader Early
Start with a memorable opening sentence that captures attention immediately.`,
    },
    {
      title: "How to prepare for interviews",
      module: "Prepare",
      sortOrder: 12,
      status: "published",
      content: `Interviews are conversations to evaluate your enthusiasm, communication skills, and fit.

### 1. Know Your Application Inside Out
Be ready to elaborate on any experience, essay detail, or project mentioned in your submitted application.

### 2. Practice STAR Technique
Structure answers to situational questions using **Situation, Task, Action, Result**.

### 3. Prepare Questions for the Interviewer
Show genuine interest by asking thoughtful questions about the program structure or community culture.`,
    },
    {
      title: "How to use Guidr effectively",
      module: "Prepare",
      sortOrder: 13,
      status: "published",
      content: `Maximize Guidr to streamline your prep workflow.

### 1. Save Active Opportunities
Click the bookmark icon on opportunity cards to save them to your personal Dashboard.

### 2. Leverage Guidr AI Tutor
Inside any lesson page, ask Guidr Tutor AI questions to clarify application strategies, essay ideas, or program details.

### 3. Track Lesson Completion
Complete lessons sequentially to build confidence step by step.`,
    },
    {
      title: "How to get accepted into summer programs",
      module: "Prepare",
      sortOrder: 14,
      status: "published",
      content: `Summer programs seek intellectual curiosity and academic readiness.

### Key Acceptance Factors
- **Demonstrated Passion**: Show previous self-study or related projects in the program's field.
- **Strong Recommendations**: Request letters from teachers who know your work ethic and character.
- **Early Preparation**: Begin drafting essays 2-3 months prior to international deadlines.`,
    },
    {
      title: "How to win competitions",
      module: "Prepare",
      sortOrder: 15,
      status: "published",
      content: `Winning competitive contests requires methodology and persistence.

### 1. Study Past Winning Entries
Analyze previous winning projects or rubrics in ISEF, Olympiads, or hackathons to understand high standards.

### 2. Seek Mentor Guidance
Connect with university advisors or former winners for technical review.

### 3. Focus on Clear Presentation
Present your solution or research clearly with convincing visuals, data charts, and confident speaking.`,
    },
    {
      title: "How to get scholarships",
      module: "Prepare",
      sortOrder: 16,
      status: "published",
      content: `Scholarships support students who demonstrate high potential and financial need or merit.

### Winning Strategies
- **Fulfill All Criteria**: Ensure every document (financial records, transcripts) is accurate and submitted early.
- **Highlight Community Impact**: Show how you will give back to your community and nation.
- **Apply to Multiple Options**: Spread your opportunities across national and international funding bodies.`,
    },

    // Module 3: Act
    {
      title: "Opportunities After High School",
      module: "Act",
      sortOrder: 17,
      status: "published",
      content: `Planning your post-high-school transition sets up long-term success.

### Key Pathways
- **University Undergraduate Degrees**: Public, private, and international universities in Egypt and overseas.
- **Gap Year Initiatives**: Structured research, fellowship, or service years.
- **Professional Bootcamps**: Specialized technical training in software, data, or design.`,
    },
    {
      title: "How to choose what to apply for",
      module: "Act",
      sortOrder: 18,
      status: "published",
      content: `Avoid application burnout by making deliberate choices.

### 1. Tier Your List
Divide your list into **Reach**, **Target**, and **Safety** opportunities based on selectivity.

### 2. Consider Capacity
Focus on 3-5 high-quality applications at a time rather than rushing through 20 weak submissions.

### 3. Check Alignment
Confirm that every chosen program advances your specific goals.`,
    },
    {
      title: "How to plan",
      module: "Act",
      sortOrder: 19,
      status: "published",
      content: `Turn goals into actionable timelines with a clear schedule.

### Application Roadmap
- **3 Months Out**: Identify programs, request recommendation letters, outline essays.
- **1 Month Out**: Write first essay drafts, gather transcripts.
- **2 Weeks Out**: Finalize essays, proofread all fields.
- **1 Week Out**: Submit early to avoid last-minute portal crashes!`,
    },
    {
      title: "How to track your applications",
      module: "Act",
      sortOrder: 20,
      status: "published",
      content: `Keep control of deadlines and status updates.

### Organization Best Practices
- Use your Guidr Saved dashboard to track active deadlines.
- Maintain a personal tracker spreadsheet with submission dates, portal logins, and result notification dates.`,
    },
    {
      title: "What to do after applying",
      module: "Act",
      sortOrder: 21,
      status: "published",
      content: `Stay proactive while waiting for admissions decisions.

### Proactive Next Steps
- Confirm submission receipt emails.
- Send optional polite updates if you achieve a major new award or project milestone.
- Shift focus to upcoming academic goals and next application deadlines.`,
    },
    {
      title: "What if you get rejected?",
      module: "Act",
      sortOrder: 22,
      status: "published",
      content: `Rejection is a natural step in every ambitious journey.

### Growth Mindset Actions
- **Don't Take it Personally**: Highly competitive programs reject many qualified applicants due to space limits.
- **Request Feedback**: Where possible, ask for constructive advice.
- **Refine & Re-Apply**: Use the application materials you built to apply for other opportunities.`,
    },
    {
      title: "What if you get accepted?",
      module: "Act",
      sortOrder: 23,
      status: "published",
      content: `Congratulations on your acceptance!

### Post-Acceptance Checklist
- Carefully read offer terms, deposit/acceptance deadlines, and financial aid award letters.
- Formally accept your offer before the cutoff date.
- Send thank-you notes to teachers and mentors who wrote recommendation letters for you!`,
    },
  ];

  await db.insert(lessonsTable).values(MODULE_LESSONS as any).onConflictDoNothing();
  console.log(`✅ ${MODULE_LESSONS.length} Lessons across 3 modules (Know, Prepare, Act) seeded successfully.`);

  console.log("🎉 Seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
