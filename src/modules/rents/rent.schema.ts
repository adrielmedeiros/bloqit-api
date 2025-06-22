import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RentStatus, RentSize } from '../../shared/enums';
import { ApiProperty } from '@nestjs/swagger';

export type RentDocument = Rent & Document;
export type RentResponse = RentDocument;
export type RentsResponse = RentDocument[];

@Schema({ timestamps: true })
export class Rent {
    @ApiProperty({
        description: 'Unique identifier for the rent',
        example: '40efc6fd-f10c-4561-88bf-be916613377c'
    })
    @Prop({ required: true, unique: true })
    id: string;

    @ApiProperty({
        description: 'ID of the locker this rent belongs to',
        example: '1b8d1e89-2514-4d91-b813-044bf0ce8d20',
        required: false,
        nullable: true
    })
    @Prop({ required: false, default: null, type: String })
    lockerId?: string | null;

    @ApiProperty({
        description: 'Weight of the parcel',
        example: 7
    })
    @Prop({ required: true })
    weight: number;

    @ApiProperty({
        description: 'Size category of the parcel',
        enum: RentSize,
        example: RentSize.L
    })
    @Prop({ required: true, enum: RentSize })
    size: RentSize;

    @ApiProperty({
        description: 'Current status of the rent',
        enum: RentStatus,
        example: RentStatus.WAITING_PICKUP,
        default: RentStatus.CREATED
    })
    @Prop({ required: true, enum: RentStatus, default: RentStatus.CREATED })
    status: RentStatus;

    @ApiProperty({
        description: 'Timestamp when the parcel was dropped off',
        example: '2023-12-01T14:30:00.000Z',
        required: false,
        nullable: true
    })
    @Prop()
    droppedOffAt?: Date;

    @ApiProperty({
        description: 'Timestamp when the parcel was picked up',
        example: '2023-12-03T16:45:00.000Z',
        required: false,
        nullable: true
    })
    @Prop()
    pickedUpAt?: Date;
}

export const RentSchema = SchemaFactory.createForClass(Rent);