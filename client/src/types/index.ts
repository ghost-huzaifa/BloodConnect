// Types and enums matching the Prisma schema

export enum BloodGroup {
    A_POS = 'A_POS',
    A_NEG = 'A_NEG',
    B_POS = 'B_POS',
    B_NEG = 'B_NEG',
    AB_POS = 'AB_POS',
    AB_NEG = 'AB_NEG',
    O_POS = 'O_POS',
    O_NEG = 'O_NEG',
}

export enum UrgencyLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    ASSIGNED = 'ASSIGNED',
    REJECTED = 'REJECTED',
    FULFILLED = 'FULFILLED',
}

export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum ContactMethod {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
    WHATSAPP = 'WHATSAPP',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    NORMAL_USER = 'NORMAL_USER',
}

// Type definitions matching backend responses

export interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    bloodGroup: BloodGroup;
    isActive: boolean;
}

export interface Donor {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    bloodGroup: BloodGroup;
    city: string;
    batch: string | null;
    lastDonationDate: string | null;
    approvalStatus: ApprovalStatus;
    whatsappNumber: string | null;
    isAvailableForDonation: boolean;
    totalDonations: number;
    createdAt: string;
    updatedAt: string;
}

export interface BloodRequest {
    id: string;
    patientName: string;
    bloodGroup: BloodGroup;
    unitsNeeded: number;
    urgencyLevel: UrgencyLevel;
    location: string;
    hospitalName: string;
    contactPerson: string;
    contactPhone: string;
    contactWhatsapp: string | null;
    status: RequestStatus;
    approvalStatus: ApprovalStatus;
    remarks: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Donation {
    id: string;
    donorId: string;
    requestId: string;
    donationDate: string;
    unitsContributed: number;
    remarks: string | null;
    createdAt: string;
    donor: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        bloodGroup: BloodGroup;
        city: string;
    } | null;
    request: {
        id: string;
        patientName: string;
        bloodGroup: BloodGroup;
        hospitalName: string;
        location: string;
    } | null;
}

export interface BloodInventory {
    id: string;
    bloodGroup: BloodGroup;
    unitsAvailable: number;
    status: 'available' | 'low' | 'urgent';
    lastUpdated: string;
}

export interface AdminStats {
    totalDonors: number;
    approvedDonors: number;
    pendingDonors: number;
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
    totalDonations: number;
    todayDonations: number;
}

export interface PublicStats {
    totalDonors: number;
    totalDonations: number;
    activeRequests: number;
    completedRequests: number;
}

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface LoginResponse {
    user: AuthUser;
    token: string;
}

export interface RegisterResponse {
    user: AuthUser;
    token: string;
}
