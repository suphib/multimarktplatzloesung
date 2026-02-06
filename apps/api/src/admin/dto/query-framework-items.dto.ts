import { IsOptional, IsString, IsInt, Min, IsIn, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFrameworkItemsDto {
  @IsOptional()
  @IsString()
  suchbegriff?: string;

  @IsOptional()
  @IsString()
  lieferant?: string;

  @IsOptional()
  @IsString()
  rahmenvertragsNummer?: string;

  @IsOptional()
  @IsBooleanString()
  nurVerfuegbar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seite?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  proSeite?: number;

  @IsOptional()
  @IsString()
  sortierFeld?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortierRichtung?: 'ASC' | 'DESC';
}
