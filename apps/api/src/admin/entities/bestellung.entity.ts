import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bestellungen')
export class BestellungEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  artikelId: string;

  @Column()
  artikelBezeichnung: string;

  @Column({ type: 'varchar', length: 30 })
  marktplatz: string;

  @Column()
  lieferant: string;

  @Column({ type: 'decimal' })
  einzelpreis: number;

  @Column({ type: 'int' })
  menge: number;

  @Column({ type: 'decimal' })
  gesamtpreis: number;

  @Column({ type: 'decimal', default: 0 })
  skontoAbzug: number;

  @Column({ type: 'decimal' })
  endpreis: number;

  @Column({ default: 'EUR' })
  waehrung: string;

  @Column({ type: 'varchar', length: 30, default: 'ENTWURF' })
  status: string;

  @Column({ nullable: true })
  rahmenvertragNr: string;

  @Column({ default: false })
  genehmigungErforderlich: boolean;

  @Column({ nullable: true })
  genehmigungVon: string;

  @Column({ type: 'timestamp', nullable: true })
  genehmigungAm: Date;

  @Column({ type: 'text', nullable: true })
  ablehnungsgrund: string;

  @Column({ type: 'text', nullable: true })
  begruendung: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bestelltAm: Date;

  @Column({ default: false })
  istSandbox: boolean;

  @CreateDateColumn()
  erstelltAm: Date;
}
