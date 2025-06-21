import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { LockersService } from '../../../src/modules/lockers/lockers.service';
import { Locker } from '../../../src/modules/lockers/locker.schema';
import { LockerStatus } from '../../../src/shared/enums';

describe('LockersService', () => {
  let service: LockersService;
  let mockModel: any; // Add this line

  const mockLocker = {
    id: 'test-locker-123',
    bloqId: 'test-bloq-123',
    status: LockerStatus.CLOSED,
    isOccupied: false,
  };

  const mockAvailableLocker = {
    id: 'available-locker-123',
    bloqId: 'test-bloq-123',
    status: LockerStatus.CLOSED,
    isOccupied: false,
  };

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockLocker),
    }));

    // Now TypeScript won't complain
    mockModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLocker]) });
    mockModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    mockModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    mockModel.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockersService,
        { provide: getModelToken(Locker.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<LockersService>(LockersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Basic CRUD tests
  it('should create a locker', async () => {
    const createDto = {
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      status: LockerStatus.CLOSED,
      isOccupied: false,
    };

    const result = await service.create(createDto);
    expect(result).toEqual(mockLocker);
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
    mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should update a locker', async () => {
    const updateDto = { status: LockerStatus.OPEN };
    const result = await service.update('test-locker-123', updateDto);
    expect(result).toEqual(mockLocker);
  });

  it('should delete a locker', async () => {
    await service.remove('test-locker-123');
    // Just verify it doesn't throw
  });

  // Business logic tests
  it('should find lockers by bloqId', async () => {
    mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLocker]) });

    const result = await service.findByBloqId('test-bloq-123');
    expect(result).toEqual([mockLocker]);
  });

  it('should find available lockers in a bloq', async () => {
    mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockAvailableLocker]) });

    const result = await service.findAvailableInBloq('test-bloq-123');
    expect(result).toEqual([mockAvailableLocker]);
  });

  it('should mark locker as occupied', async () => {
    const occupiedLocker = { ...mockLocker, isOccupied: true };
    mockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(occupiedLocker) });

    const result = await service.markAsOccupied('test-locker-123');
    expect(result.isOccupied).toBe(true);
  });

  it('should mark locker as free', async () => {
    const freeLocker = { ...mockLocker, isOccupied: false };
    mockModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(freeLocker) });

    const result = await service.markAsFree('test-locker-123');
    expect(result.isOccupied).toBe(false);
  });
});