import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { AuthService, ReturnUser } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.identifier, loginDto.password)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        return this.authService.login(user)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Request() request: { user: ReturnUser }) {
        const username = request.user?.username
        if (!username) {
            throw new UnauthorizedException('Invalid token')
        }

        try {
            const user = await this.authService.getDetailUser(username)
            return { valid: true, user }
        } catch {
            throw new UnauthorizedException('Invalid token')
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { identifier: string }) {
        try {
            await this.authService.forgotPassword(body.identifier)
            return {
                message: 'URL Reset has been sent to your email',
            }
        } catch (error) {
            console.error(error)
            throw new UnauthorizedException('Failed to process forgot password')
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { password: string; token: string }) {
        try {
            await this.authService.resetPassword(body.password, body.token)
            return { message: 'Password has been reset' }
        } catch (error) {
            console.error(error)
            throw new UnauthorizedException('Failed to reset password')
        }
    }
}
