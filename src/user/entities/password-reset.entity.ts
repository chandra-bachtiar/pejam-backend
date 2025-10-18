import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('password_resets')
export class PasswordReset {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @Column({ type: 'bigint' })
    userId: number

    @Column({ type: 'varchar', length: 255 })
    token: string

    @Column({ type: 'timestamp' })
    expiresAt: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date
}
