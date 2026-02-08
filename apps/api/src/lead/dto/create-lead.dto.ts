import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  IsInt,
  Min,
  IsNotEmpty,
  Equals,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  vorname: string;

  @IsString()
  @IsNotEmpty()
  nachname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefon?: string;

  @IsString()
  @IsNotEmpty()
  organisation: string;

  @IsOptional()
  @IsString()
  abteilung?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsIn(['KONTAKT', 'DEMO', 'NEWSLETTER'])
  typ: string;

  @IsOptional()
  @IsString()
  nachricht?: string;

  @IsOptional()
  @IsIn(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
  interesseAn?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  anzahlNutzer?: number;

  @IsBoolean()
  @Equals(true, { message: 'Datenschutzbestimmungen müssen akzeptiert werden' })
  datenschutzAkzeptiert: boolean;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;

  @IsOptional()
  @IsString()
  quelle?: string;

  @IsOptional()
  @IsString()
  utmSource?: string;

  @IsOptional()
  @IsString()
  utmMedium?: string;

  @IsOptional()
  @IsString()
  utmCampaign?: string;
}

export class UpdateLeadStatusDto {
  @IsIn(['NEU', 'KONTAKTIERT', 'QUALIFIZIERT', 'KONVERTIERT'])
  status: string;
}
