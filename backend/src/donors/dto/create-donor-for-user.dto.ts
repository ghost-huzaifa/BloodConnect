import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BloodGroup } from '@prisma/client';

export class CreateDonorForUserDto {
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @IsString()
  city: string;
}
