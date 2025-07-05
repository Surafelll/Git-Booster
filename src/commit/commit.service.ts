import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';

import { CommitJob, JobStatus } from './entities/commit-job.entity';
import { CommitLog } from './entities/commit-log.entity';
import { CreateCommitJobDto } from './dto/create-commit-job.dto';
import { User } from '../user/entities/user.entity';
import * as moment from 'moment';
import { simpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommitService {
  private readonly defaultCommitMessages = [
    'Update documentation',
    'Fix minor bug',
    'Improve code quality',
    'Add new feature',
    'Refactor code',
    'Update dependencies',
    'Fix typo',
    'Optimize performance',
    'Add unit tests',
    'Update README',
    'Clean up code',
    'Fix formatting',
    'Add code comments',
    'Update configuration',
    'Improve error handling',
    'Add input validation',
    'Update styles',
    'Fix security vulnerability',
    'Add logging',
    'Update version',
    'Implement feature enhancement',
    'Fix memory leak',
    'Add integration tests',
    'Update API endpoints',
    'Improve user experience',
    'Add monitoring',
    'Update database schema',
    'Fix compatibility issues',
    'Add caching layer',
    'Improve accessibility'
  ];

  constructor(
    @InjectRepository(CommitJob)
    private commitJobRepository: Repository<CommitJob>,
    @InjectRepository(CommitLog)
    private commitLogRepository: Repository<CommitLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createCommitJob(userId: string, createCommitJobDto: CreateCommitJobDto): Promise<CommitJob> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const startDate = new Date(createCommitJobDto.startDate);
    const endDate = new Date(createCommitJobDto.endDate);
    const totalDays = moment(endDate).diff(moment(startDate), 'days') + 1;
    const totalCommits = totalDays * createCommitJobDto.commitsPerDay;

    const commitJob = this.commitJobRepository.create({
      userId,
      repoName: createCommitJobDto.repoName,
      repoOwner: createCommitJobDto.repoOwner,
      repoUrl: createCommitJobDto.repoUrl,
      startDate,
      endDate,
      commitsPerDay: createCommitJobDto.commitsPerDay,
      commitMessages: createCommitJobDto.commitMessages || this.defaultCommitMessages,
      totalCommits,
      status: JobStatus.PENDING,
    });

    const savedJob = await this.commitJobRepository.save(commitJob);
    await this.scheduleCommitJob(savedJob);
    return savedJob;
  }

  async getCommitJobs(userId: string): Promise<CommitJob[]> {
    return this.commitJobRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCommitJob(jobId: string, userId: string): Promise<CommitJob> {
    const job = await this.commitJobRepository.findOne({
      where: { id: jobId, userId },
      relations: ['commitLogs'],
    });

    if (!job) {
      throw new NotFoundException('Commit job not found');
    }

    return job;
  }

  async cancelCommitJob(jobId: string, userId: string): Promise<void> {
    const job = await this.getCommitJob(jobId, userId);
    
    if (job.status !== JobStatus.PENDING && job.status !== JobStatus.RUNNING) {
      throw new Error('Cannot cancel job that is not pending or running');
    }

    job.status = JobStatus.CANCELLED;
    await this.commitJobRepository.save(job);

    // Remove cron job if it exists
    try {
      this.schedulerRegistry.deleteCronJob(jobId);
    } catch (error) {
      // Job might not exist in scheduler
    }
  }

  private async scheduleCommitJob(job: CommitJob): Promise<void> {
    const startDate = moment(job.startDate);
    const endDate = moment(job.endDate);
    const currentDate = moment();

    // If start date is in the past, start from today
    const scheduleStartDate = startDate.isBefore(currentDate) ? currentDate : startDate;
    
    // Schedule commits for each day
    for (let date = scheduleStartDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
      await this.scheduleCommitsForDay(job, date.toDate());
    }

    // Update job status
    job.status = JobStatus.RUNNING;
    await this.commitJobRepository.save(job);
  }

  private async scheduleCommitsForDay(job: CommitJob, date: Date): Promise<void> {
    const dayStart = moment(date).startOf('day');
    const dayEnd = moment(date).endOf('day');
    
    // Generate random times for commits throughout the day
    const commitTimes = this.generateRandomCommitTimes(dayStart, dayEnd, job.commitsPerDay);
    
    for (const commitTime of commitTimes) {
      const commitLog = this.commitLogRepository.create({
        userId: job.userId,
        commitJobId: job.id,
        repoName: job.repoName,
        commitMessage: this.getRandomCommitMessage(job.commitMessages),
        scheduledAt: commitTime.toDate(),
        isSuccess: false,
      });

      await this.commitLogRepository.save(commitLog);

      // Schedule the commit execution
      if (commitTime.isAfter(moment())) {
        const delay = commitTime.diff(moment());
        setTimeout(() => this.executeCommit(commitLog.id), delay);
      } else {
        // Execute immediately if scheduled time is in the past
        await this.executeCommit(commitLog.id);
      }
    }
  }

  private generateRandomCommitTimes(dayStart: moment.Moment, dayEnd: moment.Moment, count: number): moment.Moment[] {
    const times: moment.Moment[] = [];
    const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM for more realistic commits
    
    for (let i = 0; i < count; i++) {
      const randomHour = Math.floor(Math.random() * (workingHours.end - workingHours.start)) + workingHours.start;
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);
      
      const commitTime = dayStart.clone()
        .hour(randomHour)
        .minute(randomMinute)
        .second(randomSecond);
      
      times.push(commitTime);
    }
    
    return times.sort((a, b) => a.diff(b));
  }

  private getRandomCommitMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }



  private async executeCommit(commitLogId: string): Promise<void> {
    const commitLog = await this.commitLogRepository.findOne({
      where: { id: commitLogId },
      relations: ['user'],
    });

    if (!commitLog) {
      return;
    }

    try {
      const repoPath = path.join(process.cwd(), 'repos', commitLog.userId, commitLog.repoName);
      
      // Ensure repository is cloned
      await this.ensureRepository(commitLog.user, commitLog.repoName, repoPath);
      
      // Create commit
      const commitHash = await this.createCommit(repoPath, commitLog.commitMessage, commitLog.user);
      
      // Update commit log
      commitLog.isSuccess = true;
      commitLog.executedAt = new Date();
      commitLog.commitHash = commitHash;
      commitLog.commitUrl = `https://github.com/${commitLog.user.githubUsername}/${commitLog.repoName}/commit/${commitHash}`;
      
      await this.commitLogRepository.save(commitLog);
      
      // Update job progress
      await this.updateJobProgress(commitLog.commitJobId);
      
    } catch (error) {
      commitLog.isSuccess = false;
      commitLog.errorMessage = error.message;
      commitLog.executedAt = new Date();
      await this.commitLogRepository.save(commitLog);
    }
  }

  private async ensureRepository(user: User, repoName: string, repoPath: string): Promise<void> {
    if (!fs.existsSync(repoPath)) {
      const repoUrl = `https://${user.githubAccessToken}@github.com/${user.githubUsername}/${repoName}.git`;
      fs.mkdirSync(path.dirname(repoPath), { recursive: true });
      
      const git = simpleGit();
      await git.clone(repoUrl, repoPath);
    }
  }

  private async createCommit(repoPath: string, message: string, user: User): Promise<string> {
    const git = simpleGit(repoPath);
    
    // Configure git user
    await git.addConfig('user.name', user.displayName || user.username);
    await git.addConfig('user.email', user.email);
    
    // Create activity file
    const activityDir = path.join(repoPath, '.gitboster');
    if (!fs.existsSync(activityDir)) {
      fs.mkdirSync(activityDir, { recursive: true });
    }
    
    const activityFile = path.join(activityDir, 'activity.txt');
    const timestamp = new Date().toISOString();
    const content = `${timestamp}: ${message}\n${uuidv4()}\n`;
    
    fs.appendFileSync(activityFile, content);
    
    // Stage and commit
    await git.add('.gitboster/activity.txt');
    const commitResult = await git.commit(message);
    
    // Push to remote
    await git.push('origin', 'main');
    
    return commitResult.commit;
  }

  private async updateJobProgress(jobId: string): Promise<void> {
    const job = await this.commitJobRepository.findOne({ where: { id: jobId } });
    if (!job) return;

    const completedCommits = await this.commitLogRepository.count({
      where: { commitJobId: jobId, isSuccess: true },
    });

    job.completedCommits = completedCommits;
    job.lastCommitAt = new Date();

    if (completedCommits >= job.totalCommits) {
      job.status = JobStatus.COMPLETED;
    }

    await this.commitJobRepository.save(job);
  }

  async getCommitAnalytics(userId: string): Promise<any> {
    const jobs = await this.commitJobRepository.find({
      where: { userId },
      relations: ['commitLogs'],
    });

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED).length;
    const runningJobs = jobs.filter(job => job.status === JobStatus.RUNNING).length;
    const totalCommits = jobs.reduce((sum, job) => sum + job.completedCommits, 0);
    
    // Daily commit statistics
    const commitsByDate = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.executedAt) as date')
      .addSelect('COUNT(*) as count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.isSuccess = :isSuccess', { isSuccess: true })
      .groupBy('DATE(log.executedAt)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    // Repository statistics
    const commitsByRepo = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('log.repoName as repo')
      .addSelect('COUNT(*) as count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.isSuccess = :isSuccess', { isSuccess: true })
      .groupBy('log.repoName')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      summary: {
        totalJobs,
        completedJobs,
        runningJobs,
        totalCommits,
        successRate: totalCommits > 0 ? (completedJobs / totalJobs) * 100 : 0,
      },
      commitsByDate,
      commitsByRepo,
    };
  }
}