import { Test, TestingModule } from '@nestjs/testing';
import { RentsController } from '../../../src/modules/rents/rents.controller';
import { RentsService } from '../../../src/modules/rents/rents.service';
import { RentStatus, RentSize } from '../../../src/shared/enums';

describe('RentsController', () => {
  let controller: RentsController;
  let service: RentsService;

  const mockRent = {
    id: 'test-rent-123',
    lockerId: null,
    weight: 5,
    size: RentSize.M,
    status: RentStatus.CREATED,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockRent),
    findAll: jest.fn().mockResolvedValue([mockRent]),
    findOne: jest.fn().mockResolvedValue(mockRent),
    update: jest.fn().mockResolvedValue(mockRent),
    remove: jest.fn().mockResolvedValue(undefined),
    dropOff: jest.fn().mockResolvedValue({ ...mockRent, status: RentStatus.WAITING_PICKUP }),
    pickUp: jest.fn().mockResolvedValue({ ...mockRent, status: RentStatus.DELIVERED }),
    findByStatus: jest.fn().mockResolvedValue([mockRent]),
    findByLocker: jest.fn().mockResolvedValue(mockRent),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentsController],
      providers: [{ provide: RentsService, useValue: mockService }],
    }).compile();

    controller = module.get<RentsController>(RentsController);
    service = module.get<RentsService>(RentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Basic CRUD endpoints
  it('should create a rent', async () => {
    const createDto = {
      id: 'test-rent-123',
      weight: 5,
      size: RentSize.M,
    };

    const result = await controller.create(createDto);
    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(mockRent);
  });

  it('should find all rents', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRent]);
  });

  it('should find one rent', async () => {
    const result = await controller.findOne('test-rent-123');
    expect(service.findOne).toHaveBeenCalledWith('test-rent-123');
    expect(result).toEqual(mockRent);
  });

  it('should update a rent', async () => {
    const updateDto = { weight: 7 };
    const result = await controller.update('test-rent-123', updateDto);
    expect(service.update).toHaveBeenCalledWith('test-rent-123', updateDto);
    expect(result).toEqual(mockRent);
  });

  it('should remove a rent', async () => {
    const result = await controller.remove('test-rent-123');
    expect(service.remove).toHaveBeenCalledWith('test-rent-123');
    expect(result).toBeUndefined();
  });

  // Business logic endpoints
  it('should drop off a rent', async () => {
    const dropOffDto = { bloqId: 'test-bloq-123' };
    const result = await controller.dropOff('test-rent-123', dropOffDto);
    expect(service.dropOff).toHaveBeenCalledWith('test-rent-123', 'test-bloq-123');
  });

  it('should pick up a rent', async () => {
    const result = await controller.pickUp('test-rent-123');
    expect(service.pickUp).toHaveBeenCalledWith('test-rent-123');
  });

  it('should find rents by status using query parameter', async () => {
    const result = await controller.findAll(RentStatus.CREATED);
    expect(service.findByStatus).toHaveBeenCalledWith(RentStatus.CREATED);
    expect(result).toEqual([mockRent]);
  });

  it('should find all rents when no status query parameter', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockRent]);
  });
});