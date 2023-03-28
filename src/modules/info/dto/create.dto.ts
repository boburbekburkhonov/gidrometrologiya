import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class createDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly imei: string;

  @IsString()
  @IsNotEmpty()
  readonly region: string;

  @IsString()
  @IsNotEmpty()
  readonly district: string;

  @IsString()
  @IsNotEmpty()
  readonly lon: string;

  @IsString()
  @IsNotEmpty()
  readonly lat: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsString()
  @IsOptional()
  reservoirId?: string;
}
