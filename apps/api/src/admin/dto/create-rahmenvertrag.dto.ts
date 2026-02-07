import { IsString, MinLength, IsDateString, IsOptional, IsNumber, Min, IsEmail, IsIn } from 'class-validator';

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

  @IsOptional()
  @IsDateString()
  gueltigAb?: string;

  @IsDateString()
  gueltigBis: string;

  @IsOptional()
  @IsString()
  cpvCodes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxVolumen?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ENTWURF', 'AKTIV', 'GEKUENDIGT', 'ABGELAUFEN'])
  status?: string;

  @IsOptional()
  @IsString()
  ansprechpartner?: string;

  @IsOptional()
  @IsEmail()
  ansprechpartnerEmail?: string;

  @IsOptional()
  @IsString()
  ansprechpartnerTelefon?: string;

  @IsOptional()
  @IsString()
  zahlungsbedingungen?: string;

  @IsOptional()
  @IsString()
  skonto?: string;

  @IsOptional()
  @IsString()
  kuendigungsfrist?: string;

  @IsOptional()
  @IsString()
  produktkategorien?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  abrufVolumen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mindestBestellwert?: number;

  @IsOptional()
  @IsString()
  notizen?: string;
}
