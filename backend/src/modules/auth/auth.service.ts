import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../user/user.service";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RequestUser } from "../../common/interfaces/request-user.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<RequestUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        companies: {
          include: { company: { select: { id: true, status: true } } },
        },
      },
    });

    if (!user || !user.passwordHash) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException(
        "Account is not active. Please verify your email.",
      );
    }

    const defaultCompany =
      user.companies.find((uc) => uc.isDefault) || user.companies[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      activeCompanyId: defaultCompany?.companyId || null,
      role: defaultCompany?.role || null,
      companies: user.companies.map((uc) => ({
        companyId: uc.companyId,
        role: uc.role,
      })),
    };
  }

  async login(user: RequestUser, deviceInfo?: string, ipAddress?: string) {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.activeCompanyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    const refreshExpiresIn = this.configService.get<string>(
      "jwt.refreshExpiresIn",
      "7d",
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceInfo,
        ipAddress,
        expiresAt,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        activeCompanyId: user.activeCompanyId,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const rounds = this.configService.get<number>("app.bcryptRounds", 12);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: "ACTIVE", // In production: PENDING_VERIFICATION with email flow
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            companies: true,
          },
        },
      },
    });

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }

    // Revoke used token (token rotation)
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const defaultCompany =
      tokenRecord.user.companies.find((uc) => uc.isDefault) ||
      tokenRecord.user.companies[0];

    const requestUser: RequestUser = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      firstName: tokenRecord.user.firstName,
      lastName: tokenRecord.user.lastName,
      activeCompanyId: defaultCompany?.companyId || null,
      role: defaultCompany?.role || null,
      companies: tokenRecord.user.companies.map((uc) => ({
        companyId: uc.companyId,
        role: uc.role,
      })),
    };

    return this.login(
      requestUser,
      tokenRecord.deviceInfo,
      tokenRecord.ipAddress,
    );
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all refresh tokens (logout from all devices)
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }
}
