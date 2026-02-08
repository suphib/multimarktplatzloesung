import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  vorname: string;

  @Column({ type: 'varchar' })
  nachname: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  telefon?: string;

  @Column({ type: 'varchar' })
  organisation: string;

  @Column({ type: 'varchar', nullable: true })
  abteilung?: string;

  @Column({ type: 'varchar', nullable: true })
  position?: string;

  @Column({ type: 'varchar', length: 30 })
  typ: string;

  @Column({ type: 'text', nullable: true })
  nachricht?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  interesseAn?: string;

  @Column({ type: 'int', nullable: true })
  anzahlNutzer?: number;

  @Column({ type: 'varchar', length: 30, default: 'NEU' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  quelle?: string;

  @Column({ type: 'varchar', nullable: true })
  utmSource?: string;

  @Column({ type: 'varchar', nullable: true })
  utmMedium?: string;

  @Column({ type: 'varchar', nullable: true })
  utmCampaign?: string;

  @Column({ type: 'boolean' })
  datenschutzAkzeptiert: boolean;

  @Column({ type: 'boolean', default: false })
  newsletterOptIn: boolean;

  @Column({ type: 'varchar', nullable: true })
  ipAdresse?: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  erstelltAm: Date;

  @UpdateDateColumn()
  aktualisiertAm: Date;
}
