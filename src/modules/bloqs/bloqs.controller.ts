import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BloqsService } from './bloqs.service';
import { CreateBloqDto } from './dto/create-bloq.dto';
import { UpdateBloqDto } from './dto/update-bloq.dto';
import {
  ApiCreateBloq,
  ApiFindAllBloqs,
  ApiFindOneBloq,
  ApiUpdateBloq,
  ApiDeleteBloq,
} from '../../shared/decorators/bloqs.decorators';

@ApiTags('bloqs')
@Controller('bloqs')
export class BloqsController {
    constructor(
        private readonly bloqsService: BloqsService
    ) {}

    @Post()
    @ApiCreateBloq()
    create(
        @Body() createBloqDto: CreateBloqDto
    ) {
        return this.bloqsService.create(createBloqDto);
    }

    @Get()
    @ApiFindAllBloqs()
    findAll() {
        return this.bloqsService.findAll();
    }

    @Get(':id')
    @ApiFindOneBloq()
    findOne(
        @Param('id') id: string
    ) {
        return this.bloqsService.findOne(id);
    }

    @Patch(':id')
    @ApiUpdateBloq()
    update(
        @Param('id') id: string,
        @Body() updateBloqDto: UpdateBloqDto
    ) {
        return this.bloqsService.update(id, updateBloqDto);
    }

    @Delete(':id')
    @ApiDeleteBloq()
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.bloqsService.remove(id);
    }
}