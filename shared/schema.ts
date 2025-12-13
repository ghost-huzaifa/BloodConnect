import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  pgEnum,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const bloodGroupEnum = pgEnum("blood_group", [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
]);
export const urgencyLevelEnum = pgEnum("urgency_level", [
  "normal",
  "urgent",
  "emergency",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const userRoleEnum = pgEnum("user_role", ["admin", "donor", "hospital"]);

// Donors table
export const donors = pgTable("donors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  city: text("city").notNull(),
  batch: text("batch"),
  lastDonationDate: timestamp("last_donation_date"),
  approvalStatus: approvalStatusEnum("approval_status")
    .notNull()
    .default("pending"),
  whatsappNumber: text("whatsapp_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blood requests table
export const bloodRequests = pgTable("blood_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientName: text("patient_name").notNull(),
  bloodGroup: bloodGroupEnum("blood_group").notNull(),
  unitsNeeded: integer("units_needed").notNull().default(1),
  urgencyLevel: urgencyLevelEnum("urgency_level").notNull().default("normal"),
  location: text("location").notNull(),
  hospitalName: text("hospital_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactWhatsapp: text("contact_whatsapp"),
  status: requestStatusEnum("status").notNull().default("pending"),
  approvalStatus: approvalStatusEnum("approval_status")
    .notNull()
    .default("pending"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Donations table (case closure log)
export const donations = pgTable("donations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id")
    .notNull()
    .references(() => donors.id),
  requestId: varchar("request_id")
    .notNull()
    .references(() => bloodRequests.id),
  donationDate: timestamp("donation_date").notNull().defaultNow(),
  unitsContributed: integer("units_contributed").notNull().default(1),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Blood inventory (for tracking availability)
export const bloodInventory = pgTable("blood_inventory", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  bloodGroup: bloodGroupEnum("blood_group").notNull().unique(),
  unitsAvailable: integer("units_available").notNull().default(0),
  status: text("status").notNull().default("available"), // available, low, urgent
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Users table (for authentication)
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("donor"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Admin users table (deprecated - keeping for backwards compatibility)
export const adminUsers = pgTable("admin_users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const donorsRelations = relations(donors, ({ many }) => ({
  donations: many(donations),
}));

export const bloodRequestsRelations = relations(bloodRequests, ({ many }) => ({
  donations: many(donations),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(donors, {
    fields: [donations.donorId],
    references: [donors.id],
  }),
  request: one(bloodRequests, {
    fields: [donations.requestId],
    references: [bloodRequests.id],
  }),
}));

// Zod Schemas for validation
export const insertDonorSchema = createInsertSchema(donors)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    whatsappNumber: z.string().optional(),
    lastDonationDate: z
      .preprocess((val) => {
        if (val === null || val === undefined || val === "") return undefined;
        if (typeof val === "string") return new Date(val);
        return val;
      }, z.date().optional()),
  });

export const insertBloodRequestSchema = createInsertSchema(bloodRequests)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    contactPhone: z.string().min(10, "Please enter a valid phone number"),
    contactWhatsapp: z.string().optional(),
    unitsNeeded: z.number().min(1, "At least 1 unit is required"),
  });

export const insertDonationSchema = createInsertSchema(donations)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    unitsContributed: z.number().min(1, "At least 1 unit is required"),
  });

export const insertBloodInventorySchema = createInsertSchema(
  bloodInventory
).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

// TypeScript types
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;

export type BloodRequest = typeof bloodRequests.$inferSelect;
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type BloodInventory = typeof bloodInventory.$inferSelect;
export type InsertBloodInventory = z.infer<typeof insertBloodInventorySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Helper types for frontend
export type DonorWithEligibility = Donor & {
  daysSinceLastDonation: number | null;
  isEligible: boolean;
};

export type BloodRequestWithDonations = BloodRequest & {
  donations: Donation[];
  matchingDonorsCount: number;
};

export type DonationWithDetails = Donation & {
  donor: Donor;
  request: BloodRequest;
};
