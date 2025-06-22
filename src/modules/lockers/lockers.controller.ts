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
import { LockersService } from './lockers.service';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';
import {
    ApiCreateLocker,
    ApiFindAllLockers,
    ApiFindOneLocker,
    ApiUpdateLocker,
    ApiDeleteLocker,
    ApiGetLockersByBloq,
    ApiGetAvailableLockers,
} from '../../shared/decorators/lockers.decorators';

@ApiTags('lockers')
@Controller('lockers')
export class LockersController {
    constructor(
        private readonly lockersService: LockersService
    ) {}

    @Post()
    @ApiCreateLocker()
    create(
        @Body() createLockerDto: CreateLockerDto
    ) {
        return this.lockersService.create(createLockerDto);
    }

    @Get()
    @ApiFindAllLockers()
    findAll() {
        return this.lockersService.findAll();
    }

    @Get(':id')
    @ApiFindOneLocker()
    findOne(
        @Param('id') id: string
    ) {
        return this.lockersService.findOne(id);
    }

    @Patch(':id')
    @ApiUpdateLocker()
    update(
        @Param('id') id: string,
        @Body() updateLockerDto: UpdateLockerDto
    ) {
        return this.lockersService.update(id, updateLockerDto);
    }

    @Delete(':id')
    @ApiDeleteLocker()
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.lockersService.remove(id);
    }

    @Get('bloq/:bloqId')
    @ApiGetLockersByBloq()
    findByBloq(
        @Param('bloqId') bloqId: string
    ) {
        return this.lockersService.findByBloqId(bloqId);
    }

    @Get('bloq/:bloqId/available')
    @ApiGetAvailableLockers()
    findAvailableInBloq(
        @Param('bloqId') bloqId: string
    ) {
        return this.lockersService.findAvailableInBloq(bloqId);
    }
}