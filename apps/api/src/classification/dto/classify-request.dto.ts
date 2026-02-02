import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min, IsInt } from 'class-validator';

export class ClassifyRequestDto {
  @ApiProperty({ description: 'Bezeichnung des Artikels', example: 'Dell Latitude 5540 Laptop' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  artikelBezeichnung: string;

  @ApiPropertyOptional({ description: 'Detaillierte Beschreibung' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  artikelBeschreibung?: string;

  @ApiPropertyOptional({ description: 'Geschätzter Einzelpreis in EUR', example: 1200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  geschaetzterPreis?: number;

  @ApiPropertyOptional({ description: 'Bestellmenge', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  menge?: number;

  @ApiPropertyOptional({ description: 'Optionale Kategorie' })
  @IsOptional()
  @IsString()
  kategorie?: string;
}
