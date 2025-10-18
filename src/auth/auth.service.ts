// src/auth/auth.service.ts
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { QueryFailedError } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/user/user.service'
import { User } from '../user/entities/user.entity'

export interface ReturnUser {
    id: number
    email: string
    name: string
    phone: string
    role: string
    verified: boolean
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async validateUser(identifier: string, pass: string): Promise<ReturnUser | null> {
        const user = await this.usersService.findByEmail(identifier)
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user
            return result
        }
        return null
    }

    async login(
        user: ReturnUser
    ): Promise<{ access_token: string; valid: boolean; user: ReturnUser }> {
        const payload = { email: user.email, role: user.role, sub: user.id }
        return {
            access_token: await this.jwtService.signAsync(payload),
            valid: true,
            user,
        }
    }

    async register(user: RegisterDto): Promise<ReturnUser> {
        try {
            const newUser = await this.usersService.create(user)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = newUser
            return result
        } catch (error) {
            console.error(error)
            if (error instanceof QueryFailedError) {
                const driverError = error.driverError as { code?: string; detail?: string }
                if (driverError?.code === '23505') {
                    const detail = driverError.detail ?? ''
                    if (detail.includes('email')) {
                        throw new ConflictException('Email Already registered')
                    }
                    throw new ConflictException('Email Already registered')
                }
            }

            throw new InternalServerErrorException('Failed to register user')
        }
    }

    async getDetailUser(email: string): Promise<Partial<User>> {
        const user = await this.usersService.findByEmail(email)
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatedAt, createdAt, password, ...result } = user
        return result
    }

    async forgotPassword(identifier: string) {
        const user = await this.usersService.findByEmail(identifier)
        if (!user) {
            return
        }

        try {
            const token = await this.usersService.createPasswordResetToken(user.id)
            const url = this.configService.get('BASE_URL') + `/reset-password?token=${token}`
            return { url }
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException('Failed to process forgot password')
        }
    }

    async resetPassword(newPassword: string, token: string) {
        try {
            await this.usersService.resetPassword(newPassword, token)

            return { message: 'Password has been reset' }
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException('Failed to reset password')
        }
    }
}
