import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LockersService } from './lockers.service';
import { LockersController } from './lockers.controller';
import { Locker, LockerSchema } from './locker.schema';
import { Bloq, BloqSchema } from '../bloqs/bloq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Locker.name, schema: LockerSchema },
      { name: Bloq.name, schema: BloqSchema },
    ])
  ],
  controllers: [LockersController],
  providers: [LockersService],
  exports: [LockersService],
})
export class LockersModule {}