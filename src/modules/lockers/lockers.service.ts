import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Locker, LockerDocument, LockerResponse, LockersResponse } from './locker.schema';
import { Bloq, BloqDocument } from '../bloqs/bloq.schema';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';
import { LockerStatus } from '../../shared/enums';

@Injectable()
export class LockersService {
    constructor(
        @InjectModel(Locker.name) private lockerModel: Model<LockerDocument>,
        @InjectModel(Bloq.name) private bloqModel: Model<BloqDocument>
    ) {}
    
    async create(
        createLockerDto: CreateLockerDto
    ): Promise<LockerResponse> {
        const bloq = await this.bloqModel.findOne({ id: createLockerDto.bloqId }).exec();
        if (!bloq) {
            throw new BadRequestException(`Bloq with ID ${createLockerDto.bloqId} not found`);
        }

        const lockerId = createLockerDto.id || randomUUID();
        const existingLocker = await this.lockerModel.findOne({ id: lockerId }).exec();

        if (existingLocker) {
            throw new BadRequestException(`Locker with ID ${lockerId} already exists`);
        }

        const status = createLockerDto.status ?? LockerStatus.OPEN;
        const isOccupied = createLockerDto.isOccupied ?? false;

        this.preventOpenOccupiedConflict(status, isOccupied);

        const lockerData = {
            bloqId: createLockerDto.bloqId,
            id: lockerId,
            status,
            isOccupied
        };

        const locker = new this.lockerModel(lockerData);
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

        const currentLocker = await this.lockerModel.findOne({ id }).exec();
        if (!currentLocker) {
            throw new NotFoundException(`Locker with ID ${id} not found`);
        }

        const finalStatus = updateLockerDto.status ?? currentLocker.status;
        const finalIsOccupied = updateLockerDto.isOccupied ?? currentLocker.isOccupied;

        this.preventOpenOccupiedConflict(finalStatus, finalIsOccupied);

        const locker = await this.lockerModel
            .findOneAndUpdate({ id }, updateLockerDto, { new: true })
            .exec();

        return locker!;
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

    private preventOpenOccupiedConflict(status: LockerStatus, isOccupied: boolean): void {
        if (status === LockerStatus.OPEN && isOccupied) {
            throw new BadRequestException('Locker cannot be occupied when status is OPEN');
        }
    }
}