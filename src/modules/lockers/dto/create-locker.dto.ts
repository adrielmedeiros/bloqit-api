import { IsNotEmpty, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { LockerStatus } from '../../../shared/enums/locker-status.enum';

export class CreateLockerDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  bloqId: string;

  @IsEnum(LockerStatus)
  @IsNotEmpty()
  status: LockerStatus;

  @IsBoolean()
  isOccupied: boolean;
}