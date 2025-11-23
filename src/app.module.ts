import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { CandidateModule } from './candidate/candidate.module'
import { VoteModule } from './vote/vote.module'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: configService.get<'mysql' | 'postgres'>('DB_CONNECTION') || 'mysql',
                host: configService.get<string>('DB_HOST') || 'localhost',
                port: configService.get<number>('DB_PORT') || 3306,
                username: configService.get<string>('DB_USERNAME') || 'root',
                password: configService.get<string>('DB_PASSWORD') || '',
                database: configService.get<string>('DB_NAME') || 'app',
                synchronize: configService.get<boolean>('DB_SYNC') || false,
                autoLoadEntities: configService.get<boolean>('DB_AUTOLOAD_ENTITIES') || false,
            }),
        }),
        ServeStaticModule.forRoot({
            // 1. Folder mana yang mau dibuka? (Physical Path)
            // process.cwd() artinya root folder project Anda.
            // Jadi ini menunjuk ke folder: /Project/pejam/pejam-backend/uploads
            rootPath: join(process.cwd(), 'uploads'),

            // 2. Mau diakses lewat URL apa? (Virtual Path)
            // Nanti aksesnya jadi: http://localhost:3000/uploads/...
            serveRoot: '/uploads',
        }),
        CandidateModule,
        VoteModule,
        UserModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
