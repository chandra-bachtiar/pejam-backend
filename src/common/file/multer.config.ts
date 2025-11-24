import { diskStorage } from 'multer'
import { extname, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { Request } from 'express'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

export const createMulterOptions = (folderName: string): MulterOptions => {
    const uploadPath = resolve(process.cwd(), 'uploads/images', folderName)

    return {
        storage: diskStorage({
            destination: (
                req: Request,
                file: Express.Multer.File,
                cb: (error: Error | null, destination: string) => void
            ) => {
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true })
                }

                cb(null, uploadPath)
            },
            filename: (
                req: Request,
                file: Express.Multer.File,
                cb: (error: Error | null, filename: string) => void
            ) => {
                const randomSuffix = Math.round(Math.random() * 1e9)
                const uniqueName = `${Date.now()}-${randomSuffix}${extname(file.originalname)}`

                cb(null, uniqueName)
            },
        }),
    }
}

// Export config yang sudah jadi
export const multerConfig = createMulterOptions('user')
export const multerConfigCandidate = createMulterOptions('candidate')
