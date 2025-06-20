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
import { BloqsService } from './bloqs.service';
import { CreateBloqDto } from './dto/create-bloq.dto';
import { UpdateBloqDto } from './dto/update-bloq.dto';

@Controller('bloqs')
export class BloqsController {
    constructor(
        private readonly bloqsService: BloqsService
    ) {}

    @Post()
    create(
        @Body() createBloqDto: CreateBloqDto
    ) {
        return this.bloqsService.create(createBloqDto);
    }

    @Get()
    findAll() {
        return this.bloqsService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id') id: string
    ) {
        return this.bloqsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateBloqDto: UpdateBloqDto
    ) {
        return this.bloqsService.update(id, updateBloqDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.bloqsService.remove(id);
    }
}