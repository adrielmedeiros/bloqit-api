import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bloq, BloqDocument } from '../modules/bloqs/bloq.schema';
import { Locker, LockerDocument } from '../modules/lockers/locker.schema';
import { Rent, RentDocument } from '../modules/rents/rent.schema';
import bloqsData from './data/bloqs.json';
import lockersData from './data/lockers.json';
import rentsData from './data/rents.json';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectModel(Bloq.name) private bloqModel: Model<BloqDocument>,
    @InjectModel(Locker.name) private lockerModel: Model<LockerDocument>,
    @InjectModel(Rent.name) private rentModel: Model<RentDocument>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    try {
      // Check if ALL data already exists
      const bloqCount = await this.bloqModel.countDocuments();
      const lockerCount = await this.lockerModel.countDocuments();
      const rentCount = await this.rentModel.countDocuments();
      
      if (bloqCount > 0 && lockerCount > 0 && rentCount > 0) {
        console.log('Database already fully seeded');
        return;
      }

      console.log(`Current counts - Bloqs: ${bloqCount}, Lockers: ${lockerCount}, Rents: ${rentCount}`);

      // Seed missing data
      if (bloqCount === 0) {
        console.log('Seeding Bloqs...');
        await this.bloqModel.insertMany(bloqsData);
        console.log(`Seeded ${bloqsData.length} bloqs`);
      }

      if (lockerCount === 0) {
        console.log('Seeding Lockers...');
        await this.lockerModel.insertMany(lockersData);
        console.log(`Seeded ${lockersData.length} lockers`);
      }

      if (rentCount === 0) {
        console.log('Seeding Rents...');
        await this.rentModel.insertMany(rentsData);
        console.log(`Seeded ${rentsData.length} rents`);
      }

      console.log('Database seeding completed!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}