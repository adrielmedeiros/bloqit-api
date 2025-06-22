import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { LockerStatus } from '../../shared/enums/locker-status.enum';

export type LockerDocument = Locker & Document;
export type LockerResponse = LockerDocument;
export type LockersResponse = LockerDocument[];

@Schema({ timestamps: true })
export class Locker {
    @ApiProperty({
        description: 'Unique identifier for the locker',
        example: '1b8d1e89-2514-4d91-b813-044bf0ce8d20'
    })
    @Prop({ required: true, unique: true })
    id: string;

    @ApiProperty({
        description: 'ID of the bloq this locker belongs to',
        example: 'c3ee858c-f3d8-45a3-803d-e080649bbb6f'
    })
    @Prop({ required: true })
    bloqId: string;

    @ApiProperty({
        description: 'Current status of the locker',
        enum: LockerStatus,
        example: LockerStatus.CLOSED
    })
    @Prop({ required: true, enum: LockerStatus })
    status: LockerStatus;

    @ApiProperty({
        description: 'Whether the locker is currently occupied',
        example: true,
        default: false
    })
    @Prop({ required: true, default: false })
    isOccupied: boolean;
}

export const LockerSchema = SchemaFactory.createForClass(Locker);