import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Locker, LockerDocument, LockerResponse, LockersResponse } from './locker.schema';
import { Bloq, BloqDocument } from '../bloqs/bloq.schema';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';

@Injectable()
export class LockersService {
    constructor(
        @InjectModel(Locker.name) private lockerModel: Model<LockerDocument>,
        @InjectModel(Bloq.name) private bloqModel: Model<BloqDocument>
    ) {}
    
    async create(
        createLockerDto: CreateLockerDto
    ): Promise<LockerResponse> {
        // Can only create a locker for a bloq that exists
        const bloq = await this.bloqModel.findOne({ id: createLockerDto.bloqId }).exec();
        if (!bloq) {
            throw new BadRequestException(`Bloq with ID ${createLockerDto.bloqId} not found`);
        }
        // TODO: Can lockers be created with the same ID? Validate that the locker ID is unique.
        // TODO: Don't need to send id, can just generate it in the service
        // TODO: Can lockers be created with status OPEN and isOccupied = true? Validate that the locker is not occupied

        const locker = new this.lockerModel(createLockerDto);
        return locker.save();
    }

    async findAll(): Promise<LockersResponse> {
        return this.lockerModel
            .find()
            .exec();
    }

    async findOne(id: string): Promise<LockerResponse> {
        const locker = await this.lockerModel.findOne({ id }).exec();

        if (!locker) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }
        return locker;
    }

    async update(
        id: string,
        updateLockerDto: UpdateLockerDto
    ): Promise<LockerResponse> {
        if (updateLockerDto.bloqId) {
            const bloq = await this.bloqModel.findOne({ id: updateLockerDto.bloqId }).exec();
            if (!bloq) {
                throw new BadRequestException(`Bloq with ID ${updateLockerDto.bloqId} not found`);
            }
        }

        const locker = await this.lockerModel
            .findOneAndUpdate({ id }, updateLockerDto, { new: true })
            .exec();

        if (!locker) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }

        return locker;
    }

    async remove(id: string): Promise<void> {
        const result = await this.lockerModel
            .deleteOne({ id })
            .exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }
    }

    async findByBloqId(
        bloqId: string
    ): Promise<LockersResponse> {
        return this.lockerModel
            .find({ bloqId })
            .exec();
    }

    async findAvailableInBloq(
        bloqId: string
    ): Promise<LockersResponse> {
        return this.lockerModel
            .find({ bloqId, isOccupied: false })
            .exec();
    }

    async markAsOccupied(
        id: string
    ): Promise<LockerResponse> {

        const locker = await this.lockerModel
            .findOneAndUpdate({ id }, { isOccupied: true }, { new: true })
            .exec();

        if (!locker) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }
        return locker;
    }

    async markAsFree(
        id: string
    ): Promise<LockerResponse> {

        const locker = await this.lockerModel
            .findOneAndUpdate({ id },{ isOccupied: false },{ new: true })
            .exec();

        if (!locker) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }
        return locker;
    }
}