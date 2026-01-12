import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    ConflictException,
    UseGuards,
    Req,
} from '@nestjs/common';
import { DonorsService } from './donors.service';
import { CreateDonorDto, UpdateApprovalDto, CreateDonorForUserDto } from './dto';
import { BloodRequestsService } from '../blood-requests/blood-requests.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Controller('donors')
export class DonorsController {
    constructor(
        private donorsService: DonorsService,
        private bloodRequestsService: BloodRequestsService,
    ) { }

    @Get()
    async findAll() {
        return this.donorsService.findAll();
    }

    @Get('matching/:requestId')
    async findMatching(@Param('requestId') requestId: string) {
        const request = await this.bloodRequestsService.findById(requestId);
        return this.donorsService.findMatching(
            request.bloodGroup,
            request.city?.name,
        );
    }

    @Post()
    async create(@Body() createDonorDto: CreateDonorDto) {
        // Check if email already exists
        const existing = await this.donorsService.findByEmail(createDonorDto.email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        return this.donorsService.create(createDonorDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me')
    async createForCurrentUser(
        @Body() dto: CreateDonorForUserDto,
        @Req() req: Request,
    ) {
        const user = req.user as { userId: string } | undefined;
        if (!user?.userId) {
            throw new ConflictException('User information not found in request');
        }

        return this.donorsService.createForUser(user.userId, dto);
    }

    @Patch(':id/approval')
    async updateApproval(
        @Param('id') id: string,
        @Body() updateApprovalDto: UpdateApprovalDto,
    ) {
        return this.donorsService.updateApproval(id, updateApprovalDto);
    }
}
