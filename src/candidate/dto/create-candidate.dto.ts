import { IsOptional, IsString } from 'class-validator'

export class CreateCandidateDto {
    @IsString({ message: 'Ketua is required' })
    ketua: string

    @IsString({ message: 'Wakil is required' })
    wakil: string

    @IsOptional()
    deskripsi: string
}
