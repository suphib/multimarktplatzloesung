import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('rahmenvertraege')
export class RahmenvertragEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  bezeichnung: string;

  @Column({ type: 'text' })
  beschreibung: string;

  @Column()
  lieferant: string;

  @Column()
  vertragsnummer: string;

  @Column({ type: 'date', nullable: true })
  gueltigAb: Date | null;

  @Column({ type: 'date' })
  gueltigBis: Date;

  @Column({ type: 'text', nullable: true })
  cpvCodes: string;

  @Column({ type: 'decimal', nullable: true })
  maxVolumen: number;

  @Column({ type: 'varchar', length: 20, default: 'AKTIV' })
  status: string;

  @Column({ nullable: true })
  ansprechpartner: string;

  @Column({ nullable: true })
  ansprechpartnerEmail: string;

  @Column({ nullable: true })
  ansprechpartnerTelefon: string;

  @Column({ nullable: true })
  zahlungsbedingungen: string;

  @Column({ nullable: true })
  skonto: string;

  @Column({ nullable: true })
  kuendigungsfrist: string;

  @Column({ type: 'text', nullable: true })
  produktkategorien: string;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  abrufVolumen: number;

  @Column({ type: 'decimal', nullable: true, default: 0 })
  mindestBestellwert: number;

  @Column({ type: 'text', nullable: true, default: '[]' })
  dokumente: string;

  @Column({ type: 'text', nullable: true, default: '[]' })
  verlaengerungen: string;

  @Column({ type: 'text', nullable: true })
  notizen: string;

  @Column({ default: false })
  istSandbox: boolean;

  @CreateDateColumn()
  erstelltAm: Date;
}
