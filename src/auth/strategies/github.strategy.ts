import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email', 'repo'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, displayName, emails } = profile;
    const email = emails && emails[0] ? emails[0].value : null;

    if (!email) {
      throw new Error('GitHub account must have a public email');
    }

    let user = await this.userService.findByGithubId(id);
    
    if (!user) {
      // Check if user exists with this email
      user = await this.userService.findByEmail(email);
      if (user) {
        // Update existing user with GitHub info
        user.githubId = id;
        user.githubUsername = username;
        user.githubAccessToken = accessToken;
        user.displayName = displayName;
        user = await this.userService.update(user.id, user);
      } else {
        // Create new user
        user = await this.userService.create({
          email,
          username: username || displayName,
          githubId: id,
          githubUsername: username,
          githubAccessToken: accessToken,
          displayName,
          isVerified: true,
        });
      }
    } else {
      // Update access token
      user.githubAccessToken = accessToken;
      user = await this.userService.update(user.id, user);
    }

    return user;
  }
}