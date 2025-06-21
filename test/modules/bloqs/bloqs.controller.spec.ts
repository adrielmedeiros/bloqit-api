import { Test, TestingModule } from '@nestjs/testing';
import { BloqsController } from '../../../src/modules/bloqs/bloqs.controller';
import { BloqsService } from '../../../src/modules/bloqs/bloqs.service';

describe('BloqsController', () => {
    let controller: BloqsController;
    let service: BloqsService;

    const mockBloq = {
        id: 'test-id-123',
        title: 'Test Bloq',
        address: 'Test Address',
    };

    const mockService = {
        create: jest.fn().mockResolvedValue(mockBloq),
        findAll: jest.fn().mockResolvedValue([mockBloq]),
        findOne: jest.fn().mockResolvedValue(mockBloq),
        update: jest.fn().mockResolvedValue(mockBloq),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        controllers: [BloqsController],
        providers: [{ provide: BloqsService, useValue: mockService }],
        }).compile();

        controller = module.get<BloqsController>(BloqsController);
        service = module.get<BloqsService>(BloqsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a bloq', async () => {
        const createDto = { id: 'test-id', title: 'Test', address: 'Test Address' };
        const result = await controller.create(createDto);
        
        expect(service.create).toHaveBeenCalledWith(createDto);
        expect(result).toEqual(mockBloq);
    });

    it('should find all bloqs', async () => {
        const result = await controller.findAll();
        
        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockBloq]);
    });

    it('should find one bloq', async () => {
        const result = await controller.findOne('test-id-123');
        
        expect(service.findOne).toHaveBeenCalledWith('test-id-123');
        expect(result).toEqual(mockBloq);
    });

    it('should update a bloq', async () => {
        const updateDto = { title: 'Updated' };
        const result = await controller.update('test-id-123', updateDto);
        
        expect(service.update).toHaveBeenCalledWith('test-id-123', updateDto);
        expect(result).toEqual(mockBloq);
    });

    it('should remove a bloq', async () => {
        const result = await controller.remove('test-id-123');
        
        expect(service.remove).toHaveBeenCalledWith('test-id-123');
        expect(result).toBeUndefined();
    });
});