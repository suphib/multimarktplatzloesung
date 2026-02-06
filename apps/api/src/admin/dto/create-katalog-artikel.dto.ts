import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateKatalogArtikelDto {
  @IsString()
  titel: string;

  @IsOptional()
  @IsString()
  beschreibung?: string;

  @IsString()
  lieferant: string;

  @IsOptional()
  @IsString()
  cpvCodes?: string;

  @IsNumber()
  @Min(0)
  preis: number;

  @IsOptional()
  @IsString()
  waehrung?: string;

  @IsString()
  rahmenvertragsNummer: string;

  @IsOptional()
  @IsString()
  artikelnummer?: string;

  @IsOptional()
  @IsString()
  nachhaltigkeitslabel?: string;

  @IsOptional()
  @IsString()
  lieferzeit?: string;

  @IsOptional()
  @IsString()
  bildUrl?: string;

  @IsOptional()
  @IsBoolean()
  verfuegbar?: boolean;
}
