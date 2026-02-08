import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { BestellungEntity } from './entities/bestellung.entity';
import { SystemSettingsEntity } from './entities/system-settings.entity';
import { AdminService } from './admin.service';
import { DashboardAdminController } from './controllers/dashboard-admin.controller';
import { RahmenvertragAdminController } from './controllers/rahmenvertrag-admin.controller';
import { ShopConfigAdminController } from './controllers/shop-config-admin.controller';
import { KatalogAdminController } from './controllers/katalog-admin.controller';
import { BestellungAdminController } from './controllers/bestellung-admin.controller';
import { SystemSettingsAdminController } from './controllers/system-settings-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RahmenvertragEntity, FrameworkContractEntity, ShopConfigEntity, BestellungEntity, SystemSettingsEntity]),
  ],
  controllers: [
    DashboardAdminController,
    RahmenvertragAdminController,
    ShopConfigAdminController,
    KatalogAdminController,
    BestellungAdminController,
    SystemSettingsAdminController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
