import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('system_settings')
export class SystemSettingsEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 20, default: 'SANDBOX' })
  aktuellerModus: string;
}
