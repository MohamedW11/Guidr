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
  ] as any).onConflictDoNothing();
  console.log("✅ 3 Requested Guidr Tutor lessons seeded.");

  console.log("🎉 Seeding completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
