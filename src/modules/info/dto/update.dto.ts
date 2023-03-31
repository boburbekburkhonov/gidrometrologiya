import { IsString, IsOptional } from 'class-validator';

export class updateDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly imei?: string;

  @IsString()
  @IsOptional()
  readonly region?: string;

  @IsString()
  @IsOptional()
  readonly district?: string;

  @IsString()
  @IsOptional()
  readonly lon?: string;

  @IsString()
  @IsOptional()
  readonly lat?: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsString()
  @IsOptional()
  readonly reservoirId?: string;

  @IsString()
  @IsOptional()
  user?: string;
}
