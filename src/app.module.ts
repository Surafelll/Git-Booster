import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommitModule } from './commit/commit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GithubModule } from './github/github.module';

import { User } from './user/entities/user.entity';
import { CommitJob } from './commit/entities/commit-job.entity';
import { CommitLog } from './commit/entities/commit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'gitboster.db',
      entities: [User, CommitJob, CommitLog],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'gitboster-secret',
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    AuthModule,
    UserModule,
    CommitModule,
    AnalyticsModule,
    GithubModule,
  ],
})
export class AppModule {}