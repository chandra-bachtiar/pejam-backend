import { IsNotEmpty, IsNumber } from 'class-validator'

export class CreateVoteDto {
    @IsNotEmpty({ message: 'Candidate ID is required' })
    @IsNumber()
    candidateId: number
}
