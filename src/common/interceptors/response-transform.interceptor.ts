import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                if (data && typeof data === 'object' && 'status' in data) return data
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                return { status: 'success', data }
            })
        )
    }
}
