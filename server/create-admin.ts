import "dotenv/config";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function createAdminUser() {
  try {
    const email = "admin@bloodconnect.com";
    const password = "admin123";
    const name = "System Administrator";

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where((u) => eq(u.email, email));

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [admin] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: "admin",
        isActive: true,
      })
      .returning();

    console.log("✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Please change the password after first login.");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
