import { IsEmail, IsEnum, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

export class InviteUserDto {
  @ApiProperty({ example: "joao@empresa.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "João" })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: "Silva" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EMPLOYEE })
  @IsEnum(UserRole)
  role: UserRole = UserRole.EMPLOYEE;
}
