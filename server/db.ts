import { eq, and, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, modules, lessons, studentProgress, Module, Lesson, StudentProgress } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.email = user.email;
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get students: database not available");
    return [];
  }

  return db.select().from(users).where(eq(users.role, "user"));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete user: database not available");
    return;
  }

  await db.delete(users).where(eq(users.id, id));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users).set(data).where(eq(users.id, id));
}

// Módulos
export async function createModule(data: { title: string; description?: string; order?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(modules).values(data);
  return result;
}

export async function getAllModules() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(modules).orderBy(modules.order);
}

export async function getModuleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateModule(id: number, data: Partial<Module>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(modules).set(data).where(eq(modules.id, id));
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(modules).where(eq(modules.id, id));
}

// Aulas
export async function createLesson(data: { moduleId: number; title: string; description?: string; videoUrl: string; order?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(lessons).values(data);
}

export async function getLessonsByModuleId(moduleId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(lessons.order);
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLesson(id: number, data: Partial<Lesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(lessons).where(eq(lessons.id, id));
}

// Progresso do aluno
export async function markLessonAsComplete(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.studentId, studentId), eq(studentProgress.lessonId, lessonId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(studentProgress)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(studentProgress.studentId, studentId), eq(studentProgress.lessonId, lessonId)));
  } else {
    await db.insert(studentProgress).values({
      studentId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    });
  }
}

export async function markLessonAsIncomplete(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(studentProgress)
    .set({ completed: false, completedAt: null })
    .where(and(eq(studentProgress.studentId, studentId), eq(studentProgress.lessonId, lessonId)));
}

export async function getStudentProgress(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(studentProgress)
    .where(and(eq(studentProgress.studentId, studentId), eq(studentProgress.lessonId, lessonId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentProgressByModule(studentId: number, moduleId: number) {
  const db = await getDb();
  if (!db) return [];

  const moduleLessons = await db.select().from(lessons).where(eq(lessons.moduleId, moduleId));
  const lessonIds = moduleLessons.map(l => l.id);

  if (lessonIds.length === 0) return [];

  return db.select().from(studentProgress).where(
    and(
      eq(studentProgress.studentId, studentId),
      inArray(studentProgress.lessonId, lessonIds)
    )
  );
}

export async function getAllStudentProgress(studentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
}
