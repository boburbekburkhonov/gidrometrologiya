import { IsString, IsNotEmpty } from 'class-validator';

export class createDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
