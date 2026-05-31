import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Semear administrador mg5860606@gmail.com com a senha gasole96
  try {
    const { getDb } = await import("../db");
    const { users } = await import("../../drizzle/schema");
    const { hashPassword } = await import("../auth");
    const { eq } = await import("drizzle-orm");

    const db = await getDb();
    if (db) {
      const email = "mg5860606@gmail.com";
      const password = "gasole96";
      const name = "Admin Corvo Dev";
      const passwordHash = hashPassword(password);

      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        await db.update(users)
          .set({ name, passwordHash, role: "admin", updatedAt: new Date() })
          .where(eq(users.email, email));
        console.log(`[Seed] Administrador ${email} atualizado com sucesso!`);
      } else {
        await db.insert(users).values({
          openId: `admin-${Date.now()}`,
          email,
          name,
          passwordHash,
          role: "admin",
        });
        console.log(`[Seed] Novo administrador ${email} cadastrado com sucesso!`);
      }
    }
  } catch (err) {
    console.error("[Seed] Falha ao semear administrador no boot:", err);
  }
}

startServer().catch(console.error);
