import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, studentProfilesTable, adminProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "student" | "admin";
  studentProfile?: typeof studentProfilesTable.$inferSelect;
  adminProfile?: typeof adminProfilesTable.$inferSelect;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function getUserFromSession(req: Request): Promise<AuthenticatedUser | null> {
  const userId = req.cookies?.guidr_user_id || req.headers["x-guidr-user-id"];
  if (!userId || typeof userId !== "string") {
    return null;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return null;

  let studentProfile;
  let adminProfile;

  if (user.role === "student") {
    const [sp] = await db
      .select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, user.id))
      .limit(1);
    studentProfile = sp;
  } else if (user.role === "admin") {
    const [ap] = await db
      .select()
      .from(adminProfilesTable)
      .where(eq(adminProfilesTable.userId, user.id))
      .limit(1);
    adminProfile = ap;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    studentProfile,
    adminProfile,
  };
}

export async function attachUserMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromSession(req);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore error in optional session attach
  }
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    const user = await getUserFromSession(req);
    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    req.user = user;
  }
  next();
}

export function requireRole(role: "student" | "admin") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const user = await getUserFromSession(req);
      if (!user) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }
      req.user = user;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: `Access denied. Requires ${role} role.` });
      return;
    }

    next();
  };
}
