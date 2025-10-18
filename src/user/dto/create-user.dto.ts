export class CreateUserDto {
    nis: string
    username: string
    nama: string
    jenis_kelamin: 'L' | 'P'
    jurusan: string
    kelas: string
    role: 'admin' | 'user'
    status: 'siswa' | 'guru'
    password: string
}
