import { IsString } from 'class-validator';

export class GoogleCompleteDto {
  @IsString()
  username!: string;

  @IsString()
  countryIso!: string;
}
