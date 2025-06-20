import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BloqDocument = Bloq & Document;

@Schema({ timestamps: true })
export class Bloq {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    address: string;
}

export const BloqSchema = SchemaFactory.createForClass(Bloq);