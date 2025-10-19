import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { CandidateService } from './candidate.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { multerConfigCandidate } from '../common/file/multer.config'
import { CreateCandidateDto } from './dto/create-candidate.dto'
import { UpdateCandidateDto } from './dto/update-candidate.dto'
import { RolesGuard } from '../auth/roles.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('candidates')
export class CandidateController {
    constructor(private readonly candidateService: CandidateService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async findAll(
        @Query('search') search = '',
        @Query('page') page = 1,
        @Query('perPage') perPage = 10
    ) {
        return await this.candidateService.findAll({
            search,
            page: Number(page),
            perPage: Number(perPage),
        })
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async findOne(@Param('id') id: number) {
        const candidate = await this.candidateService.findOne(id)
        if (!candidate) throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND)
        return candidate
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @UseInterceptors(FileInterceptor('image', multerConfigCandidate))
    async create(@Body() data: CreateCandidateDto, @UploadedFile() file?: Express.Multer.File) {
        return await this.candidateService.create(data, file)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @UseInterceptors(FileInterceptor('image', multerConfigCandidate))
    async update(
        @Param('id') id: number,
        @Body() data: UpdateCandidateDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const candidate = await this.candidateService.update(id, data, file)
        if (!candidate) throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND)
        return candidate
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async remove(@Param('id') id: number) {
        const result = await this.candidateService.remove(id)
        if (!result) throw new HttpException('Candidate not found', HttpStatus.NOT_FOUND)
        return { message: 'Success' }
    }
}
