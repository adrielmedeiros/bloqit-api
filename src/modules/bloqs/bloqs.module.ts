import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloqsService } from './bloqs.service';
import { BloqsController } from './bloqs.controller';
import { Bloq, BloqSchema } from './bloq.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Bloq.name, schema: BloqSchema }])
    ],
    controllers: [ BloqsController ],
    providers: [ BloqsService ],
    exports: [ BloqsService ],
})
export class BloqsModule {}