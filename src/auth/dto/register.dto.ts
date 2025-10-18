import { IsString } from 'class-validator'

export class RegisterDto {
    @IsString({ message: 'Email is required' })
    email: string

    @IsString({ message: 'Password is required' })
    password: string

    @IsString({ message: 'Name is required' })
    name: string

    @IsString({ message: 'Phone Number is required' })
    phone: string
}
