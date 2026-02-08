import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OciCartItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsString()
  vendorMat: string;

  @IsString()
  vendor: string;

  @IsString()
  @IsOptional()
  contract?: string;

  @IsString()
  @IsOptional()
  matgroup?: string;

  @IsNumber()
  @IsOptional()
  leadtime?: number;

  @IsString()
  @IsOptional()
  longtext?: string;
}

export class OciReturnDto {
  @IsString()
  sessionToken: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OciCartItemDto)
  items: OciCartItemDto[];
}
