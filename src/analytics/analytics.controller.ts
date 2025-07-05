import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardAnalytics(@Request() req) {
    return this.analyticsService.getDashboardAnalytics(req.user.id);
  }

  @Get('trends')
  getCommitTrends(@Request() req, @Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.analyticsService.getCommitTrends(req.user.id, daysNumber);
  }

  @Get('repositories')
  getRepositoryAnalytics(@Request() req) {
    return this.analyticsService.getRepositoryAnalytics(req.user.id);
  }

  @Get('hourly')
  getHourlyDistribution(@Request() req) {
    return this.analyticsService.getHourlyDistribution(req.user.id);
  }

  @Get('weekly')
  getWeeklyDistribution(@Request() req) {
    return this.analyticsService.getWeeklyDistribution(req.user.id);
  }

  @Get('jobs')
  getJobPerformance(@Request() req) {
    return this.analyticsService.getJobPerformance(req.user.id);
  }

  @Get('advanced')
  getAdvancedAnalytics(@Request() req) {
    return this.analyticsService.getAdvancedAnalytics(req.user.id);
  }
}