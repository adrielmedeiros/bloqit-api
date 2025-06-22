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
import { ApiTags } from '@nestjs/swagger';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { DropOffRentDto } from './dto/drop-off-rent.dto';
import { RentStatus } from '../../shared/enums';
import {
    ApiCreateRent,
    ApiFindAllRents,
    ApiFindOneRent,
    ApiUpdateRent,
    ApiDeleteRent,
    ApiDropOffRent,
    ApiPickUpRent,
} from '../../shared/decorators/rents.decorators';

@ApiTags('rents')
@Controller('rents')
export class RentsController {
    constructor(
        private readonly rentsService: RentsService
    ) {}

    @Post()
    @ApiCreateRent()
    create(
        @Body() createRentDto: CreateRentDto
    ) {
        return this.rentsService.create(createRentDto);
    }

    @Get()
    @ApiFindAllRents()
    findAll(
        @Query('status') status?: RentStatus
    ) {
        if (status) {
            return this.rentsService.findByStatus(status);
        }
        return this.rentsService.findAll();
    }

    @Get(':id')
    @ApiFindOneRent()
    findOne(
        @Param('id') id: string
    ) {
        return this.rentsService.findOne(id);
    }

    @Patch(':id')
    @ApiUpdateRent()
    update(
        @Param('id') id: string,
        @Body() updateRentDto: UpdateRentDto
    ) {
        return this.rentsService.update(id, updateRentDto);
    }

    @Delete(':id')
    @ApiDeleteRent()
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param('id') id: string
    ) {
        return this.rentsService.remove(id);
    }

    @Put(':id/drop-off')
    @ApiDropOffRent()
    dropOff(
        @Param('id') id: string,
        @Body() dropOffDto: DropOffRentDto
    ) {
        return this.rentsService.dropOff(id, dropOffDto.bloqId);
    }

    @Put(':id/pick-up')
    @ApiPickUpRent()
    pickUp(
        @Param('id') id: string
    ) {
        return this.rentsService.pickUp(id);
    }
}