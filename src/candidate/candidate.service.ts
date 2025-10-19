import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Candidate } from './entities/candidate.entity'
import { CreateCandidateDto } from './dto/create-candidate.dto'
import { UpdateCandidateDto } from './dto/update-candidate.dto'

@Injectable()
export class CandidateService {
    constructor(
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>
    ) {}

    async findAll({ search = '', page = 1, perPage = 10 }) {
        try {
            const qb = this.candidateRepository
                .createQueryBuilder('c')
                .select(['c.id', 'c.ketua', 'c.wakil', 'c.image', 'c.deskripsi'])
                .where('LOWER(c.ketua) LIKE :search OR LOWER(c.wakil) LIKE :search', {
                    search: `%${search.toLowerCase()}%`,
                })
                .orderBy('c.createdAt', 'DESC')

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
            console.error('Error in findAll:', error)
            throw new InternalServerErrorException('failed to fetch candidates')
        }
    }

    findOne(id: number) {
        return this.candidateRepository.findOne({ where: { id } })
    }

    async create(data: CreateCandidateDto, file?: Express.Multer.File) {
        try {
            const safeFile = file as unknown as { filename?: string }

            const candidate = this.candidateRepository.create({
                ...data,
                image: safeFile?.filename ? `/uploads/images/candidate/${safeFile.filename}` : '',
            })

            return this.candidateRepository.save(candidate)
        } catch (error) {
            console.error('Error in create:', error)
            throw new InternalServerErrorException('failed to create candidate')
        }
    }

    async update(id: number, data: UpdateCandidateDto, file?: Express.Multer.File) {
        const candidate = await this.candidateRepository.findOne({ where: { id } })
        if (!candidate) return null

        Object.assign(candidate, data)

        const safeFile = file as unknown as { filename?: string }
        if (safeFile?.filename) {
            candidate.image = `/uploads/images/candidate/${safeFile.filename}`
        }

        return this.candidateRepository.save(candidate)
    }

    async remove(id: number) {
        const candidate = await this.candidateRepository.findOne({ where: { id } })
        if (!candidate) return null

        await this.candidateRepository.remove(candidate)
        return true
    }
}
