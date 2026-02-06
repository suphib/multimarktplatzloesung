import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';
import { FrameworkContractEntity } from '../search/entities/framework-contract.entity';
import { ShopConfigEntity } from './entities/shop-config.entity';
import { AdminService } from './admin.service';
import { DashboardAdminController } from './controllers/dashboard-admin.controller';
import { RahmenvertragAdminController } from './controllers/rahmenvertrag-admin.controller';
import { ShopConfigAdminController } from './controllers/shop-config-admin.controller';
import { KatalogAdminController } from './controllers/katalog-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RahmenvertragEntity, FrameworkContractEntity, ShopConfigEntity]),
  ],
  controllers: [
    DashboardAdminController,
    RahmenvertragAdminController,
    ShopConfigAdminController,
    KatalogAdminController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
