import { PartialType } from '@nestjs/swagger'
import { CreateVoteDto } from './create-vote.dto'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class UpdateVoteDto extends PartialType(CreateVoteDto) {
    @IsNotEmpty({ message: 'Vote ID is required' })
    @IsNumber()
    voteId: number
}
