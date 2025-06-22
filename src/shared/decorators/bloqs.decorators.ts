import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Bloq, BloqSchema } from '../../modules/bloqs/bloq.schema';
import { CreateBloqDto } from '../../modules/bloqs/dto/create-bloq.dto';
import { UpdateBloqDto } from '../../modules/bloqs/dto/update-bloq.dto';

export function ApiCreateBloq() {
  return applyDecorators(
      ApiOperation({ summary: 'Create a new bloq.' }),
      ApiBody({ type: CreateBloqDto }),
      ApiResponse({ 
        status: 201, 
        description: 'Bloq created successfully',
        type: Bloq
      }),
      ApiResponse({ status: 400, description: 'Invalid input data' })
  );
}

export function ApiFindAllBloqs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all bloqs.' }),
    ApiResponse({ 
      status: 200, 
      description: 'List of all bloqs',
      type: [Bloq]
    })
  );
}

export function ApiFindOneBloq() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific bloq by ID' }),
    ApiParam({ name: 'id', description: 'Bloq UUID' }),
    ApiResponse({ 
      status: 200, 
      description: 'Bloq found',
      type: Bloq
    }),
    ApiResponse({ status: 404, description: 'Bloq not found' })
  );
}

export function ApiUpdateBloq() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a bloq.' }),
    ApiParam({ name: 'id', description: 'Bloq UUID' }),
    ApiBody({ type: UpdateBloqDto }),
    ApiResponse({ 
      status: 200, 
      description: 'Bloq updated successfully',
      type: Bloq
    }),
    ApiResponse({ status: 404, description: 'Bloq not found' }),
    ApiResponse({ status: 400, description: 'Invalid input data' })
  );
}

export function ApiDeleteBloq() {
    return applyDecorators(
      ApiOperation({ summary: 'Delete a bloq.' }),
      ApiParam({ name: 'id', description: 'Bloq UUID' }),
      ApiResponse({ status: 204, description: 'Bloq deleted successfully' }),
      ApiResponse({ status: 404, description: 'Bloq not found' })
    );
}