import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostFraudFlag } from './entities/post-fraud-flag.entity';
import { PostFraudFlagsService } from './post-fraud-flags.service';
import { PostFraudFlagsController } from './post-fraud-flags.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostFraudFlag])],
  controllers: [PostFraudFlagsController],
  providers: [PostFraudFlagsService],
  exports: [PostFraudFlagsService], // Export service để dùng trong các module khác
})
export class PostFraudFlagsModule {}
