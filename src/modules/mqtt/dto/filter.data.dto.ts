import { IsNotEmpty, IsString } from 'class-validator';

export class filterDto {
  @IsString()
  @IsNotEmpty()
  readonly start: string;

  @IsString()
  @IsNotEmpty()
  readonly end: string;
}
