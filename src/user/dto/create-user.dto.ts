import { IsString } from 'class-validator'

export class CreateUserDto {
    @IsString({ message: 'NIS must be a string' })
    nis: string

    @IsString({ message: 'Username must be a string' })
    username: string

    @IsString({ message: 'Nama must be a string' })
    nama: string

    @IsString({ message: 'Jenis kelamin must be a string' })
    jenis_kelamin: 'L' | 'P'

    @IsString({ message: 'Jurusan must be a string' })
    jurusan: string

    @IsString({ message: 'Kelas must be a string' })
    kelas: string

    @IsString({ message: 'Role must be a string' })
    role: 'admin' | 'user'

    @IsString({ message: 'Status must be a string' })
    status: 'siswa' | 'guru'

    @IsString({ message: 'Password must be a string' })
    password: string
}
