import { IsString, IsIn } from 'class-validator';

export class GoogleCompleteDto {
  @IsString()
  username!: string;

  @IsString()
  countryIso!: string;

  @IsIn(['CLIENT', 'PROVIDER'])
  role!: 'CLIENT' | 'PROVIDER';
}
