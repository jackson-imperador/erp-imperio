import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "joao@empresa.com" })
  @IsEmail({}, { message: "Please provide a valid email address." })
  email: string;

  @ApiProperty({ example: "João" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: "Silva" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: "MinhaSenh@Forte123", minLength: 8 })
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  @MaxLength(128)
  password: string;
}
