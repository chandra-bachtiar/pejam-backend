import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../user/user.service'

type JwtPayload = { sub: number; email?: string; role?: string; iat?: number; exp?: number }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) {
        const secret = configService.getOrThrow<string>('JWT_SECRET')

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        })
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findOne(payload.sub)
        if (!user) throw new UnauthorizedException('Invalid token')
        return user
    }
}
