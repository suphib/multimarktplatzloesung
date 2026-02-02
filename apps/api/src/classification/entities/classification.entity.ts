import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { Kanal, Konfidenz } from '@procurement/shared';

@Entity('classifications')
export class ClassificationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  artikelBezeichnung: string;

  @Column({ nullable: true })
  artikelBeschreibung: string;

  @Column({ type: 'decimal', nullable: true })
  geschaetzterPreis: number;

  @Column({ nullable: true })
  menge: number;

  @Column({ type: 'enum', enum: Kanal })
  empfohlenerKanal: Kanal;

  @Column({ type: 'enum', enum: Konfidenz })
  konfidenz: Konfidenz;

  @Column({ type: 'decimal' })
  konfidenzWert: number;

  @Column()
  cpvCode: string;

  @Column({ type: 'jsonb' })
  ergebnis: Record<string, any>;

  @CreateDateColumn()
  erstelltAm: Date;
}
