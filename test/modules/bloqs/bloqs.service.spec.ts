import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BloqsService } from '../../../src/modules/bloqs/bloqs.service';
import { Bloq } from '../../../src/modules/bloqs/bloq.schema';

describe('BloqsService', () => {
  let service: BloqsService;
  let mockModel: any;

  const mockBloq = {
    id: 'test-id-123',
    title: 'Test Bloq',
    address: 'Test Address',
  };

  beforeEach(async () => {
    const mockSave = jest.fn().mockResolvedValue(mockBloq);

    mockModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));
    
    mockModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockBloq]) });
    mockModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBloq) });
    mockModel.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqsService,
        { provide: getModelToken(Bloq.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<BloqsService>(BloqsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a bloq', async () => {
    const createDto = {
      id: 'test-id-123',
      title: 'Test Bloq',
      address: 'Test Address',
    };

    const result = await service.create(createDto);
    
    expect(mockModel.findOne).toHaveBeenCalledWith({ id: 'test-id-123' });
    expect(mockModel).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockBloq);
  });

  it('should create a bloq with generated ID when ID not provided', async () => {
    const createDto = {
      // id not provided - should be generated
      title: 'Test Bloq',
      address: 'Test Address',
    };

    const result = await service.create(createDto);
    
    // Verify the constructor was called with generated ID
    const constructorCall = mockModel.mock.calls[0][0];
    expect(constructorCall).toMatchObject({
      title: 'Test Bloq',
      address: 'Test Address',
    });
    
    // Verify an ID was generated
    expect(constructorCall.id).toBeDefined();
    expect(typeof constructorCall.id).toBe('string');
    expect(constructorCall.id.length).toBeGreaterThan(0);
    
    expect(result).toEqual(mockBloq);
  });

  it('should throw BadRequestException when bloq ID already exists', async () => {
    // Override to return existing bloq
    mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBloq) });

    const createDto = {
      id: 'existing-bloq-123',
      title: 'Test Bloq',
      address: 'Test Address',
    };

    await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    await expect(service.create(createDto)).rejects.toThrow('Bloq with ID existing-bloq-123 already exists');
  });

  it('should find all bloqs', async () => {
    const result = await service.findAll();
    expect(mockModel.find).toHaveBeenCalled();
    expect(result).toEqual([mockBloq]);
  });

  it('should find one bloq', async () => {
    mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBloq) });

    const result = await service.findOne('test-id-123');
    expect(mockModel.findOne).toHaveBeenCalledWith({ id: 'test-id-123' });
    expect(result).toEqual(mockBloq);
  });

  it('should throw NotFoundException when bloq not found', async () => {
    await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should update a bloq', async () => {
    const updateDto = { title: 'Updated Title' };
    const result = await service.update('test-id-123', updateDto);
    
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'test-id-123' },
      updateDto,
      { new: true }
    );
    expect(result).toEqual(mockBloq);
  });

  it('should throw NotFoundException when updating non-existent bloq', async () => {
    mockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    const updateDto = { title: 'Updated Title' };
    
    await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    await expect(service.update('non-existent', updateDto)).rejects.toThrow('Bloq with ID non-existent not found');
  });

  it('should delete a bloq', async () => {
    await service.remove('test-id-123');
    expect(mockModel.deleteOne).toHaveBeenCalledWith({ id: 'test-id-123' });
  });

  it('should throw NotFoundException when deleting non-existent bloq', async () => {
    mockModel.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    
    await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
  });
});