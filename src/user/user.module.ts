import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { PasswordReset } from './entities/password-reset.entity'
import { UsersController } from './user.controller'
import { UsersService } from './user.service'

@Module({
    imports: [TypeOrmModule.forFeature([User, PasswordReset])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UserModule {}
