import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_FRONTEND_URL, DEFAULT_PORT_BACKEND } from './shared/constants';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ app context
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || DEFAULT_PORT_BACKEND; // fallback nếu không có PORT

  // ---- Lấy FRONTEND_URL từ configService thay vì process.env ----
  const frontendUrl = configService.get<string>('FRONTEND_URL') || DEFAULT_FRONTEND_URL;

  app.enableCors({
    origin: frontendUrl, // sử dụng biến lấy từ configService
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  await app.listen(port);
}
bootstrap();
