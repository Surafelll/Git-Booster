import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
  ) {}

  @Get('repositories')
  async getUserRepositories(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user.githubAccessToken) {
      throw new Error('GitHub access token not found. Please reconnect your GitHub account.');
    }
    return this.githubService.getUserRepositories(user.githubAccessToken);
  }

  @Get('repositories/:owner/:repo')
  async getRepositoryInfo(@Param('owner') owner: string, @Param('repo') repo: string, @Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user.githubAccessToken) {
      throw new Error('GitHub access token not found. Please reconnect your GitHub account.');
    }
    return this.githubService.getRepositoryInfo(user.githubAccessToken, owner, repo);
  }

  @Get('user')
  async getUserInfo(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user.githubAccessToken) {
      throw new Error('GitHub access token not found. Please reconnect your GitHub account.');
    }
    return this.githubService.getUserInfo(user.githubAccessToken);
  }

  @Get('repositories/:owner/:repo/commits')
  async getCommitHistory(@Param('owner') owner: string, @Param('repo') repo: string, @Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user.githubAccessToken) {
      throw new Error('GitHub access token not found. Please reconnect your GitHub account.');
    }
    return this.githubService.getCommitHistory(user.githubAccessToken, owner, repo);
  }
}