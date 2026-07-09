import { UserRole } from "@prisma/client";

export interface RequestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  activeCompanyId: string;
  role: UserRole;
  companies: { companyId: string; role: UserRole }[];
}
