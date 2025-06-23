import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Bloq, BloqDocument } from './bloq.schema';
import { CreateBloqDto } from './dto/create-bloq.dto';
import { UpdateBloqDto } from './dto/update-bloq.dto';

@Injectable()
export class BloqsService {
    constructor(
        @InjectModel(Bloq.name) private bloqModel: Model<BloqDocument>
    ) {}

    async create(createBloqDto: CreateBloqDto): Promise<BloqDocument> {
        const bloqId = createBloqDto.id || randomUUID();
        
        const existingBloq = await this.bloqModel.findOne({ id: bloqId }).exec();
        if (existingBloq) {
            throw new BadRequestException(`Bloq with ID ${bloqId} already exists`);
        }

        const bloqData = {
            ...createBloqDto,
            id: bloqId
        };
        
        const bloq = new this.bloqModel(bloqData);
        return bloq.save();
    }

    async findAll(): Promise<BloqDocument[]> {
        return this.bloqModel.find().exec();
    }

    async findOne(id: string): Promise<BloqDocument> {
        const bloq = await this.bloqModel.findOne({ id }).exec();
        if (!bloq) {
            throw new NotFoundException(`Bloq with ID ${id} not found`);
        }
        return bloq;
    }

    async update(id: string, updateBloqDto: UpdateBloqDto): Promise<BloqDocument> {
        const bloq = await this.bloqModel
            .findOneAndUpdate({ id }, updateBloqDto, { new: true })
            .exec();
        if (!bloq) {
            throw new NotFoundException(`Bloq with ID ${id} not found`);
        }
        return bloq;
    }

    async remove(id: string): Promise<void> {
        const result = await this.bloqModel.deleteOne({ id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`Bloq with ID ${id} not found`);
        }
    }
}