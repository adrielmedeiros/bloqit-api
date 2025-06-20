import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LockerStatus } from '../../shared/enums/locker-status.enum';

export type LockerDocument = Locker & Document;

@Schema({ timestamps: true })
export class Locker {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    bloqId: string;

    @Prop({ required: true, enum: LockerStatus })
    status: LockerStatus;

    @Prop({ required: true, default: false })
    isOccupied: boolean;
}

export const LockerSchema = SchemaFactory.createForClass(Locker);