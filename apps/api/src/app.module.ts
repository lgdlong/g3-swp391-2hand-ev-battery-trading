import { Module } from '@nestjs/common';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Account } from './modules/accounts/entities/account.entity';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';

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
          entities: [Account],
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
