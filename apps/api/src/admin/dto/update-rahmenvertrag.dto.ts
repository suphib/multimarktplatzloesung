import { PartialType } from '@nestjs/mapped-types';
import { CreateRahmenvertragDto } from './create-rahmenvertrag.dto';

export class UpdateRahmenvertragDto extends PartialType(CreateRahmenvertragDto) {}
