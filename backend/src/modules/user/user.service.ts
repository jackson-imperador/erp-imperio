import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UserRepository } from "./user.repository";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const updated = await this.userRepository.updateProfile(userId, dto);

    this.eventEmitter.emit("entity.updated", {
      entityName: "User",
      entityId: userId,
      userId,
      previousData: { firstName: user.firstName, lastName: user.lastName },
      newData: dto,
    });

    const { passwordHash, ...safeUser } = updated as any;
    return safeUser;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    console.log(`[changePassword debug] userId: ${userId}`);
    console.log(`[changePassword debug] dto: ${JSON.stringify(dto)}`);
    console.log(`[changePassword debug] db hash: ${user.passwordHash}`);

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    console.log(`[changePassword debug] isMatch: ${isMatch}`);

    if (!isMatch) throw new BadRequestException("Invalid current password");

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepository.changePassword(userId, newHash);

    this.eventEmitter.emit("entity.updated", {
      entityName: "UserPassword",
      entityId: userId,
      userId,
      newData: { passwordChanged: true },
    });

    return { success: true };
  }

  async findCompanyUsers(
    companyId: string,
    skip: number = 0,
    take: number = 10,
    search?: string,
  ) {
    return this.userRepository.findCompanyMembers(companyId, {
      skip,
      take,
      search,
    });
  }

  async inviteUser(companyId: string, inviterId: string, dto: InviteUserDto) {
    let user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      // In a real flow we'd send an email with a token to create a password
      // For now we create the user with a default password so they can login
      const defaultPasswordHash = await bcrypt.hash('Mudar@123', 12);
      user = await this.userRepository.createUser({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash: defaultPasswordHash
      });
    }

    const membership = await this.userRepository.addToCompany(
      user.id,
      companyId,
      dto.role,
    );

    this.eventEmitter.emit("entity.created", {
      entityName: "UserCompany",
      entityId: user.id,
      companyId,
      userId: inviterId,
      newData: membership,
    });

    return membership;
  }
}
