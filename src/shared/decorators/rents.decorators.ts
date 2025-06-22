import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Rent } from '../../modules/rents/rent.schema';
import { CreateRentDto } from '../../modules/rents/dto/create-rent.dto';
import { UpdateRentDto } from '../../modules/rents/dto/update-rent.dto';
import { DropOffRentDto } from '../../modules/rents/dto/drop-off-rent.dto';
import { RentStatus } from '../enums';

export function ApiCreateRent() {
    return applyDecorators(
        ApiOperation({
            summary: 'Create a new rent (parcel)'
        }),
        ApiBody({
            type: CreateRentDto
        }),
        ApiResponse({ 
            status: 201, 
            description: 'Rent created successfully with CREATED status',
            type: Rent
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid input data'
        })
    );
}

export function ApiFindAllRents() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all rents, optionally filtered by status' }),
        ApiQuery({ 
            name: 'status', 
            required: false, 
            enum: RentStatus, 
            description: 'Filter by rent status' 
        }),
        ApiResponse({ 
            status: 200, 
            description: 'List of rents',
            type: [Rent]
        })
    );
}

export function ApiFindOneRent() {
    return applyDecorators(
        ApiOperation({ summary: 'Get a specific rent by ID' }),
        ApiParam({ name: 'id', description: 'Rent UUID' }),
        ApiResponse({ 
            status: 200, 
            description: 'Rent found',
            type: Rent
        }),
        ApiResponse({ status: 404, description: 'Rent not found' })
    );
}

export function ApiUpdateRent() {
    return applyDecorators(
        ApiOperation({ summary: 'Update a rent' }),
        ApiParam({ name: 'id', description: 'Rent UUID' }),
        ApiBody({ type: UpdateRentDto }),
        ApiResponse({ 
            status: 200, 
            description: 'Rent updated successfully',
            type: Rent
        }),
        ApiResponse({ status: 404, description: 'Rent not found' }),
        ApiResponse({ status: 400, description: 'Invalid input data' })
    );
}

export function ApiDeleteRent() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete a rent' }),
        ApiParam({ name: 'id', description: 'Rent UUID' }),
        ApiResponse({ status: 204, description: 'Rent deleted successfully' }),
        ApiResponse({ status: 404, description: 'Rent not found' })
    );
}

export function ApiDropOffRent() {
    return applyDecorators(
        ApiOperation({ 
            summary: 'Drop off parcel at locker',
            description: 'Assigns an available locker and changes status to WAITING_PICKUP'
        }),
        ApiParam({ name: 'id', description: 'Rent UUID' }),
        ApiBody({ type: DropOffRentDto }),
        ApiResponse({ 
            status: 200, 
            description: 'Parcel dropped off successfully',
            type: Rent
        }),
        ApiResponse({ status: 400, description: 'Rent not in CREATED status or no available lockers' }),
        ApiResponse({ status: 404, description: 'Rent not found' })
    );
}

export function ApiPickUpRent() {
    return applyDecorators(
        ApiOperation({ 
            summary: 'Pick up parcel from locker',
            description: 'Frees the locker and changes status to DELIVERED'
        }),
        ApiParam({ name: 'id', description: 'Rent UUID' }),
        ApiResponse({ 
            status: 200, 
            description: 'Parcel picked up successfully',
            type: Rent
        }),
        ApiResponse({ status: 400, description: 'Rent not ready for pickup' }),
        ApiResponse({ status: 404, description: 'Rent not found' })
    );
}