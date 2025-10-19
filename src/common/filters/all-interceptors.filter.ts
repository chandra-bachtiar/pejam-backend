import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name)

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR

        let message = 'Internal server error'
        if (exception instanceof HttpException) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const res = exception.getResponse() as any
            if (typeof res === 'string') message = res
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
            else if (Array.isArray(res?.message)) message = res.message.join(', ')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            else if (res?.message) message = String(res.message)
            else message = exception.message
        }

        // ✅ Tambahkan logging stack trace / error details:
        this.logger.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `❌ ${httpStatus} - ${exception instanceof Error ? exception.message : exception}`,
            exception instanceof Error ? exception.stack : undefined
        )

        const body = { status: 'error', message }
        httpAdapter.reply(ctx.getResponse(), body, httpStatus)
    }
}
