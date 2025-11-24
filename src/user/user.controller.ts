import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
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
import { CustomImageValidator } from 'src/common/validators/image-file.validator'

@Controller('user')
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
        const result = await this.usersService.findAll({
            search,
            role,
            isNotVoted,
            page: Number(page),
            perPage: Number(perPage),
        })
        return { status: 'success', user: result }
    }

    @Post('import')
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    importUsers(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )
        file: Express.Multer.File
    ) {
        const result = this.usersService.importUsersExcel(file)

        return {
            status: 'success',
            message: 'Users imported successfully',
            result,
        }
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
        @UploadedFile(
            new ParseFilePipeBuilder().addValidator(new CustomImageValidator()).build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                fileIsRequired: false,
            })
        )
        file: Express.Multer.File | undefined,
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
        @UploadedFile(
            new ParseFilePipeBuilder().addValidator(new CustomImageValidator()).build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                fileIsRequired: false,
            })
        )
        file: Express.Multer.File | undefined,
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
