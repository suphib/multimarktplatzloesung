import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingService } from './embedding.service';
import { RahmenvertragEntity } from './entities/rahmenvertrag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RahmenvertragEntity])],
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
