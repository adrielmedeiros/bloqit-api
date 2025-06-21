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
import { LockersService } from './lockers.service';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';

@Controller('lockers')
export class LockersController {
    constructor(
        private readonly lockersService: LockersService
    ) {}

    @Post()
    create(
        @Body() createLockerDto: CreateLockerDto
    ) {
        return this.lockersService.create(createLockerDto);
    }

    @Get()
    findAll() {
        return this.lockersService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id') id: string
    ) {
        return this.lockersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateLockerDto: UpdateLockerDto
    ) {
        return this.lockersService.update(id, updateLockerDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.lockersService.remove(id);
    }

    // Business logic endpoints
    @Get('bloq/:bloqId')
    findByBloq(
        @Param('bloqId') bloqId: string
    ) {
        return this.lockersService.findByBloqId(bloqId);
    }

    @Get('bloq/:bloqId/available')
    findAvailableInBloq(
        @Param('bloqId') bloqId: string
    ) {
        return this.lockersService.findAvailableInBloq(bloqId);
    }
}