import { IsNotEmpty, IsUUID, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { RentSize } from '../../../shared/enums/rent-size.enum';

export class CreateRentDto {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    @IsPositive()
    weight: number;

    @IsEnum(RentSize)
    @IsNotEmpty()
    size: RentSize;
}