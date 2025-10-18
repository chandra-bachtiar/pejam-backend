import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

interface JwtUser {
    id: number
    sub: number
    email: string
    name: string
    phone: string
}

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

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        try {
            const user = await this.authService.register(registerDto)
            return { message: 'Register Successfully', user }
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Request() request: { user: JwtUser }) {
        try {
            const user = await this.authService.getDetailUser(request.user.email)
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
