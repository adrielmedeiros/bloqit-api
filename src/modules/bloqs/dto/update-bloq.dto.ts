import { PartialType } from '@nestjs/mapped-types';
import { CreateBloqDto } from './create-bloq.dto';

export class UpdateBloqDto extends PartialType(CreateBloqDto) {}