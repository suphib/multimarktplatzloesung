import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class OverrideClassificationDto {
  @ApiProperty({ description: 'Neuer CPV-Code', example: '30213100' })
  @IsString()
  @MinLength(1)
  cpvCode: string;

  @ApiProperty({ description: 'Bezeichnung des CPV-Codes', example: 'Tragbare Computer' })
  @IsString()
  @MinLength(1)
  cpvBezeichnung: string;

  @ApiProperty({ description: 'Begründung für die Änderung (min. 10 Zeichen)', example: 'CPV-Code war falsch zugeordnet, korrekter Code für Monitore' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  begruendung: string;

  @ApiPropertyOptional({ description: 'Name des Benutzers', example: 'Max Mustermann' })
  @IsOptional()
  @IsString()
  benutzer?: string;
}
