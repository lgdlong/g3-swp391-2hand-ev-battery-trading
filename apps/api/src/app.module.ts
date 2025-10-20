import { Module } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CarCatalogModule } from './modules/catalogs/cars/car-catalog.module';
import { BikeCatalogModule } from './modules/catalogs/bikes/bike-catalog.module';
import { BatteryCatalogModule } from './modules/catalogs/batteries/battery-catalog.module';
import { PostsModule } from './modules/posts/posts.module';
import { UploadModule } from './modules/upload/upload.module';
import { PostBookmarksModule } from './modules/post-bookmarks/post-bookmarks.module';
import { AddressModule } from './modules/address/address.module';
import { PostReviewModule } from './modules/post-review/post-review.module';
import { PayosModule } from './modules/payos/payos.module';
import { PostRatingModule } from './modules/post-ratings/post-ratings.module';
import { SettingsModule } from './modules/settings/settings.module';
// import { DebugMiddleware } from './core/middleware/debug.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [databaseConfig],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') === 'development';

        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<number>('DB_PORT') ?? 5432),
          username: config.get<string>('USERNAME'),
          password: config.get<string>('PASSWORD'),
          database: config.get<string>('DB_NAME'),
          // entities: [Account, CarBrand, CarModel, CarTrim],
          autoLoadEntities: true,
          synchronize: isDev, // chỉ tự động đồng bộ hóa CSDL ở môi trường development
          retryAttempts: 5,
          retryDelay: 3000,
          logging: isDev, // chỉ bật log ở môi trường development
          extra: {
            max: 10,
            min: 2,
            idleTimeoutMillis: 600_000,
            connectionTimeoutMillis: 60_000,
          },
        };
      },
    }),
    AccountsModule,
    AuthModule,
    CarCatalogModule,
    BikeCatalogModule,
    BatteryCatalogModule,
    PostsModule,
    UploadModule,
    PostBookmarksModule,
    AddressModule,
    PostReviewModule,
    PayosModule,
    PostRatingModule,
    SettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(DebugMiddleware).forRoutes('*');
//   }
// }
