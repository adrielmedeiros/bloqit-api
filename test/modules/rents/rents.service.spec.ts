import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RentsService } from '../../../src/modules/rents/rents.service';
import { Rent } from '../../../src/modules/rents/rent.schema';
import { Locker } from '../../../src/modules/lockers/locker.schema';
import { RentStatus, RentSize, LockerStatus } from '../../../src/shared/enums';

describe('RentsService', () => {
    let service: RentsService;
    let mockRentModel: any;
    let mockLockerModel: any;

    const mockRent = {
        id: 'test-rent-123',
        lockerId: null,
        weight: 5,
        size: RentSize.M,
        status: RentStatus.CREATED,
    };

    const mockRentWithLocker = {
        id: 'test-rent-456',
        lockerId: 'test-locker-123',
        weight: 3,
        size: RentSize.S,
        status: RentStatus.WAITING_PICKUP,
        droppedOffAt: new Date(),
    };

    const mockAvailableLocker = {
        id: 'available-locker-123',
        bloqId: 'test-bloq-123',
        status: LockerStatus.CLOSED,
        isOccupied: false,
    };

    beforeEach(async () => {
        mockRentModel = jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(mockRent),
        }));

        mockLockerModel = {
            findOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockAvailableLocker)
            }),
            findOneAndUpdate: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockAvailableLocker)
            }),
        };

        mockRentModel.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockRent]) });
        mockRentModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
        mockRentModel.findOneAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRent) });
        mockRentModel.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RentsService,
                { provide: getModelToken(Rent.name), useValue: mockRentModel },
                { provide: getModelToken(Locker.name), useValue: mockLockerModel },
            ]
        }).compile();

        service = module.get<RentsService>(RentsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // Basic CRUD tests
    it('should create a rent with CREATED status', async () => {
        const createDto = {
            id: 'test-rent-123',
            weight: 5,
            size: RentSize.M,
        };

        const result = await service.create(createDto);
        expect(result.status).toBe(RentStatus.CREATED);
        expect(result.lockerId).toBeNull();
    });

    it('should find all rents', async () => {
        const result = await service.findAll();
        expect(result).toEqual([mockRent]);
    });

    it('should find one rent', async () => {
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRent) });
        
        const result = await service.findOne('test-rent-123');
        expect(result).toEqual(mockRent);
    });

    it('should throw NotFoundException when rent not found', async () => {
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
        
        await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should update a rent', async () => {
        mockRentModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRent) });

        const updateDto = { weight: 7 };
        const result = await service.update('test-rent-123', updateDto);
        expect(result).toEqual(mockRent);
    });

    it('should delete a rent', async () => {
        await service.remove('test-rent-123');
    });

    it('should drop off a rent and assign locker', async () => {
        const rentToUpdate = { ...mockRent, status: RentStatus.CREATED };
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(rentToUpdate) });
        
        const updatedRent = {
            ...rentToUpdate,
            lockerId: 'available-locker-123',
            status: RentStatus.WAITING_PICKUP,
            droppedOffAt: expect.any(Date),
        };
        mockRentModel.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedRent) });

        const result = await service.dropOff('test-rent-123', 'test-bloq-123');
        
        expect(result.status).toBe(RentStatus.WAITING_PICKUP);
        expect(result.lockerId).toBe('available-locker-123');
        expect(mockLockerModel.findOneAndUpdate).toHaveBeenCalledWith(
            { id: 'available-locker-123' },
            { isOccupied: true, status: LockerStatus.CLOSED },
            { new: true }
        );
    });

    it('should throw BadRequestException when dropping off non-CREATED rent', async () => {
        const rentInProgress = {
            ...mockRent,
            status: RentStatus.WAITING_PICKUP
        };
        mockRentModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(rentInProgress)
        });

        await expect(service.dropOff('test-rent-123', 'test-bloq-123')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no available lockers', async () => {
        const rentToUpdate = { ...mockRent, status: RentStatus.CREATED };
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(rentToUpdate) });
        mockLockerModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

        await expect(service.dropOff('test-rent-123', 'test-bloq-123')).rejects.toThrow(BadRequestException);
    });

    it('should pick up a rent and free locker', async () => {
        const rentToPickUp = {
            ...mockRentWithLocker,
            status: RentStatus.WAITING_PICKUP
        };
        mockRentModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(rentToPickUp)
        });
        
        const deliveredRent = {
            ...rentToPickUp,
            status: RentStatus.DELIVERED,
            pickedUpAt: expect.any(Date),
        };
        mockRentModel.findOneAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue(deliveredRent)
        });

        const result = await service.pickUp('test-rent-456');
        
        expect(result.status).toBe(RentStatus.DELIVERED);
        expect(mockLockerModel.findOneAndUpdate).toHaveBeenCalledWith(
            { id: 'test-locker-123' },
            { isOccupied: false, status: LockerStatus.OPEN },
            { new: true }
        );
    });

    it('should throw BadRequestException when picking up non-WAITING_PICKUP rent', async () => {
        const createdRent = { ...mockRent, status: RentStatus.CREATED };
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(createdRent) });

        await expect(service.pickUp('test-rent-123')).rejects.toThrow(BadRequestException);
    });

    it('should find rents by status', async () => {
        mockRentModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([mockRent]) });

        const result = await service.findByStatus(RentStatus.CREATED);
        expect(result).toEqual([mockRent]);
        expect(mockRentModel.find).toHaveBeenCalledWith({ status: RentStatus.CREATED });
    });

    it('should find rent by locker', async () => {
        mockRentModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRentWithLocker) });

        const result = await service.findByLocker('test-locker-123');
        expect(result).toEqual(mockRentWithLocker);
        expect(mockRentModel.findOne).toHaveBeenCalledWith({ lockerId: 'test-locker-123' });
    });
});