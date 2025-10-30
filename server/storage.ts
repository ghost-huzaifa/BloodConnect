// Reference: javascript_database blueprint - adapted for blood donation portal
import {
  donors,
  bloodRequests,
  donations,
  bloodInventory,
  adminUsers,
  type Donor,
  type InsertDonor,
  type BloodRequest,
  type InsertBloodRequest,
  type Donation,
  type InsertDonation,
  type BloodInventory,
  type InsertBloodInventory,
  type AdminUser,
  type InsertAdminUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Donors
  getDonor(id: string): Promise<Donor | undefined>;
  getDonorByEmail(email: string): Promise<Donor | undefined>;
  getAllDonors(): Promise<Donor[]>;
  createDonor(donor: InsertDonor): Promise<Donor>;
  updateDonorApproval(id: string, status: "approved" | "rejected"): Promise<Donor>;
  getMatchingDonors(bloodGroup: string, city?: string): Promise<Donor[]>;

  // Blood Requests
  getBloodRequest(id: string): Promise<BloodRequest | undefined>;
  getAllBloodRequests(): Promise<BloodRequest[]>;
  getActiveBloodRequests(): Promise<BloodRequest[]>;
  createBloodRequest(request: InsertBloodRequest): Promise<BloodRequest>;
  updateRequestApproval(id: string, status: "approved" | "rejected"): Promise<BloodRequest>;
  updateRequestStatus(id: string, status: "pending" | "in_progress" | "completed" | "cancelled"): Promise<BloodRequest>;

  // Donations
  getDonation(id: string): Promise<Donation | undefined>;
  getAllDonations(): Promise<any[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  updateDonorLastDonation(donorId: string, donationDate: Date): Promise<void>;

  // Blood Inventory
  getBloodInventory(): Promise<BloodInventory[]>;
  getBloodInventoryByGroup(bloodGroup: string): Promise<BloodInventory | undefined>;
  updateBloodInventory(bloodGroup: string, data: Partial<InsertBloodInventory>): Promise<BloodInventory>;
  initializeBloodInventory(): Promise<void>;

  // Admin Stats
  getAdminStats(): Promise<{
    totalDonors: number;
    approvedDonors: number;
    pendingDonors: number;
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    totalDonations: number;
    todayDonations: number;
  }>;
  getPublicStats(): Promise<{
    totalDonors: number;
    totalDonations: number;
    activeRequests: number;
    completedRequests: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Donors
  async getDonor(id: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.id, id));
    return donor || undefined;
  }

  async getDonorByEmail(email: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.email, email));
    return donor || undefined;
  }

  async getAllDonors(): Promise<Donor[]> {
    return await db.select().from(donors).orderBy(desc(donors.createdAt));
  }

  async createDonor(insertDonor: InsertDonor): Promise<Donor> {
    const [donor] = await db.insert(donors).values(insertDonor).returning();
    return donor;
  }

  async updateDonorApproval(id: string, status: "approved" | "rejected"): Promise<Donor> {
    const [donor] = await db
      .update(donors)
      .set({ approvalStatus: status, updatedAt: new Date() })
      .where(eq(donors.id, id))
      .returning();
    return donor;
  }

  async getMatchingDonors(bloodGroup: string, city?: string): Promise<Donor[]> {
    let query = db.select().from(donors).where(
      and(
        eq(donors.bloodGroup, bloodGroup as any),
        eq(donors.approvalStatus, "approved")
      )
    );

    const results = await query;
    
    // Filter by city if provided (case insensitive)
    if (city) {
      return results.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }
    
    return results;
  }

  // Blood Requests
  async getBloodRequest(id: string): Promise<BloodRequest | undefined> {
    const [request] = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id));
    return request || undefined;
  }

  async getAllBloodRequests(): Promise<BloodRequest[]> {
    return await db.select().from(bloodRequests).orderBy(desc(bloodRequests.createdAt));
  }

  async getActiveBloodRequests(): Promise<BloodRequest[]> {
    return await db
      .select()
      .from(bloodRequests)
      .where(
        and(
          eq(bloodRequests.approvalStatus, "approved"),
          eq(bloodRequests.status, "pending")
        )
      )
      .orderBy(desc(bloodRequests.createdAt))
      .limit(10);
  }

  async createBloodRequest(insertRequest: InsertBloodRequest): Promise<BloodRequest> {
    const [request] = await db.insert(bloodRequests).values(insertRequest).returning();
    return request;
  }

  async updateRequestApproval(id: string, status: "approved" | "rejected"): Promise<BloodRequest> {
    const [request] = await db
      .update(bloodRequests)
      .set({ approvalStatus: status, updatedAt: new Date() })
      .where(eq(bloodRequests.id, id))
      .returning();
    return request;
  }

  async updateRequestStatus(
    id: string,
    status: "pending" | "in_progress" | "completed" | "cancelled"
  ): Promise<BloodRequest> {
    const [request] = await db
      .update(bloodRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(bloodRequests.id, id))
      .returning();
    return request;
  }

  // Donations
  async getDonation(id: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation || undefined;
  }

  async getAllDonations(): Promise<any[]> {
    const results = await db
      .select({
        donation: donations,
        donor: donors,
        request: bloodRequests,
      })
      .from(donations)
      .leftJoin(donors, eq(donations.donorId, donors.id))
      .leftJoin(bloodRequests, eq(donations.requestId, bloodRequests.id))
      .orderBy(desc(donations.donationDate));

    return results.map((r) => ({
      ...r.donation,
      donor: r.donor,
      request: r.request,
    }));
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const [donation] = await db.insert(donations).values(insertDonation).returning();
    
    // Update donor's last donation date
    await this.updateDonorLastDonation(insertDonation.donorId, insertDonation.donationDate || new Date());
    
    return donation;
  }

  async updateDonorLastDonation(donorId: string, donationDate: Date): Promise<void> {
    await db
      .update(donors)
      .set({ lastDonationDate: donationDate, updatedAt: new Date() })
      .where(eq(donors.id, donorId));
  }

  // Blood Inventory
  async getBloodInventory(): Promise<BloodInventory[]> {
    return await db.select().from(bloodInventory);
  }

  async getBloodInventoryByGroup(bloodGroup: string): Promise<BloodInventory | undefined> {
    const [inventory] = await db
      .select()
      .from(bloodInventory)
      .where(eq(bloodInventory.bloodGroup, bloodGroup as any));
    return inventory || undefined;
  }

  async updateBloodInventory(
    bloodGroup: string,
    data: Partial<InsertBloodInventory>
  ): Promise<BloodInventory> {
    const existing = await this.getBloodInventoryByGroup(bloodGroup);
    
    if (existing) {
      const [updated] = await db
        .update(bloodInventory)
        .set({ ...data, lastUpdated: new Date() })
        .where(eq(bloodInventory.bloodGroup, bloodGroup as any))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(bloodInventory)
        .values({ bloodGroup: bloodGroup as any, ...data })
        .returning();
      return created;
    }
  }

  async initializeBloodInventory(): Promise<void> {
    const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    
    for (const group of bloodGroups) {
      const exists = await this.getBloodInventoryByGroup(group);
      if (!exists) {
        await db.insert(bloodInventory).values({
          bloodGroup: group as any,
          unitsAvailable: 0,
          status: "urgent",
        });
      }
    }
  }

  // Admin Stats
  async getAdminStats() {
    const totalDonors = await db.select({ count: sql<number>`count(*)::int` }).from(donors);
    const approvedDonors = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(donors)
      .where(eq(donors.approvalStatus, "approved"));
    const pendingDonors = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(donors)
      .where(eq(donors.approvalStatus, "pending"));
    
    const totalRequests = await db.select({ count: sql<number>`count(*)::int` }).from(bloodRequests);
    const activeRequests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequests)
      .where(
        and(
          eq(bloodRequests.approvalStatus, "approved"),
          eq(bloodRequests.status, "pending")
        )
      );
    const completedRequests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequests)
      .where(eq(bloodRequests.status, "completed"));
    
    const totalDonations = await db.select({ count: sql<number>`count(*)::int` }).from(donations);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDonations = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(donations)
      .where(gte(donations.donationDate, today));

    return {
      totalDonors: totalDonors[0]?.count || 0,
      approvedDonors: approvedDonors[0]?.count || 0,
      pendingDonors: pendingDonors[0]?.count || 0,
      totalRequests: totalRequests[0]?.count || 0,
      activeRequests: activeRequests[0]?.count || 0,
      completedRequests: completedRequests[0]?.count || 0,
      totalDonations: totalDonations[0]?.count || 0,
      todayDonations: todayDonations[0]?.count || 0,
    };
  }

  async getPublicStats() {
    const approvedDonors = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(donors)
      .where(eq(donors.approvalStatus, "approved"));
    
    const activeRequests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequests)
      .where(
        and(
          eq(bloodRequests.approvalStatus, "approved"),
          eq(bloodRequests.status, "pending")
        )
      );
    
    const completedRequests = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bloodRequests)
      .where(eq(bloodRequests.status, "completed"));
    
    const totalDonations = await db.select({ count: sql<number>`count(*)::int` }).from(donations);

    return {
      totalDonors: approvedDonors[0]?.count || 0,
      totalDonations: totalDonations[0]?.count || 0,
      activeRequests: activeRequests[0]?.count || 0,
      completedRequests: completedRequests[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
