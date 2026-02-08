import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class MagicRequestDto {
  @ApiProperty({
    description: 'Freitext (E-Mail, Notiz, Besprechungsprotokoll) der in Bestellpositionen umgewandelt werden soll',
    example: 'Bitte bestellen Sie 5 Dell Latitude Laptops und 3 Monitore 27 Zoll',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  freitext: string;
}
