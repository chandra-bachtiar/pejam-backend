import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/user/user.service'
import { User } from '../user/entities/user.entity'

export interface ReturnUser {
    id: number
    nis: string
    username: string
    nama: string
    jenis_kelamin: 'L' | 'P'
    jurusan: string
    kelas: string
    role: 'admin' | 'user'
    status: string
    image: string
    is_active: boolean
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async validateUser(identifier: string, pass: string): Promise<ReturnUser | null> {
        const user = await this.usersService.findByUsername(identifier)
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
        const payload = { username: user.username, role: user.role, sub: user.id }
        return {
            access_token: await this.jwtService.signAsync(payload),
            valid: true,
            user,
        }
    }

    async getDetailUser(username: string): Promise<Partial<User>> {
        const user = await this.usersService.findByUsername(username)
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { updatedAt, createdAt, password, ...result } = user
        return result
    }

    async forgotPassword(identifier: string) {
        const user = await this.usersService.findByUsername(identifier)
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
