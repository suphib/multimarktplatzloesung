import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateDocumentationDto {
  @ApiProperty({ description: 'ID der Klassifizierung', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  klassifizierungId: string;
}
