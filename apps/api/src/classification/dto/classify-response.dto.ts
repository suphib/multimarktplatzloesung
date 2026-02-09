import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Kanal, Konfidenz, ComplianceStatus, KlassifizierungsQuelle } from '@procurement/shared';

export class ComplianceInfoDto {
  @ApiProperty({ enum: ComplianceStatus })
  status: ComplianceStatus;

  @ApiProperty()
  pruefpunkte: { bezeichnung: string; erfuellt: boolean; hinweis?: string }[];

  @ApiProperty()
  schwellenwertKategorie: string;

  @ApiProperty()
  dokumentationspflicht: boolean;
}

export class RahmenvertragMatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bezeichnung: string;

  @ApiProperty()
  lieferant: string;

  @ApiProperty()
  vertragsnummer: string;

  @ApiProperty()
  gueltigBis: string;

  @ApiProperty()
  aehnlichkeit: number;
}

export class KanalEmpfehlungDto {
  @ApiProperty({ enum: Kanal })
  kanal: Kanal;

  @ApiProperty()
  begruendung: string;

  @ApiProperty()
  prioritaet: number;
}

export class ClassifyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  artikelBezeichnung: string;

  @ApiProperty({ enum: Kanal })
  empfohlenerKanal: Kanal;

  @ApiProperty({ enum: Konfidenz })
  konfidenz: Konfidenz;

  @ApiProperty()
  konfidenzWert: number;

  @ApiProperty()
  cpvCode: string;

  @ApiProperty()
  cpvBezeichnung: string;

  @ApiProperty()
  begruendung: string;

  @ApiProperty({ type: ComplianceInfoDto })
  compliance: ComplianceInfoDto;

  @ApiPropertyOptional({ type: RahmenvertragMatchDto })
  rahmenvertrag?: RahmenvertragMatchDto;

  @ApiProperty({ type: [KanalEmpfehlungDto] })
  alternativeKanaele: KanalEmpfehlungDto[];

  @ApiProperty({ enum: KlassifizierungsQuelle })
  quelle: KlassifizierungsQuelle;

  @ApiPropertyOptional()
  aenderungsHistorie?: AenderungsEintragDto[];

  @ApiProperty()
  erstelltAm: string;
}

export class AenderungsEintragDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  aktion: 'ERSTELLT' | 'UEBERSCHRIEBEN';

  @ApiProperty()
  benutzer: string;

  @ApiProperty()
  zeitpunkt: string;

  @ApiPropertyOptional()
  begruendung?: string;

  @ApiPropertyOptional()
  vorher?: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle };

  @ApiProperty()
  nachher: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle };
}
