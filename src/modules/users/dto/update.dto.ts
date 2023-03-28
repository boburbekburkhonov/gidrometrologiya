import { IsString, IsOptional } from 'class-validator';

export class updateDto {
  @IsString()
  @IsOptional()
  readonly username?: string;

  @IsString()
  @IsOptional()
  readonly password?: string;
}
