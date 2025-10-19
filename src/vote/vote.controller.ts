import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common'
import { VoteService } from './vote.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { ReturnUser } from '../auth/auth.service'
import { CreateVoteDto } from './dto/create-vote.dto'
import { UpdateVoteDto } from './dto/update-vote.dto'

@Controller('vote')
export class VoteController {
    constructor(private readonly voteService: VoteService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async findAll(
        @Query('search') search = '',
        @Query('page') page = 1,
        @Query('perPage') perPage = 10
    ) {
        return await this.voteService.findAll({
            search,
            page: Number(page),
            perPage: Number(perPage),
        })
    }

    @Get('/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async all() {
        return await this.voteService.all()
    }

    @Get('/public-votes')
    async publicVotes() {
        return await this.voteService.publicVotes()
    }

    @Get('/check')
    @UseGuards(JwtAuthGuard)
    async checkVote(@Request() request: { user: ReturnUser }) {
        return await this.voteService.checkUserVote(request.user.id)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() request: { user: ReturnUser }, @Body() data: CreateVoteDto) {
        return await this.voteService.create(request.user.id, data.candidateId)
    }

    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async update(@Body() data: UpdateVoteDto) {
        return await this.voteService.update(data.voteId, Number(data.candidateId))
    }

    @Delete()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async remove(@Body('voteId') voteId: number) {
        return await this.voteService.remove(voteId)
    }
}
