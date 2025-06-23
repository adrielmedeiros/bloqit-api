import { Test, TestingModule } from '@nestjs/testing';
import { LockerStatus } from '../../../src/shared/enums';
import { LockersService } from '../../../src/modules/lockers/lockers.service';
import { LockersController } from '../../../src/modules/lockers/lockers.controller';

describe('LockersController', () => {
  let controller: LockersController;
  let service: LockersService;

  const mockLocker = {
    id: 'test-locker-123',
    bloqId: 'test-bloq-123',
    status: LockerStatus.CLOSED,
    isOccupied: false,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockLocker),
    findAll: jest.fn().mockResolvedValue([mockLocker]),
    findOne: jest.fn().mockResolvedValue(mockLocker),
    update: jest.fn().mockResolvedValue(mockLocker),
    remove: jest.fn().mockResolvedValue(undefined),
    findByBloqId: jest.fn().mockResolvedValue([mockLocker]),
    findAvailableInBloq: jest.fn().mockResolvedValue([mockLocker]),
    markAsOccupied: jest.fn().mockResolvedValue({ ...mockLocker, isOccupied: true }),
    markAsFree: jest.fn().mockResolvedValue({ ...mockLocker, isOccupied: false }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LockersController],
      providers: [{ provide: LockersService, useValue: mockService }],
    }).compile();

    controller = module.get<LockersController>(LockersController);
    service = module.get<LockersService>(LockersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Basic CRUD endpoints
  it('should create a locker', async () => {
    const createDto = {
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      status: LockerStatus.CLOSED,
      isOccupied: false,
    };

    const result = await controller.create(createDto);
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockLocker);
  });

  it('should find all lockers', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockLocker]);
  });

  it('should find one locker', async () => {
    const result = await controller.findOne('test-locker-123');
    expect(service.findOne).toHaveBeenCalledWith('test-locker-123');
    expect(result).toEqual(mockLocker);
  });

  it('should update a locker', async () => {
    const updateDto = { status: LockerStatus.OPEN };
    const result = await controller.update('test-locker-123', updateDto);
    expect(service.update).toHaveBeenCalledWith('test-locker-123', updateDto);
    expect(result).toEqual(mockLocker);
  });

  it('should remove a locker', async () => {
    const result = await controller.remove('test-locker-123');
    expect(service.remove).toHaveBeenCalledWith('test-locker-123');
    expect(result).toBeUndefined();
  });

  // Business logic endpoints
  it('should find lockers by bloq', async () => {
    const result = await controller.findByBloq('test-bloq-123');
    expect(service.findByBloqId).toHaveBeenCalledWith('test-bloq-123');
    expect(result).toEqual([mockLocker]);
  });

  it('should find available lockers in bloq', async () => {
    const result = await controller.findAvailableInBloq('test-bloq-123');
    expect(service.findAvailableInBloq).toHaveBeenCalledWith('test-bloq-123');
    expect(result).toEqual([mockLocker]);
  });
});