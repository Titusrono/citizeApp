import { PartialType } from '@nestjs/mapped-types';
import { CreateTownhallDto } from './create-townhall.dto';

export class UpdateTownhallDto extends PartialType(CreateTownhallDto) {}
