export type ApiSuccess<T> = { status: 'success'; data: T }
export type ApiError = { status: 'error'; message: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
