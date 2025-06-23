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
    jest.clearAllMocks();

    mockLockerModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockLocker),
    }));

    mockBloqModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBloq)
      }),
    };

    mockLockerModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockLocker])
    });

    mockLockerModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });

    mockLockerModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockLocker)
    });

    mockLockerModel.deleteOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        deletedCount: 1
      })
    });

    const module: TestingModule = await Test.createTestingModule({
      providers:
      [
        LockersService,
        { provide: getModelToken(Locker.name), useValue: mockLockerModel },
        { provide: getModelToken(Bloq.name), useValue: mockBloqModel },
      ],
    }).compile();

    service = module.get<LockersService>(LockersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a locker when bloq exists', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

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

  it('should create a locker with defaults when only id and bloqId are provided', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const createDto = {
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      // status and isOccupied not provided - should use defaults
    };

    const result = await service.create(createDto);
    
    expect(mockBloqModel.findOne).toHaveBeenCalledWith({ id: 'test-bloq-123' });
    expect(mockLockerModel.findOne).toHaveBeenCalledWith({ id: 'test-locker-123' });
    expect(result).toEqual(mockLocker);
    
    // Verify the constructor was called with the correct data including defaults
    expect(mockLockerModel).toHaveBeenCalledWith({
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      status: LockerStatus.OPEN, // Default value
      isOccupied: false // Default value
    });
  });

  it('should generate an ID when not provided and create locker with defaults', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const createDto = {
      // id not provided - should be generated
      bloqId: 'test-bloq-123',
      // status and isOccupied not provided - should use defaults
    };

    const result = await service.create(createDto);
    
    expect(mockBloqModel.findOne).toHaveBeenCalledWith({ id: 'test-bloq-123' });
    expect(result).toEqual(mockLocker);
    
    // Verify the constructor was called with generated ID and defaults
    const constructorCall = mockLockerModel.mock.calls[0][0];
    expect(constructorCall).toMatchObject({
      bloqId: 'test-bloq-123',
      status: LockerStatus.OPEN, // Default value
      isOccupied: false // Default value
    });
    
    // Verify an ID was generated (should be a UUID)
    expect(constructorCall.id).toBeDefined();
    expect(typeof constructorCall.id).toBe('string');
    expect(constructorCall.id.length).toBeGreaterThan(0);
    
    // Verify findOne was called with the generated ID
    expect(mockLockerModel.findOne).toHaveBeenCalledWith({ id: constructorCall.id });
  });

  it('should throw BadRequestException for invalid OPEN + occupied combination on create', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const createDto = {
      id: 'test-locker-123',
      bloqId: 'test-bloq-123',
      status: LockerStatus.OPEN,
      isOccupied: true // Invalid combination
    };

    await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    await expect(service.create(createDto)).rejects.toThrow('Locker cannot be occupied when status is OPEN');
  });

  it('should throw BadRequestException when bloq does not exist during create', async () => {
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

  it('should throw BadRequestException when locker ID already exists', async () => {
    // Mock to return existing locker
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });

    const createDto = {
      id: 'test-locker-123', // This ID already exists
      bloqId: 'test-bloq-123',
      status: LockerStatus.CLOSED,
      isOccupied: false,
    };

    await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    await expect(service.create(createDto)).rejects.toThrow('Locker with ID test-locker-123 already exists');
  });

  it('should find one locker', async () => {
    // For findOne, we want to return the locker
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    
    const result = await service.findOne('test-locker-123');
    expect(result).toEqual(mockLocker);
  });

  it('should throw NotFoundException when locker not found', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should update a locker', async () => {
    // For update, we need the current locker to exist
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    
    const updateDto = { status: LockerStatus.OPEN };
    const result = await service.update('test-locker-123', updateDto);
    expect(result).toEqual(mockLocker);
  });

  it('should validate bloq exists when updating bloqId', async () => {
    // For update, we need the current locker to exist
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockLocker) });
    
    const updateDto = { bloqId: 'new-bloq-123' };
    await service.update('test-locker-123', updateDto);
    expect(mockBloqModel.findOne).toHaveBeenCalledWith({ id: 'new-bloq-123' });
  });

  it('should throw BadRequestException when updating with non-existent bloqId', async () => {
    mockBloqModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    
    const updateDto = { bloqId: 'non-existent-bloq' };
    await expect(service.update('test-locker-123', updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when updating non-existent locker', async () => {
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    const updateDto = { status: LockerStatus.OPEN };
    await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    await expect(service.update('non-existent', updateDto)).rejects.toThrow('Locker with ID non-existent not found');
  });

  it('should throw BadRequestException for invalid OPEN + occupied combination on update', async () => {
    const currentLocker = { ...mockLocker, status: LockerStatus.CLOSED, isOccupied: false };
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(currentLocker) });

    const updateDto = { status: LockerStatus.OPEN, isOccupied: true };
    
    await expect(service.update('test-locker-123', updateDto)).rejects.toThrow(BadRequestException);
    await expect(service.update('test-locker-123', updateDto)).rejects.toThrow('Locker cannot be occupied when status is OPEN');
  });

  it('should validate when updating status to OPEN but locker is already occupied', async () => {
    const occupiedLocker = { ...mockLocker, status: LockerStatus.CLOSED, isOccupied: true };
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(occupiedLocker) });

    const updateDto = { status: LockerStatus.OPEN }; // Trying to open an occupied locker
    
    await expect(service.update('test-locker-123', updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should validate when updating isOccupied to true but locker is OPEN', async () => {
    const openLocker = { ...mockLocker, status: LockerStatus.OPEN, isOccupied: false };
    mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(openLocker) });

    const updateDto = { isOccupied: true }; // Trying to occupy an OPEN locker
    
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
});