import { Vote } from 'src/vote/entities/vote.entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number

    @Column({ type: 'varchar', length: 100, unique: true })
    nis: string

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string

    @Column({ type: 'varchar', length: 255 })
    nama: string

    @Column({ type: 'varchar', length: 255, default: 'L' })
    jenis_kelamin: 'L' | 'P'

    @Column({ type: 'varchar', length: 255 })
    jurusan: string

    @Column({ type: 'varchar', length: 255, default: 'X' })
    kelas: string

    @Column({ type: 'varchar', length: 20, default: 'user' })
    role: 'admin' | 'user'

    @Column({ type: 'varchar', length: 20, default: 'murid' })
    status: string

    @Column({ type: 'varchar' })
    password: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    image: string

    @Column({ type: 'boolean', default: true })
    is_active: boolean

    @OneToMany(() => Vote, (vote) => vote.user)
    votes: Vote[]

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date
}
