import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommitService } from './commit.service';
import { CommitController } from './commit.controller';
import { CommitJob } from './entities/commit-job.entity';
import { CommitLog } from './entities/commit-log.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommitJob, CommitLog, User])],
  controllers: [CommitController],
  providers: [CommitService],
  exports: [CommitService],
})
export class CommitModule {}