import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommitJob, JobStatus } from '../commit/entities/commit-job.entity';
import { CommitLog } from '../commit/entities/commit-log.entity';
import { User } from '../user/entities/user.entity';
import * as moment from 'moment';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(CommitJob)
    private commitJobRepository: Repository<CommitJob>,
    @InjectRepository(CommitLog)
    private commitLogRepository: Repository<CommitLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDashboardAnalytics(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Basic stats
    const totalJobs = await this.commitJobRepository.count({ where: { userId } });
    const completedJobs = await this.commitJobRepository.count({ 
      where: { userId, status: JobStatus.COMPLETED } 
    });
    const runningJobs = await this.commitJobRepository.count({ 
      where: { userId, status: JobStatus.RUNNING } 
    });
    const totalCommits = await this.commitLogRepository.count({ 
      where: { userId, isSuccess: true } 
    });

    // Recent activity
    const recentCommits = await this.commitLogRepository.find({
      where: { userId, isSuccess: true },
      order: { executedAt: 'DESC' },
      take: 10,
    });

    // Success rate
    const totalAttempts = await this.commitLogRepository.count({ where: { userId } });
    const successRate = totalAttempts > 0 ? (totalCommits / totalAttempts) * 100 : 0;

    return {
      summary: {
        totalJobs,
        completedJobs,
        runningJobs,
        totalCommits,
        successRate: Math.round(successRate * 100) / 100,
      },
      recentCommits,
    };
  }

  async getCommitTrends(userId: string, days: number = 30) {
    const startDate = moment().subtract(days, 'days').startOf('day');
    
    const commitsByDate = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.executedAt) as date')
      .addSelect('COUNT(*) as count')
      .addSelect('SUM(CASE WHEN log.isSuccess = 1 THEN 1 ELSE 0 END) as successful')
      .where('log.userId = :userId', { userId })
      .andWhere('log.executedAt >= :startDate', { startDate: startDate.toDate() })
      .groupBy('DATE(log.executedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Fill missing dates with zero values
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const existingData = commitsByDate.find(item => item.date === date);
      dateRange.unshift({
        date,
        count: existingData ? parseInt(existingData.count) : 0,
        successful: existingData ? parseInt(existingData.successful) : 0,
      });
    }

    return dateRange;
  }

  async getRepositoryAnalytics(userId: string) {
    const commitsByRepo = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('log.repoName as repository')
      .addSelect('COUNT(*) as totalCommits')
      .addSelect('SUM(CASE WHEN log.isSuccess = 1 THEN 1 ELSE 0 END) as successfulCommits')
      .addSelect('MAX(log.executedAt) as lastCommit')
      .where('log.userId = :userId', { userId })
      .groupBy('log.repoName')
      .orderBy('totalCommits', 'DESC')
      .getRawMany();

    return commitsByRepo.map(repo => ({
      repository: repo.repository,
      totalCommits: parseInt(repo.totalCommits),
      successfulCommits: parseInt(repo.successfulCommits),
      successRate: repo.totalCommits > 0 ? 
        Math.round((repo.successfulCommits / repo.totalCommits) * 100) : 0,
      lastCommit: repo.lastCommit,
    }));
  }

  async getHourlyDistribution(userId: string) {
    const hourlyData = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('HOUR(log.executedAt) as hour')
      .addSelect('COUNT(*) as count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.isSuccess = 1')
      .groupBy('HOUR(log.executedAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Fill all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => {
      const existingData = hourlyData.find(item => parseInt(item.hour) === i);
      return {
        hour: i,
        count: existingData ? parseInt(existingData.count) : 0,
      };
    });

    return hours;
  }

  async getWeeklyDistribution(userId: string) {
    const weeklyData = await this.commitLogRepository
      .createQueryBuilder('log')
      .select('DAYOFWEEK(log.executedAt) as dayOfWeek')
      .addSelect('COUNT(*) as count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.isSuccess = 1')
      .groupBy('DAYOFWEEK(log.executedAt)')
      .orderBy('dayOfWeek', 'ASC')
      .getRawMany();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const days = dayNames.map((name, index) => {
      const existingData = weeklyData.find(item => parseInt(item.dayOfWeek) === index + 1);
      return {
        day: name,
        count: existingData ? parseInt(existingData.count) : 0,
      };
    });

    return days;
  }

  async getJobPerformance(userId: string) {
    const jobs = await this.commitJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.commitLogs', 'log')
      .where('job.userId = :userId', { userId })
      .orderBy('job.createdAt', 'DESC')
      .getMany();

    return jobs.map(job => {
      const totalScheduled = job.totalCommits;
      const completed = job.completedCommits;
      const failed = job.commitLogs.filter(log => !log.isSuccess).length;
      const pending = totalScheduled - completed - failed;

      return {
        id: job.id,
        repoName: job.repoName,
        status: job.status,
        startDate: job.startDate,
        endDate: job.endDate,
        commitsPerDay: job.commitsPerDay,
        totalScheduled,
        completed,
        failed,
        pending,
        successRate: totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0,
        createdAt: job.createdAt,
      };
    });
  }

  async getAdvancedAnalytics(userId: string) {
    // Get all analytics data
    const [
      dashboard,
      trends,
      repositories,
      hourlyDistribution,
      weeklyDistribution,
      jobPerformance,
    ] = await Promise.all([
      this.getDashboardAnalytics(userId),
      this.getCommitTrends(userId),
      this.getRepositoryAnalytics(userId),
      this.getHourlyDistribution(userId),
      this.getWeeklyDistribution(userId),
      this.getJobPerformance(userId),
    ]);

    // Calculate additional metrics
    const averageCommitsPerDay = trends.reduce((sum, day) => sum + day.count, 0) / trends.length;
    const mostActiveHour = hourlyDistribution.reduce((max, hour) => 
      hour.count > max.count ? hour : max
    );
    const mostActiveDay = weeklyDistribution.reduce((max, day) => 
      day.count > max.count ? day : max
    );

    return {
      dashboard,
      trends,
      repositories,
      hourlyDistribution,
      weeklyDistribution,
      jobPerformance,
      insights: {
        averageCommitsPerDay: Math.round(averageCommitsPerDay * 100) / 100,
        mostActiveHour: mostActiveHour.hour,
        mostActiveDay: mostActiveDay.day,
        totalRepositories: repositories.length,
        averageSuccessRate: repositories.length > 0 ? 
          Math.round(repositories.reduce((sum, repo) => sum + repo.successRate, 0) / repositories.length) : 0,
      },
    };
  }
}