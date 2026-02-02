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

  @Column({ type: 'date' })
  gueltigBis: Date;

  @Column({ type: 'text', nullable: true })
  cpvCodes: string;

  @Column({ type: 'decimal', nullable: true })
  maxVolumen: number;

  @CreateDateColumn()
  erstelltAm: Date;
}
