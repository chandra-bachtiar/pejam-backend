import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'
import { PasswordReset } from './entities/password-reset.entity'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordReset)
        private readonly passwordResetRepository: Repository<PasswordReset>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
        const newUser = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        })

        return await this.userRepository.save(newUser)
    }

    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOneBy({ id })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email })
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find()
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOneBy({ id })
        if (!user) {
            throw new Error('User not found')
        }
        Object.assign(user, updateUserDto)
        return this.userRepository.save(user)
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id)
    }

    async createPasswordResetToken(userId: number) {
        const token =
            Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

        const passwordReset = this.passwordResetRepository.create({
            userId,
            token,
            expiresAt,
            createdAt: new Date(),
        })

        await this.passwordResetRepository.save(passwordReset)
        return token
    }

    async resetPassword(newPassword: string, token: string): Promise<void> {
        const resetToken = await this.passwordResetRepository.findOneBy({ token: token })
        if (!resetToken) {
            throw new Error('Invalid or expired token')
        }

        const { userId, expiresAt } = resetToken
        if (expiresAt < new Date()) {
            throw new Error('Invalid or expired token')
        }

        const user = await this.userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new Error('User not found')
        }

        const salt = await bcrypt.genSalt()
        user.password = await bcrypt.hash(newPassword, salt)
        await this.userRepository.save(user)

        await this.passwordResetRepository.delete({ userId })
    }
}
