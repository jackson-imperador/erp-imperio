import { User, UserCompany } from "@prisma/client";

export interface IUserRepository {
  findAll(params: {
    companyId: string;
    search?: string;
    skip: number;
    take: number;
  }): Promise<{ data: any[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  createUser(data: Partial<User>): Promise<User>;
  findCompanyMembers(
    companyId: string,
    params: any,
  ): Promise<{ data: any[]; total: number }>;
  updateProfile(id: string, data: Partial<User>): Promise<User>;
  changePassword(id: string, passwordHash: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  addToCompany(
    userId: string,
    companyId: string,
    role: string,
  ): Promise<UserCompany>;
  updateCompanyRole(
    userId: string,
    companyId: string,
    role: string,
  ): Promise<UserCompany>;
  removeFromCompany(userId: string, companyId: string): Promise<void>;
}
