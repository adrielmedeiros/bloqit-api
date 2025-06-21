import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { Rent, RentSchema } from './rent.schema';
import { Locker, LockerSchema } from '../lockers/locker.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Rent.name, schema: RentSchema },
            { name: Locker.name, schema: LockerSchema },
        ])
    ],
    controllers: [ RentsController ],
    providers: [ RentsService ],
    exports: [ RentsService ],
})

export class RentsModule {}