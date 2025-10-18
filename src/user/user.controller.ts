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
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { UsersService } from './user.service'
import { multerConfig } from '../common/file/multer.config'
import { RolesGuard } from '../auth/roles.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findAll(
        @Query('search') search?: string,
        @Query('is_not_voted') isNotVoted?: string,
        @Query('role') role?: string,
        @Query('page') page = 1,
        @Query('perPage') perPage = 10
    ) {
        console.log({ search, isNotVoted, role, page, perPage })
        const result = await this.usersService.findAll({
            search,
            role,
            isNotVoted,
            page: Number(page),
            perPage: Number(perPage),
        })
        return { status: 'success', user: result }
    }

    @Get(':id')
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findOne(@Param('id') id: number) {
        const user = await this.usersService.findOne(id)
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        return { status: 'success', user }
    }

    @Post()
    @UseInterceptors(FileInterceptor('image', multerConfig))
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async create(
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body() data: CreateUserDto
    ) {
        const user = await this.usersService.create(data, file)
        return { status: 'success', user, message: 'User created successfully' }
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image', multerConfig))
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async update(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File | undefined,
        @Body() data: UpdateUserDto
    ) {
        const user = await this.usersService.update(id, data, file)
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        return { status: 'success', user, message: 'User updated successfully' }
    }

    @Delete(':id')
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async remove(@Param('id') id: number) {
        const result = await this.usersService.remove(id)
        if (!result) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        return { status: 'success', message: 'User deleted successfully' }
    }
}
