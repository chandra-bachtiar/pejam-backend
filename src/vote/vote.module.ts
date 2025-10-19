import { Module } from '@nestjs/common'
import { VoteService } from './vote.service'
import { VoteController } from './vote.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Vote } from './entities/vote.entity'
import { UserModule } from '../user/user.module'
import { CandidateModule } from '../candidate/candidate.module'
import { Candidate } from '../candidate/entities/candidate.entity'
import { User } from '../user/entities/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Vote, User, Candidate]), UserModule, CandidateModule],
    controllers: [VoteController],
    providers: [VoteService],
    exports: [VoteService],
})
export class VoteModule {}
