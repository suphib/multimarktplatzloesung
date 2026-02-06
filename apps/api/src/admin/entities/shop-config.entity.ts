import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';
import { Marktplatz } from '@procurement/shared';

@Entity('shop_configs')
export class ShopConfigEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  typ: Marktplatz;

  @Column({ default: false })
  aktiv: boolean;

  @Column({ nullable: true })
  apiKeyHash: string;

  @Column({ nullable: true })
  baseUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  letzteSynchronisation: Date | null;

  @CreateDateColumn()
  erstelltAm: Date;
}
