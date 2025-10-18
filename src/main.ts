import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor'
import { AllExceptionsFilter } from './common/filters/all-interceptors.filter'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.enableCors()

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            validationError: { target: false, value: false },
            exceptionFactory: (errors) => {
                const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}))
                return new BadRequestException(messages.length ? messages : 'Validation failed')
            },
        })
    )

    app.useGlobalInterceptors(new ResponseTransformInterceptor())
    app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)))

    await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
