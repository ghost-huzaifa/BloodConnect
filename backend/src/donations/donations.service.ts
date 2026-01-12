import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto';

@Injectable()
export class DonationsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const donations = await this.prisma.donation.findMany({
            include: {
                donor: {
                    include: {
                        user: true,
                        city: true,
                    },
                },
                request: {
                    include: { city: true },
                },
            },
            orderBy: { donationDate: 'desc' },
        });

        return donations.map((donation) => this.transformDonation(donation));
    }

    async create(createDto: CreateDonationDto) {
        const donationDate = createDto.donationDate
            ? new Date(createDto.donationDate)
            : new Date();

        // Create donation and update donor stats in a transaction
        const donation = await this.prisma.$transaction(async (tx) => {
            const newDonation = await tx.donation.create({
                data: {
                    donorId: createDto.donorId,
                    requestId: createDto.requestId,
                    donationDate,
                    quantity: createDto.unitsContributed || 1,
                    remarks: createDto.remarks,
                },
                include: {
                    donor: {
                        include: {
                            user: true,
                            city: true,
                        },
                    },
                    request: {
                        include: { city: true },
                    },
                },
            });

            // Update donor's last donation date and increment total donations
            await tx.donor.update({
                where: { donorId: createDto.donorId },
                data: {
                    lastDonated: donationDate,
                    totalDonations: { increment: 1 },
                },
            });

            return newDonation;
        });

        return this.transformDonation(donation);
    }

    // Transform to match frontend expected format
    private transformDonation(donation: any) {
        const donor = donation.donor;
        const request = donation.request;

        return {
            id: donation.donationId,
            donorId: donation.donorId,
            requestId: donation.requestId,
            donationDate: donation.donationDate,
            unitsContributed: donation.quantity,
            remarks: donation.remarks,
            createdAt: donation.createdAt,
            // Include nested donor info
            donor: donor
                ? {
                    id: donor.donorId,
                    name: `${donor.user.firstName} ${donor.user.lastName}`.trim(),
                    email: donor.user.email,
                    phone: donor.user.phoneNo,
                    bloodGroup: donor.bloodGroup,
                    city: donor.city?.name || '',
                }
                : null,
            // Include nested request info
            request: request
                ? {
                    id: request.requestId,
                    patientName: request.patientName,
                    bloodGroup: request.bloodGroup,
                    hospitalName: request.hospitalName,
                    location: request.city?.name || request.address,
                }
                : null,
        };
    }
}
