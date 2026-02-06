import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('framework_contracts')
export class FrameworkContractEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  titel: string;

  @Column({ type: 'text', nullable: true })
  beschreibung: string;

  @Column()
  lieferant: string;

  @Column({ type: 'text', nullable: true })
  cpvCodes: string;

  @Column({ type: 'decimal' })
  preis: number;

  @Column({ default: 'EUR' })
  waehrung: string;

  @Column()
  rahmenvertragsNummer: string;

  @Column({ nullable: true })
  artikelnummer: string;

  @Column({ type: 'text', nullable: true })
  nachhaltigkeitslabel: string;

  @Column({ nullable: true })
  lieferzeit: string;

  @Column({ nullable: true })
  bildUrl: string;

  @Column({ default: true })
  verfuegbar: boolean;

  @CreateDateColumn()
  erstelltAm: Date;
}
