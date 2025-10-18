import { IsString } from 'class-validator'

export class LoginDto {
    @IsString({ message: 'Email is required' })
    identifier: string

    @IsString({ message: 'Password is required' })
    password: string
}
