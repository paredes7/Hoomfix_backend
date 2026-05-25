import { IsOptional, IsString } from 'class-validator';

export class CompleteProfessionalRegistrationDto {
  @IsString()
  serviceTypeId: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
