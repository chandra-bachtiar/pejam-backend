import { diskStorage } from 'multer'
import * as path from 'path'
import { Request } from 'express'

export const multerConfig = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
            const unique = `${Date.now()}${path.extname(file.originalname)}`
            cb(null, unique)
        },
    } as const), // <-- ini penting
}
