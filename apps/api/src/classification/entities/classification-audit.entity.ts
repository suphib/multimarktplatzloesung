import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KlassifizierungsQuelle } from '@procurement/shared';
import { ClassificationEntity } from './classification.entity';

@Entity('classification_audit')
export class ClassificationAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  klassifizierungId: string;

  @ManyToOne(() => ClassificationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'klassifizierungId' })
  klassifizierung: ClassificationEntity;

  @Column()
  benutzer: string;

  @Column()
  aktion: 'ERSTELLT' | 'UEBERSCHRIEBEN';

  @Column({ type: 'jsonb', nullable: true })
  vorher: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle } | null;

  @Column({ type: 'jsonb' })
  nachher: { cpvCode: string; cpvBezeichnung: string; quelle: KlassifizierungsQuelle };

  @Column({ nullable: true })
  begruendung: string;

  @CreateDateColumn()
  zeitpunkt: Date;
}
