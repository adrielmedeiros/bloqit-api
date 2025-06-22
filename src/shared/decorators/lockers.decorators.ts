import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Locker } from '../../modules/lockers/locker.schema';
import { CreateLockerDto } from '../../modules/lockers/dto/create-locker.dto';
import { UpdateLockerDto } from '../../modules/lockers/dto/update-locker.dto';

export function ApiCreateLocker() {
    return applyDecorators(
        ApiOperation({ summary: 'Create a new locker' }),
        ApiBody({ type: CreateLockerDto }),
        ApiResponse({ 
            status: 201, 
            description: 'Locker created successfully',
            type: Locker
        }),
        ApiResponse({ status: 400, description: 'Invalid input data or bloq not found' })
    );
}

export function ApiFindAllLockers() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all lockers' }),
        ApiResponse({ 
            status: 200, 
            description: 'List of all lockers',
            type: [Locker]
        })
    );
}

export function ApiFindOneLocker() {
    return applyDecorators(
        ApiOperation({ summary: 'Get a specific locker by ID' }),
        ApiParam({ name: 'id', description: 'Locker UUID' }),
        ApiResponse({ 
            status: 200, 
            description: 'Locker found',
            type: Locker
        }),
        ApiResponse({ status: 404, description: 'Locker not found' })
    );
}

export function ApiUpdateLocker() {
    return applyDecorators(
        ApiOperation({ summary: 'Update a locker' }),
        ApiParam({ name: 'id', description: 'Locker UUID' }),
        ApiBody({ type: UpdateLockerDto }),
        ApiResponse({ 
            status: 200, 
            description: 'Locker updated successfully',
            type: Locker
        }),
        ApiResponse({ status: 404, description: 'Locker not found' }),
        ApiResponse({ status: 400, description: 'Invalid bloq ID' })
    );
}

export function ApiDeleteLocker() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete a locker' }),
        ApiParam({ name: 'id', description: 'Locker UUID' }),
        ApiResponse({ status: 204, description: 'Locker deleted successfully' }),
        ApiResponse({ status: 404, description: 'Locker not found' })
    );
}

export function ApiGetLockersByBloq() {
    return applyDecorators(
        ApiOperation({ summary: 'Get all lockers in a specific bloq' }),
        ApiParam({ name: 'bloqId', description: 'Bloq UUID' }),
        ApiResponse({ 
            status: 200, 
            description: 'List of lockers in the bloq',
            type: [Locker]
        })
    );
}

export function ApiGetAvailableLockers() {
    return applyDecorators(
        ApiOperation({ summary: 'Get available lockers in a specific bloq' }),
        ApiParam({ name: 'bloqId', description: 'Bloq UUID' }),
        ApiResponse({ 
            status: 200, 
            description: 'List of available lockers in the bloq',
            type: [Locker]
        })
    );
}