import { IsString, MinLength, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateRahmenvertragDto {
  @IsString()
  @MinLength(3)
  bezeichnung: string;

  @IsString()
  beschreibung: string;

  @IsString()
  @MinLength(2)
  lieferant: string;

  @IsString()
  @MinLength(3)
  vertragsnummer: string;

  @IsDateString()
  gueltigBis: string;

  @IsOptional()
  @IsString()
  cpvCodes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVolumen?: number;
}
