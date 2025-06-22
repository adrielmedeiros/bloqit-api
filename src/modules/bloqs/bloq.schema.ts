import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type BloqDocument = Bloq & Document;

@Schema({ timestamps: true })
export class Bloq {
    @ApiProperty({
        description: 'Unique identifier for the bloq',
        example: 'c3ee858c-f3d8-45a3-803d-e080649bbb6f'
    })
    @Prop({ required: true, unique: true })
    id: string;

    @ApiProperty({
        description: 'Display name of the bloq',
        example: 'Luitton Vouis Champs Elysées'
    })
    @Prop({ required: true })
    title: string;

    @ApiProperty({
        description: 'Physical address of the bloq',
        example: '101 Av. des Champs-Élysées, 75008 Paris, France'
    })
    @Prop({ required: true })
    address: string;
}

export const BloqSchema = SchemaFactory.createForClass(Bloq);