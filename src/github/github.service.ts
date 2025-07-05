import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GithubService {
  private readonly githubApiUrl = 'https://api.github.com';

  async getUserRepositories(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.githubApiUrl}/user/repos`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params: {
          visibility: 'public',
          sort: 'updated',
          per_page: 100,
        },
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        default_branch: repo.default_branch,
        private: repo.private,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  async getRepositoryInfo(accessToken: string, owner: string, repo: string): Promise<any> {
    try {
      const response = await axios.get(`${this.githubApiUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        description: response.data.description,
        html_url: response.data.html_url,
        clone_url: response.data.clone_url,
        default_branch: response.data.default_branch,
        private: response.data.private,
        permissions: response.data.permissions,
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error.message}`);
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.githubApiUrl}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        html_url: response.data.html_url,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        created_at: response.data.created_at,
      };
    } catch (error) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }

  async getCommitHistory(accessToken: string, owner: string, repo: string, since?: string): Promise<any[]> {
    try {
      const params: any = {
        per_page: 100,
      };

      if (since) {
        params.since = since;
      }

      const response = await axios.get(`${this.githubApiUrl}/repos/${owner}/${repo}/commits`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params,
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author,
        date: commit.commit.author.date,
        html_url: commit.html_url,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch commit history: ${error.message}`);
    }
  }
}