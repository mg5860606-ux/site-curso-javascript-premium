import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { authenticateUser, createUser, hashPassword } from "./auth";
import * as db from "./db";
import { sdk } from "./_core/sdk";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await authenticateUser(input.email, input.password);
        
        if (!user) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }

        // Criar sessão com JWT usando o mecanismo existente
        const sessionToken = await sdk.createSessionToken(user.email || user.id.toString(), {
          name: user.name || '',
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    changePassword: protectedProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Utilizador não encontrado' });
        }

        const currentUser = await authenticateUser(user.email || '', input.currentPassword);
        if (!currentUser) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Senha atual incorreta' });
        }

        const newPasswordHash = hashPassword(input.newPassword);
        await db.updateUser(ctx.user.id, { passwordHash: newPasswordHash });

        return { success: true };
      }),
  }),

  // Admin: Gestão de alunos
  students: router({
    list: adminProcedure.query(async () => {
      return db.getAllStudents();
    }),

    create: adminProcedure
      .input(z.object({ email: z.string().email(), name: z.string() }))
      .mutation(async ({ input }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' });
        }

        const result = await createUser(input.email, input.name, 'user');
        return result;
      }),

    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), email: z.string().email().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true };
      }),

    changePassword: adminProcedure
      .input(z.object({ studentId: z.number(), newPassword: z.string() }))
      .mutation(async ({ input }) => {
        const passwordHash = hashPassword(input.newPassword);
        await db.updateUser(input.studentId, { passwordHash });
        return { success: true };
      }),
  }),

  // Admin: Gestão de módulos
  modules: router({
    list: publicProcedure.query(async () => {
      return db.getAllModules();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getModuleById(input.id);
      }),

    create: adminProcedure
      .input(z.object({ title: z.string(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        const modules = await db.getAllModules();
        const order = modules.length;
        await db.createModule({ ...input, order });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateModule(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteModule(input.id);
        return { success: true };
      }),

    reorder: adminProcedure
      .input(z.object({ moduleIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        for (let i = 0; i < input.moduleIds.length; i++) {
          await db.updateModule(input.moduleIds[i], { order: i });
        }
        return { success: true };
      }),
  }),

  // Admin: Gestão de aulas
  lessons: router({
    listByModule: publicProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input }) => {
        return db.getLessonsByModuleId(input.moduleId);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLessonById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        moduleId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        videoUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        const lessons = await db.getLessonsByModuleId(input.moduleId);
        const order = lessons.length;
        await db.createLesson({ ...input, order });
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().url().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateLesson(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLesson(input.id);
        return { success: true };
      }),

    reorder: adminProcedure
      .input(z.object({ moduleId: z.number(), lessonIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        for (let i = 0; i < input.lessonIds.length; i++) {
          await db.updateLesson(input.lessonIds[i], { order: i });
        }
        return { success: true };
      }),
  }),

  // Progresso do aluno
  progress: router({
    markComplete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        await db.markLessonAsComplete(ctx.user.id, input.lessonId);
        return { success: true };
      }),

    markIncomplete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        await db.markLessonAsIncomplete(ctx.user.id, input.lessonId);
        return { success: true };
      }),

    getStudentProgress: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return db.getAllStudentProgress(ctx.user.id);
    }),

    getModuleProgress: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
        const lessons = await db.getLessonsByModuleId(input.moduleId);
        const progress = await db.getAllStudentProgress(ctx.user.id);
        
        const completedCount = progress.filter(p => 
          lessons.some(l => l.id === p.lessonId && p.completed)
        ).length;

        return {
          total: lessons.length,
          completed: completedCount,
          percentage: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0,
        };
      }),

    getCourseProgress: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      
      const modules = await db.getAllModules();
      const progress = await db.getAllStudentProgress(ctx.user.id);
      
      let totalLessons = 0;
      let completedLessons = 0;

      for (const module of modules) {
        const lessons = await db.getLessonsByModuleId(module.id);
        totalLessons += lessons.length;
        completedLessons += progress.filter(p =>
          lessons.some(l => l.id === p.lessonId && p.completed)
        ).length;
      }

      return {
        total: totalLessons,
        completed: completedLessons,
        percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
