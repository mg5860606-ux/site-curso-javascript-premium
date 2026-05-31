import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set");
    return;
  }
  const db = drizzle(dbUrl);
  try {
    const allUsers = await db.select().from(users);
    console.log("All users in DB:", JSON.stringify(allUsers, null, 2));
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}

main();
