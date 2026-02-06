import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateShopConfigDto {
  @IsOptional()
  @IsBoolean()
  aktiv?: boolean;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;
}
