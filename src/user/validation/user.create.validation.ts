import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MaxLength,
    MinLength,
    IsMongoId,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { IsPasswordStrong, IsStart } from 'src/utils/request/request.decorator';

export class UserCreateValidation {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    @Type(() => String)
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly firstName: string;

    @IsString()
    @IsOptional()
    @ValidateIf((e) => e.lastName !== '')
    @MinLength(1)
    @MaxLength(30)
    @Type(() => String)
    readonly lastName?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(14)
    @Type(() => String)
    @IsStart(['628'])
    readonly mobileNumber: string;

    @IsNotEmpty()
    @IsMongoId()
    readonly role: string;

    @IsNotEmpty()
    @IsPasswordStrong()
    readonly password: string;
}
