import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documentations')
export class DocumentationEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  klassifizierungId: string;

  @Column()
  benutzer: string;

  @Column()
  artikelBezeichnung: string;

  @Column({ type: 'jsonb' })
  klassifizierung: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  suchergebnisse: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  ausgewaehlterArtikel: Record<string, any>;

  @Column({ type: 'text' })
  begruendung: string;

  @Column({ type: 'jsonb' })
  compliancePruefung: Record<string, any>;

  @Column()
  integritaetsHash: string;

  @CreateDateColumn()
  erstelltAm: Date;
}
