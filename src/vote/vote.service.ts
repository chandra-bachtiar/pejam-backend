import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Vote } from './entities/vote.entity'
import { Repository } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { Candidate } from '../candidate/entities/candidate.entity'

@Injectable()
export class VoteService {
    constructor(
        @InjectRepository(Vote)
        private readonly voteRepository: Repository<Vote>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Candidate)
        private readonly candidateRepository: Repository<Candidate>
    ) {}

    async findAll({ search = '', page = 1, perPage = 10 }) {
        try {
            const qb = this.voteRepository
                .createQueryBuilder('v')
                .leftJoinAndSelect('v.user', 'u')
                .leftJoinAndSelect('v.candidate', 'c')
                .where(
                    'LOWER(u.nama) LIKE :search OR LOWER(c.ketua) LIKE :search OR LOWER(c.wakil) LIKE :search',
                    {
                        search: `%${search.toLowerCase()}%`,
                    }
                )
                .orderBy('v.createdAt', 'DESC')

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
            throw new HttpException('Failed to fetch votes', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async all() {
        return this.voteRepository.find({ relations: ['user', 'candidate'] })
    }

    async publicVotes() {
        try {
            // Try to return all candidates with their vote counts and percentages
            const candidates = await this.candidateRepository.find()
            const totalVotes = await this.voteRepository.count()

            return await Promise.all(
                candidates.map(async (candidate) => {
                    const voteCount = await this.voteRepository.count({
                        where: { candidateId: candidate.id },
                    })
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                    return {
                        candidateId: candidate.id,
                        ketua: candidate.ketua,
                        wakil: candidate.wakil,
                        image: candidate.image,
                        deskripsi: candidate.deskripsi,
                        voteCount,
                        percentage: parseFloat(percentage.toFixed(2)),
                    }
                })
            )
        } catch (error) {
            console.error('Error in publicVotes:', error)
            throw new HttpException(
                'Failed to fetch public votes',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async getAllCandidates() {
        return this.candidateRepository.find()
    }

    async checkUserVote(userId: number) {
        try {
            const vote = await this.voteRepository.findOne({ where: { userId } })
            if (vote) {
                return {
                    isVoted: true,
                    candidateId: vote.candidateId,
                    message: 'User has already voted',
                }
            } else {
                return { isVoted: false }
            }
        } catch (error) {
            console.error('Error in checkUserVote:', error)
            throw new HttpException('Failed to check user vote', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async create(userId: number, candidateId: number) {
        try {
            const existingVote = await this.voteRepository.findOne({ where: { userId } })
            if (existingVote) {
                throw new HttpException('User has already voted', HttpStatus.CONFLICT)
            }

            console.log(`Creating vote for candidate ${candidateId} by user ${userId}`)
            const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } })
            if (!candidate) {
                throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND)
            }

            const vote = this.voteRepository.create({ candidateId, userId })
            return this.voteRepository.save(vote)
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new HttpException('Failed to create vote', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async update(id: number, candidateId: number) {
        const vote = await this.voteRepository.findOne({ where: { id } })
        if (!vote) return null

        const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } })
        if (!candidate) {
            throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND)
        }

        vote.candidateId = candidateId
        return this.voteRepository.save(vote)
    }

    async remove(id: number) {
        const vote = await this.voteRepository.findOne({ where: { id } })
        if (!vote) return null

        await this.voteRepository.remove(vote)
        return true
    }
}
