import {Controller, Get} from '@nestjs/common';

@Controller('test')
export class Test {
    @Get()
    test() {
        return 1;
    }
}