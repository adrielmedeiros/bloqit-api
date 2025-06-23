import { IsNotEmpty, IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { LockerStatus } from '../../../shared/enums/locker-status.enum';

export class CreateLockerDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  bloqId: string;

  @IsOptional()
  @IsEnum(LockerStatus)
  status?: LockerStatus;

  @IsOptional()
  @IsBoolean()
  isOccupied?: boolean;
}