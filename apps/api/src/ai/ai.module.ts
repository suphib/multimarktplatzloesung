import { Module } from '@nestjs/common';
import { ClassificationAiService } from './classification-ai.service';

@Module({
  providers: [ClassificationAiService],
  exports: [ClassificationAiService],
})
export class AiModule {}
