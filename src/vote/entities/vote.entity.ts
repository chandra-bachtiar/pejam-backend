import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Candidate } from '../../candidate/entities/candidate.entity'
import { User } from '../../user/entities/user.entity'

@Entity('votes')
export class Vote {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @ManyToOne(() => Candidate, (candidate) => candidate.id)
    @JoinColumn({ name: 'candidate_id' })
    candidate: Candidate

    @Column({ type: 'bigint', name: 'candidate_id' })
    candidateId: number

    @Column({ type: 'bigint', name: 'user_id' })
    userId: number

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
