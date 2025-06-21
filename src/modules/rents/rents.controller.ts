import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Put,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { DropOffRentDto } from './dto/drop-off-rent.dto';
import { RentStatus } from '../../shared/enums';

@Controller('rents')
export class RentsController {
    constructor(
        private readonly rentsService: RentsService
    ) {}

    @Post()
    create(
        @Body() createRentDto: CreateRentDto
    ) {
        return this.rentsService.create(createRentDto);
    }

    @Get()
    findAll(
        @Query('status') status?: RentStatus
    ) {
        if (status) {
            return this.rentsService.findByStatus(status);
        }
        return this.rentsService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id') id: string
    ) {
        return this.rentsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateRentDto: UpdateRentDto
    ) {
        return this.rentsService.update(id, updateRentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.rentsService.remove(id);
    }

    // Business logic endpoints
    @Put(':id/drop-off')
    dropOff(
        @Param('id') id: string,
        @Body() dropOffDto: DropOffRentDto
    ) {
        return this.rentsService.dropOff(id, dropOffDto.bloqId);
    }

    @Put(':id/pick-up')
    pickUp(
        @Param('id') id: string
    ) {
        return this.rentsService.pickUp(id);
    }

    // For compatibility with tests that expect this method
    // TODO: Is this method necessary? If not, remove it.
    findByStatus(
        status: RentStatus
    ) {
        return this.rentsService.findByStatus(status);
    }
}