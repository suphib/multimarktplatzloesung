import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class OciSetupDto {
  @IsString()
  @IsNotEmpty()
  HOOK_URL: string;

  @IsString()
  @IsOptional()
  USERNAME?: string;

  @IsString()
  @IsOptional()
  PASSWORD?: string;

  @IsString()
  @IsOptional()
  CALLER?: string;
}
