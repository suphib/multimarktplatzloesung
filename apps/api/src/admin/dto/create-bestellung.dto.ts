import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBestellungDto {
  @IsString()
  artikelId: string;

  @IsString()
  artikelBezeichnung: string;

  @IsString()
  marktplatz: string;

  @IsString()
  lieferant: string;

  @IsNumber()
  @Min(0)
  einzelpreis: number;

  @IsNumber()
  @Min(1)
  menge: number;

  @IsOptional()
  @IsString()
  waehrung?: string;

  @IsOptional()
  @IsString()
  rahmenvertragNr?: string;

  @IsOptional()
  @IsString()
  begruendung?: string;
}
