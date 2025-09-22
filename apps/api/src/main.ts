import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_FRONTEND_URL, DEFAULT_PORT_BACKEND } from './shared/constants';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('2Hand EV Battery Trading API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth() //để nó lấy Bearer token auto luôn khi đã login thành công
    .addTag('ev-battery-trading')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true }, // thêm này để Swagger nhớ token
  });

  // Bật validation cho toàn bộ ứng dụng
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ field thừa không khai báo trong DTO
      forbidNonWhitelisted: false, // (optional) bật lên thì sẽ throw nếu có field lạ
      transform: true, // Tự động transform primitive (string -> number, …)
      transformOptions: {
        enableImplicitConversion: true, // cho phép auto convert nếu type match
      },
    }),
  );

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
