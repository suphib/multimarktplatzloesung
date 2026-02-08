import { Module } from '@nestjs/common';
import { ClassificationAiService } from './classification-ai.service';
import { MagicRequestAiService } from './magic-request-ai.service';
import { MagicRequestService } from './magic-request.service';
import { MagicRequestController } from './magic-request.controller';

@Module({
  providers: [ClassificationAiService, MagicRequestAiService, MagicRequestService],
  controllers: [MagicRequestController],
  exports: [ClassificationAiService, MagicRequestAiService, MagicRequestService],
})
export class AiModule {}
