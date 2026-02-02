import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsInt, IsEnum, IsArray, MinLength, Min, Max } from 'class-validator';
import { Marktplatz } from '@procurement/shared';

export class SearchRequestDto {
  @ApiProperty({ description: 'Suchbegriff', example: 'Laptop Business' })
  @IsString()
  @MinLength(2)
  suchbegriff: string;

  @ApiPropertyOptional({ description: 'Marktplätze', enum: Marktplatz, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Marktplatz, { each: true })
  marktplaetze?: Marktplatz[];

  @ApiPropertyOptional({ description: 'Preis von (EUR)', example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preisVon?: number;

  @ApiPropertyOptional({ description: 'Preis bis (EUR)', example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preisBis?: number;

  @ApiPropertyOptional({ description: 'Kategorie' })
  @IsOptional()
  @IsString()
  kategorie?: string;

  @ApiPropertyOptional({ description: 'Nur nachhaltige Produkte' })
  @IsOptional()
  @IsBoolean()
  nurNachhaltig?: boolean;

  @ApiPropertyOptional({ description: 'Seite', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seite?: number;

  @ApiPropertyOptional({ description: 'Ergebnisse pro Seite', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  proSeite?: number;
}
