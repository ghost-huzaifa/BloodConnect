import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Extract from cookie first
                (request: Request) => {
                    return request?.cookies?.token;
                },
                // Fallback to Authorization header
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey:
                configService.get<string>('JWT_SECRET') ||
                'your-secret-key-change-in-production',
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { userId: payload.userId },
            include: {
                donor: {
                    include: {
                        city: true,
                    },
                },
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException();
        }

        return {
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            bloodGroup: user.donor?.bloodGroup,
            donor: user.donor,
        };
    }
}
