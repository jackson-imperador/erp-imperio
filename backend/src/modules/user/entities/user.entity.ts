import { UserStatus, UserRole } from "@prisma/client";

export class UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: UserStatus;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  static fromPrisma(raw: any): UserEntity {
    const entity = new UserEntity();
    Object.assign(entity, raw);
    return entity;
  }
}

export class UserWithCompanyEntity extends UserEntity {
  activeCompanyId?: string;
  role?: UserRole;
}
