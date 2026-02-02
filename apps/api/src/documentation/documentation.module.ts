import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentationController } from './documentation.controller';
import { DocumentationService } from './documentation.service';
import { DocumentationEntity } from './entities/documentation.entity';
import { ClassificationModule } from '../classification/classification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentationEntity]),
    ClassificationModule,
  ],
  controllers: [DocumentationController],
  providers: [DocumentationService],
})
export class DocumentationModule {}
