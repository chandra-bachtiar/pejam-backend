import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'
import { PasswordReset } from './entities/password-reset.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PasswordReset)
        private readonly passwordResetRepository: Repository<PasswordReset>
    ) {}

    async findAll({ search = '', role = '', isNotVoted = 'false', page = 1, perPage = 10 }) {
        // TODO: test this endpoints
        try {
            const qb = this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.votes', 'vote')

            if (search) {
                qb.andWhere(
                    'LOWER(user.nis) LIKE :search OR LOWER(user.username) LIKE :search OR LOWER(user.nama) LIKE :search',
                    { search: `%${search.toLowerCase()}%` }
                )
            }

            if (role && role !== 'Semua') {
                qb.andWhere('LOWER(user.role) LIKE :role', { role: `%${role.toLowerCase()}%` })
            }

            if (isNotVoted === 'true') {
                qb.andWhere('vote.id IS NULL')
            }

            qb.orderBy('user.createdAt', 'DESC')

            const [data, total] = await qb
                .skip((page - 1) * perPage)
                .take(perPage)
                .getManyAndCount()

            return {
                data,
                total,
                current_page: page,
                per_page: perPage,
                last_page: Math.ceil(total / perPage),
            }
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException('Failed to fetch users')
        }
    }

    findOne(id: number) {
        return this.userRepository.findOne({ where: { id } })
    }

    create(data: CreateUserDto, file?: Express.Multer.File) {
        const hashed = bcrypt.hashSync(data.password, 10)
        const safeFile = file as unknown as { filename?: string }
        const imagePath = safeFile?.filename ? `/uploads/images/user/${safeFile.filename}` : ''

        const user = this.userRepository.create({
            ...data,
            password: hashed,
            image: imagePath,
            is_active: true,
        })

        return this.userRepository.save(user)
    }

    async update(id: number, data: UpdateUserDto, file?: Express.Multer.File) {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) return null

        Object.assign(user, data)

        if (data.password) {
            user.password = bcrypt.hashSync(data.password, 10)
        }

        const safeFile = file as unknown as { filename?: string }

        if (safeFile?.filename) {
            user.image = `/uploads/images/user/${safeFile.filename}`
        }

        if (typeof data.is_active !== 'undefined') {
            user.is_active = data.is_active
        }

        return this.userRepository.save(user)
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOneBy({ username })
    }

    async remove(id: number): Promise<boolean | null> {
        const deleted = await this.userRepository.delete(id)
        if (deleted.affected === 0) {
            return null
        }

        return true
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
