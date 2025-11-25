import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { VoteService } from './vote/vote.service'

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly voteService: VoteService
    ) {}

    @Get('health')
    healthCheck() {
        return { status: 'ok', message: 'Service is healthy' }
    }

    @Get('publicvote')
    getPublicVote() {
        return this.voteService.publicVotes()
    }
}
