import 'dotenv/config';
import { PrismaClient, BloodGroup, UrgencyLevel, RequestStatus, ApprovalStatus, UserRole, ContactMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting database seed...');

    // Create States
    console.log('Creating states...');
    const punjab = await prisma.state.upsert({
        where: { name: 'Punjab' },
        update: {},
        create: { name: 'Punjab' },
    });

    const sindh = await prisma.state.upsert({
        where: { name: 'Sindh' },
        update: {},
        create: { name: 'Sindh' },
    });

    const kpk = await prisma.state.upsert({
        where: { name: 'KPK' },
        update: {},
        create: { name: 'KPK' },
    });

    // Create Cities
    console.log('Creating cities...');
    const islamabad = await prisma.city.upsert({
        where: { name: 'Islamabad' },
        update: {},
        create: { name: 'Islamabad', stateId: punjab.stateId },
    });

    const lahore = await prisma.city.upsert({
        where: { name: 'Lahore' },
        update: {},
        create: { name: 'Lahore', stateId: punjab.stateId },
    });

    const karachi = await prisma.city.upsert({
        where: { name: 'Karachi' },
        update: {},
        create: { name: 'Karachi', stateId: sindh.stateId },
    });

    const peshawar = await prisma.city.upsert({
        where: { name: 'Peshawar' },
        update: {},
        create: { name: 'Peshawar', stateId: kpk.stateId },
    });

    // Create Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@bloodconnect.pk' },
        update: {},
        create: {
            email: 'admin@bloodconnect.pk',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            phoneNo: '+923001234567',
            role: UserRole.ADMIN,
            isActive: true,
        },
    });
    console.log(`  ✓ Admin user created: ${adminUser.email}`);

    // Create Sample Donors
    console.log('Creating sample donors...');
    const donorPassword = await bcrypt.hash('donor123', SALT_ROUNDS);

    const sampleDonors = [
        {
            email: 'ahmed.khan@example.com',
            firstName: 'Ahmed',
            lastName: 'Khan',
            phoneNo: '+923011111111',
            bloodGroup: BloodGroup.A_POS,
            cityId: islamabad.cityId,
            whatsappNumber: '+923011111111',
            approvalStatus: ApprovalStatus.APPROVED,
        },
        {
            email: 'fatima.ali@example.com',
            firstName: 'Fatima',
            lastName: 'Ali',
            phoneNo: '+923022222222',
            bloodGroup: BloodGroup.B_NEG,
            cityId: lahore.cityId,
            whatsappNumber: '+923022222222',
            approvalStatus: ApprovalStatus.APPROVED,
        },
        {
            email: 'usman.malik@example.com',
            firstName: 'Usman',
            lastName: 'Malik',
            phoneNo: '+923033333333',
            bloodGroup: BloodGroup.O_NEG,
            cityId: karachi.cityId,
            whatsappNumber: '+923033333333',
            approvalStatus: ApprovalStatus.APPROVED,
        },
        {
            email: 'sara.ahmed@example.com',
            firstName: 'Sara',
            lastName: 'Ahmed',
            phoneNo: '+923044444444',
            bloodGroup: BloodGroup.AB_POS,
            cityId: peshawar.cityId,
            whatsappNumber: null,
            approvalStatus: ApprovalStatus.PENDING,
        },
        {
            email: 'bilal.hassan@example.com',
            firstName: 'Bilal',
            lastName: 'Hassan',
            phoneNo: '+923055555555',
            bloodGroup: BloodGroup.A_NEG,
            cityId: islamabad.cityId,
            whatsappNumber: '+923055555555',
            approvalStatus: ApprovalStatus.APPROVED,
        },
    ];

    for (const donorData of sampleDonors) {
        const existingUser = await prisma.user.findUnique({
            where: { email: donorData.email },
        });

        if (!existingUser) {
            const user = await prisma.user.create({
                data: {
                    email: donorData.email,
                    password: donorPassword,
                    firstName: donorData.firstName,
                    lastName: donorData.lastName,
                    phoneNo: donorData.phoneNo,
                    role: UserRole.NORMAL_USER,
                    isActive: true,
                },
            });

            await prisma.donor.create({
                data: {
                    userId: user.userId,
                    whatsappNumber: donorData.whatsappNumber,
                    approvalStatus: donorData.approvalStatus,
                    bloodGroup: donorData.bloodGroup,
                    preferredContact: ContactMethod.WHATSAPP,
                    cityId: donorData.cityId,
                    isAvailableForDonation: true,
                    totalDonations: Math.floor(Math.random() * 5),
                },
            });

            console.log(`  ✓ Donor created: ${donorData.firstName} ${donorData.lastName}`);
        }
    }

    // Create Sample Blood Requests
    console.log('Creating sample blood requests...');
    const sampleRequests = [
        {
            patientName: 'Muhammad Ali',
            bloodGroup: BloodGroup.A_POS,
            quantity: 2,
            address: 'PIMS Hospital, Islamabad',
            hospitalName: 'PIMS Hospital',
            contactPerson: 'Dr. Hassan',
            contactNo: '+923111111111',
            contactWhatsapp: '+923111111111',
            urgencyLevel: UrgencyLevel.HIGH,
            status: RequestStatus.PENDING,
            approvalStatus: ApprovalStatus.APPROVED,
            cityId: islamabad.cityId,
        },
        {
            patientName: 'Ayesha Bibi',
            bloodGroup: BloodGroup.O_NEG,
            quantity: 3,
            address: 'Jinnah Hospital, Lahore',
            hospitalName: 'Jinnah Hospital',
            contactPerson: 'Nurse Fatima',
            contactNo: '+923222222222',
            contactWhatsapp: null,
            urgencyLevel: UrgencyLevel.CRITICAL,
            status: RequestStatus.PENDING,
            approvalStatus: ApprovalStatus.APPROVED,
            cityId: lahore.cityId,
        },
        {
            patientName: 'Zainab Khan',
            bloodGroup: BloodGroup.B_POS,
            quantity: 1,
            address: 'Aga Khan Hospital, Karachi',
            hospitalName: 'Aga Khan Hospital',
            contactPerson: 'Mr. Ahmed',
            contactNo: '+923333333333',
            contactWhatsapp: '+923333333333',
            urgencyLevel: UrgencyLevel.MEDIUM,
            status: RequestStatus.PENDING,
            approvalStatus: ApprovalStatus.PENDING,
            cityId: karachi.cityId,
        },
    ];

    for (const requestData of sampleRequests) {
        const existingRequest = await prisma.request.findFirst({
            where: { patientName: requestData.patientName },
        });

        if (!existingRequest) {
            await prisma.request.create({
                data: {
                    ...requestData,
                    userId: adminUser.userId, // Admin creates requests
                },
            });
            console.log(`  ✓ Request created for: ${requestData.patientName}`);
        }
    }

    // Initialize Blood Inventory
    console.log('Initializing blood inventory...');
    const bloodGroups = Object.values(BloodGroup);
    const inventoryData = [
        { bloodGroup: BloodGroup.A_POS, unitsAvailable: 15, status: 'available' },
        { bloodGroup: BloodGroup.A_NEG, unitsAvailable: 5, status: 'low' },
        { bloodGroup: BloodGroup.B_POS, unitsAvailable: 12, status: 'available' },
        { bloodGroup: BloodGroup.B_NEG, unitsAvailable: 3, status: 'urgent' },
        { bloodGroup: BloodGroup.AB_POS, unitsAvailable: 8, status: 'low' },
        { bloodGroup: BloodGroup.AB_NEG, unitsAvailable: 2, status: 'urgent' },
        { bloodGroup: BloodGroup.O_POS, unitsAvailable: 20, status: 'available' },
        { bloodGroup: BloodGroup.O_NEG, unitsAvailable: 4, status: 'low' },
    ];

    for (const inv of inventoryData) {
        await prisma.bloodInventory.upsert({
            where: { bloodGroup: inv.bloodGroup },
            update: { unitsAvailable: inv.unitsAvailable, status: inv.status },
            create: inv,
        });
    }
    console.log(`  ✓ Blood inventory initialized for ${bloodGroups.length} blood groups`);

    console.log('\n✅ Database seeding completed!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin: admin@bloodconnect.pk / admin123');
    console.log('  Donor: ahmed.khan@example.com / donor123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
