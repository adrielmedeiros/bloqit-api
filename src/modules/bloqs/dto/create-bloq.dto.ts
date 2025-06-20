import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBloqDto {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    address: string;
}