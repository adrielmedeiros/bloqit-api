import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LockersService } from '../../../src/modules/lockers/lockers.service';
import { Locker } from '../../../src/modules/lockers/locker.schema';
import { Bloq } from '../../../src/modules/bloqs/bloq.schema';
import { LockerStatus } from '../../../src/shared/enums';

describe('LockersService', () => {
  let service: LockersService;
  let mockLockerModel: any;
  let mockBloqModel: any;

  const mockLocker = {
    id: 'test-locker-123',
    bloqId: 'test-bloq-123',
    status: LockerStatus.CLOSED,
    isOccupied: false,
  };

  const mockBloq = {
    id: 'test-bloq-123',
    title: 'Test Bloq',
    address: 'Test Address',
  };

  const mockAvailableLocker = {
    id: 'available-locker-123',
    bloqId: 'test-bloq-123',
    status: LockerStatus.CLOSED,
    isOccupied: false,
  };

  beforeEach(async () => {
    mockLockerModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockLocker),
    }));

    mockBloqModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockBloq) }),
    };

    mockLockerModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLocker]) });
    mockLockerModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    mockLockerModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    mockLockerModel.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockersService,
        { provide: getModelToken(Locker.name), useValue: mockLockerModel },
        { provide: getModelToken(Bloq.name), useValue: mockBloqModel }, // ← Add this
      ],
    }).compile();

    service = module.get<LockersService>(LockersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a locker when bloq exists', async () => {
    const createDto = {
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      status: LockerStatus.CLOSED,
      isOccupied: false,
    };

    const result = await service.create(createDto);
    expect(mockBloqModel.findOne).toHaveBeenCalledWith({ id: 'test-bloq-123' });
    expect(result).toEqual(mockLocker);
  });

  it('should throw BadRequestException when bloq does not exist', async () => {
    mockBloqModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const createDto = {
      id: 'test-locker-123',
      bloqId: 'non-existent-bloq',
      status: LockerStatus.CLOSED,
      isOccupied: false,
    };

    await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    await expect(service.create(createDto)).rejects.toThrow('Bloq with ID non-existent-bloq not found');
  });

  it('should find all lockers', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockLocker]);
  });

  it('should find one locker', async () => {
    const result = await service.findOne('test-locker-123');
    expect(result).toEqual(mockLocker);
  });

  it('should throw NotFoundException when locker not found', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should update a locker', async () => {
    const updateDto = { status: LockerStatus.OPEN };
    const result = await service.update('test-locker-123', updateDto);
    expect(result).toEqual(mockLocker);
  });

  it('should validate bloq exists when updating bloqId', async () => {
    const updateDto = { bloqId: 'new-bloq-123' };
    await service.update('test-locker-123', updateDto);
    expect(mockBloqModel.findOne).toHaveBeenCalledWith({ id: 'new-bloq-123' });
  });

  it('should throw BadRequestException when updating with non-existent bloqId', async () => {
    mockBloqModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    const updateDto = { bloqId: 'non-existent-bloq' };
    await expect(service.update('test-locker-123', updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should delete a locker', async () => {
    await service.remove('test-locker-123');
    // Just verify it doesn't throw
  });

  it('should find lockers by bloqId', async () => {
    mockLockerModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLocker]) });

    const result = await service.findByBloqId('test-bloq-123');
    expect(result).toEqual([mockLocker]);
  });

  it('should find available lockers in a bloq', async () => {
    mockLockerModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockAvailableLocker]) });

    const result = await service.findAvailableInBloq('test-bloq-123');
    expect(result).toEqual([mockAvailableLocker]);
  });

  it('should mark locker as occupied', async () => {
    const occupiedLocker = { ...mockLocker, isOccupied: true };
    mockLockerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(occupiedLocker) });

    const result = await service.markAsOccupied('test-locker-123');
    expect(result.isOccupied).toBe(true);
  });

  it('should mark locker as free', async () => {
    const freeLocker = { ...mockLocker, isOccupied: false };
    mockLockerModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(freeLocker) });

    const result = await service.markAsFree('test-locker-123');
    expect(result.isOccupied).toBe(false);
  });
});