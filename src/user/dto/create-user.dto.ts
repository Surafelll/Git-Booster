import { IsEmail, IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  githubId?: string;

  @IsString()
  @IsOptional()
  githubUsername?: string;

  @IsString()
  @IsOptional()
  githubAccessToken?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  role?: string;
}