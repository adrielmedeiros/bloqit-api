import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBloqDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    address: string;
}