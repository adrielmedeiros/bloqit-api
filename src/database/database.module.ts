import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Bloq, BloqSchema } from '../modules/bloqs/bloq.schema';
import { Locker, LockerSchema } from '../modules/lockers/locker.schema';
import { Rent, RentSchema } from '../modules/rents/rent.schema';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Bloq.name, schema: BloqSchema },
      { name: Locker.name, schema: LockerSchema },
      { name: Rent.name, schema: RentSchema },
    ]),
  ],
  providers: [SeederService],
  exports: [MongooseModule],
})
export class DatabaseModule {}