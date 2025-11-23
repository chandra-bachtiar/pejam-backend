import { diskStorage } from 'multer'
import * as path from 'path'
import { existsSync, mkdirSync } from 'fs' // Import modul File System
import { Request } from 'express'

// Factory function untuk membuat config dinamis
// Ini jauh lebih CLEAN daripada copy-paste code
const createMulterOptions = (folderName: string) => {
    return {
        storage: diskStorage({
            destination: (
                req: Request,
                file: Express.Multer.File,
                cb: (error: Error | null, destination: string) => void
            ) => {
                // Tentukan path tujuan
                const uploadPath = `./uploads/images/${folderName}`

                // Cek apakah folder sudah ada? Jika belum, buat!
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
                // Generate nama file unik
                const unique = `${Date.now()}${path.extname(file.originalname)}`
                cb(null, unique)
            },
        }),
    }
}

// Export config yang sudah jadi
export const multerConfig = createMulterOptions('user')
export const multerConfigCandidate = createMulterOptions('candidate')
