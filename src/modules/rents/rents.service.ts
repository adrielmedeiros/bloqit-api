import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rent, RentDocument, RentResponse, RentsResponse } from './rent.schema';
import { Locker, LockerDocument } from '../lockers/locker.schema';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { RentStatus } from '../../shared/enums';

@Injectable()
export class RentsService {
    constructor(
        @InjectModel(Rent.name) private rentModel: Model<RentDocument>,
        @InjectModel(Locker.name) private lockerModel: Model<LockerDocument>,
    ) {}
    
    async create(
        createRentDto: CreateRentDto
    ): Promise<RentResponse> {
        const rent = new this.rentModel({
            ...createRentDto,
            status: RentStatus.CREATED,
            lockerId: null,
        });
        return rent.save();
    }

    async findAll(): Promise<RentsResponse> {
        return this.rentModel.find().exec();
    }

    async findOne(
        id: string
    ): Promise<RentResponse> {
        const rent = await this.rentModel.findOne({ id }).exec();

        if (!rent) {
            throw new NotFoundException(`Rent with ID ${id} not found`);
        }
        return rent;
    }

    async update(
        id: string,
        updateRentDto: UpdateRentDto
    ): Promise<RentResponse> {
        const rent = await this.rentModel
            .findOneAndUpdate({ id }, updateRentDto, { new: true })
            .exec();

        if (!rent) {
            throw new NotFoundException(`Rent with ID ${id} not found`);
        }
        return rent;
    }

    async remove(id: string): Promise<void> {
        const result = await this.rentModel.deleteOne({ id }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Rent with ID ${id} not found`);
        }
    }

    async dropOff(id: string, bloqId: string): Promise<RentResponse> {
        // Find the rent
        const rent = await this.findOne(id);
        
        // Validate rent status
        if (rent.status !== RentStatus.CREATED) {
            throw new BadRequestException(`Rent with ID ${id} is not in CREATED status`);
        }

        // Find an available locker in the specified bloq
        const availableLocker = await this.lockerModel
            .findOne({ 
                bloqId, 
                isOccupied: false 
            }).exec();

        if (!availableLocker) {
            throw new BadRequestException(`No available lockers in bloq ${bloqId}`);
        }

        // Mark locker as occupied
        await this.lockerModel
            .findOneAndUpdate(
                { id: availableLocker.id },
                { isOccupied: true },
                { new: true }
            ).exec();

        // Update rent
        const updatedRent = await this.rentModel
            .findOneAndUpdate(
                { id },
                { lockerId: availableLocker.id, status: RentStatus.WAITING_PICKUP, droppedOffAt: new Date() },
                { new: true }
            ).exec();

        return updatedRent!;
    }

    async pickUp(id: string): Promise<RentResponse> {
        // Find the rent
        const rent = await this.findOne(id);
        
        // Validate rent status
        if (rent.status !== RentStatus.WAITING_PICKUP) {
            throw new BadRequestException(`Rent with ID ${id} is not ready for pickup`);
        }

        // Free the locker
        if (rent.lockerId) {
            await this.lockerModel
                .findOneAndUpdate( { id: rent.lockerId }, { isOccupied: false }, { new: true })
                .exec();
        }

        // Update rent
        const updatedRent = await this.rentModel
            .findOneAndUpdate( { id }, { status: RentStatus.DELIVERED, pickedUpAt: new Date() }, { new: true })
            .exec();

        return updatedRent!;
    }

    async findByStatus(status: RentStatus): Promise<RentsResponse> {
        return this.rentModel.find({ status }).exec();
    }

    async findByLocker(lockerId: string): Promise<RentResponse | null> {
        return this.rentModel.findOne({ lockerId }).exec();
    }
}
