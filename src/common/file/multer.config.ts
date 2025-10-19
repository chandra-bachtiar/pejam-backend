import { diskStorage } from 'multer'
import * as path from 'path'
import { Request } from 'express'

export const multerConfig = {
    storage: diskStorage({
        destination: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void
        ) => {
            cb(null, './uploads/images/user')
        },
        filename: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void
        ) => {
            const unique = `${Date.now()}${path.extname(file.originalname)}`
            cb(null, unique)
        },
    } as const),
}

export const multerConfigCandidate = {
    storage: diskStorage({
        destination: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, destination: string) => void
        ) => {
            cb(null, './uploads/images/candidate')
        },
        filename: (
            req: Request,
            file: Express.Multer.File,
            cb: (error: Error | null, filename: string) => void
        ) => {
            const unique = `${Date.now()}${path.extname(file.originalname)}`
            cb(null, unique)
        },
    } as const),
}
