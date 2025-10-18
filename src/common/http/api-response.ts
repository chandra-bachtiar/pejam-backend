import { HttpException, HttpStatus } from '@nestjs/common'

export type ApiSuccess<T> = { status: 'success'; data: T }
export type ApiError = {
    status: 'error'
    message: string
    code?: string
    errors?: unknown
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ---------- helpers ----------
export const ok = <T>(data: T): ApiSuccess<T> => ({ status: 'success', data })

export const errBody = (message: string, opts?: { code?: string; errors?: unknown }): ApiError => ({
    status: 'error',
    message,
    ...(opts?.code ? { code: opts.code } : {}),
    ...(opts?.errors ? { errors: opts.errors } : {}),
})
export class AppException extends HttpException {
    constructor(
        message: string,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
        opts?: { code?: string; errors?: unknown }
    ) {
        super(errBody(message, opts), status)
    }
}
export const throwBadRequest = (message: string, errors?: unknown): never => {
    throw new AppException(message, HttpStatus.BAD_REQUEST, { errors })
}
export const throwUnauthorized = (message = 'Unauthorized'): never => {
    throw new AppException(message, HttpStatus.UNAUTHORIZED)
}
export const throwForbidden = (message = 'Forbidden'): never => {
    throw new AppException(message, HttpStatus.FORBIDDEN)
}
export const throwNotFound = (message = 'Not Found'): never => {
    throw new AppException(message, HttpStatus.NOT_FOUND)
}
export const throwConflict = (message = 'Conflict'): never => {
    throw new AppException(message, HttpStatus.CONFLICT)
}
