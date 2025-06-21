import { IsNotEmpty, IsUUID } from 'class-validator';

export class DropOffRentDto {
    @IsUUID()
    @IsNotEmpty()
    bloqId: string;
}