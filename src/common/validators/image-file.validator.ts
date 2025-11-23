import { FileValidator } from '@nestjs/common'

export class MaxFileSizeValidator extends FileValidator {
    buildErrorMessage(): string {
        return 'File terlalu besar'
    }
    isValid(file: Express.Multer.File): boolean {
        return file.size <= this.validationOptions.maxSize
    }
}

export class CustomImageValidator extends FileValidator {
    constructor() {
        super({})
    }

    buildErrorMessage(): string {
        return 'File harus berupa gambar (jpg, jpeg, png, webp)!'
    }

    isValid(file: Express.Multer.File): boolean {
        if (!file.mimetype) return false
        return file.mimetype.startsWith('image/')
    }
}
