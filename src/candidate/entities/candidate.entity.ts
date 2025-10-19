import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('candidates')
export class Candidate {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @Column({ type: 'varchar', length: 255 })
    ketua: string

    @Column({ type: 'varchar', length: 255 })
    wakil: string

    @Column({ type: 'varchar', length: 255 })
    image: string

    @Column({ type: 'text' })
    deskripsi: string

    @Column({ type: 'boolean', default: false })
    deleted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date
}
