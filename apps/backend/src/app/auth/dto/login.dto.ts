import { IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\d{4,6}$/)
  pin!: string;
}
