import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RentStatus, RentSize } from '../../shared/enums';

export type RentDocument = Rent & Document;
export type RentResponse = RentDocument;
export type RentsResponse = RentDocument[];

@Schema({ timestamps: true })
export class Rent {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: false, default: null, type: String })
    lockerId?: string | null;

    @Prop({ required: true })
    weight: number;

    @Prop({ required: true, enum: RentSize })
    size: RentSize;

    @Prop({ required: true, enum: RentStatus, default: RentStatus.CREATED })
    status: RentStatus;

    @Prop()
    droppedOffAt?: Date;

    @Prop()
    pickedUpAt?: Date;
}

export const RentSchema = SchemaFactory.createForClass(Rent);