import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationController } from './classification.controller';
import { ClassificationService } from './classification.service';
import { ClassificationEntity } from './entities/classification.entity';
import { ClassificationAuditEntity } from './entities/classification-audit.entity';
import { AiModule } from '../ai/ai.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassificationEntity, ClassificationAuditEntity]),
    AiModule,
    EmbeddingModule,
  ],
  controllers: [ClassificationController],
  providers: [ClassificationService],
  exports: [ClassificationService],
})
export class ClassificationModule {}
