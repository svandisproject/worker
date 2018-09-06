import {NestFactory} from '@nestjs/core';
import {AppModule} from './AppModule';
import {WsAdapter} from '@nestjs/websockets';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    app.useWebSocketAdapter(new WsAdapter(app.getHttpServer()));
}

bootstrap();
