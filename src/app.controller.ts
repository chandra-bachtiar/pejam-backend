import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello() {
        let sum = 0
        for (let i = 0; i < 10000; i++) {
            sum += i
        }
        return {
            message: 'OK',
            sum,
            timestamp: Date.now(),
        }
    }
}
