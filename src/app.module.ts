import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BloqsModule } from './modules/bloqs/bloqs.module';
import { LockersModule } from './modules/lockers/lockers.module';
import { RentsModule } from './modules/rents/rents.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DatabaseModule,
    BloqsModule,
    LockersModule,
    RentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}