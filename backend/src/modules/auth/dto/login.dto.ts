import { IsEmail, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "joao@empresa.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "MinhaSenh@Forte123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
