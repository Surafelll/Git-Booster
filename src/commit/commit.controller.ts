import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommitService } from './commit.service';
import { CreateCommitJobDto } from './dto/create-commit-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('commits')
@UseGuards(JwtAuthGuard)
export class CommitController {
  constructor(private readonly commitService: CommitService) {}

  @Post('jobs')
  createCommitJob(@Body() createCommitJobDto: CreateCommitJobDto, @Request() req) {
    return this.commitService.createCommitJob(req.user.id, createCommitJobDto);
  }

  @Get('jobs')
  getCommitJobs(@Request() req) {
    return this.commitService.getCommitJobs(req.user.id);
  }

  @Get('jobs/:id')
  getCommitJob(@Param('id') id: string, @Request() req) {
    return this.commitService.getCommitJob(id, req.user.id);
  }

  @Delete('jobs/:id')
  cancelCommitJob(@Param('id') id: string, @Request() req) {
    return this.commitService.cancelCommitJob(id, req.user.id);
  }

  @Get('analytics')
  getCommitAnalytics(@Request() req) {
    return this.commitService.getCommitAnalytics(req.user.id);
  }
}