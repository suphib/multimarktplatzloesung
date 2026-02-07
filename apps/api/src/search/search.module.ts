import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { FrameworkContractEntity } from './entities/framework-contract.entity';
import { RahmenvertragEntity } from '../embedding/entities/rahmenvertrag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FrameworkContractEntity, RahmenvertragEntity])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
