import { IsNotEmpty, IsUUID, IsEnum, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { RentSize } from '../../../shared/enums/rent-size.enum';

export class CreateRentDto {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsNumber()
    @IsPositive()
    weight: number;

    @IsEnum(RentSize)
    @IsNotEmpty()
    size: RentSize;
}