import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CompleteRegistrationDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
