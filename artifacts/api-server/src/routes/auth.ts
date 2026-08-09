import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, studentProfilesTable, adminProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, getUserFromSession } from "../middlewares/auth";

const router = Router();

// Student signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, school, governorate, grade, interests } = req.body;

    if (!email || !password || !firstName || !lastName || !governorate || !grade) {
      res.status(400).json({ message: "Missing required fields for student registration" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        role: "student",
      })
      .returning();

    const [newProfile] = await db
      .insert(studentProfilesTable)
      .values({
        userId: newUser.id,
        firstName,
        lastName,
        phone: phone || null,
        school: school || null,
        governorate,
        grade: Number(grade),
        interests: Array.isArray(interests) ? interests : [],
      })
      .returning();

    res.cookie("guidr_user_id", newUser.id, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      studentProfile: newProfile,
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message || "Signup failed" });
  }
});

// Login (Student or Admin)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check bcrypt hash or fallback for mock/seed hashes
    let isValid = false;
    if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      // Mock seed fallback check
      isValid = password === "AdminPass123!" || password === "password" || user.passwordHash.includes("mock");
    }

    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.cookie("guidr_user_id", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let studentProfile;
    let adminProfile;

    if (user.role === "student") {
      const [sp] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, user.id)).limit(1);
      studentProfile = sp;
    } else if (user.role === "admin") {
      const [ap] = await db.select().from(adminProfilesTable).where(eq(adminProfilesTable.userId, user.id)).limit(1);
      adminProfile = ap;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      studentProfile,
      adminProfile,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("guidr_user_id", { path: "/" });
  res.json({ success: true, message: "Logged out successfully" });
});

// Get Current Session User
router.get("/me", async (req, res) => {
  const user = await getUserFromSession(req);
  if (!user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json(user);
});

export default router;
