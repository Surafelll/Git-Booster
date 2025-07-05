# Gitboster

Gitboster is a GitHub commit automation tool that helps you boost your GitHub activity with automated commits. Schedule commits across date ranges and maintain consistent GitHub activity.

## Features

- 🔐 **GitHub OAuth Authentication** - Secure login with your GitHub account
- 📅 **Date Range Selection** - Choose specific date ranges for commit activity
- 🔄 **Customizable Frequency** - Set 1-10 commits per day
- 📝 **Smart Commit Messages** - Automatic generation of professional commit messages
- 🗂️ **Repository Management** - Select from your public repositories
- ⏰ **Scheduled Jobs** - View and manage your scheduled commit jobs

## Setup

### Prerequisites
- Node.js (v14 or higher)
- GitHub account
- GitHub OAuth App

### 1. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: `Gitboster`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and Client Secret

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and add your GitHub OAuth credentials:
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_session_secret
PORT=3000
BASE_URL=http://localhost:3000
```

### 4. Start the Application

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

1. **Authentication**: Visit `http://localhost:3000` and sign in with GitHub
2. **Repository Selection**: Choose a public repository from your account
3. **Date Configuration**: Select start and end dates for commit activity
4. **Frequency Setting**: Choose how many commits per day (1-10)
5. **Schedule**: Click "Schedule Commits" to start the automation
6. **Monitor**: View and manage scheduled jobs in the dashboard

## How It Works

- The application clones your selected repository locally
- Creates commits in a `.gitboster` folder to avoid interfering with your actual code
- Generates random commit messages from a curated list
- Schedules commits at random times throughout each day
- Automatically pushes commits to your GitHub repository

## Important Notes

- ⚠️ **Use Responsibly**: This tool is for educational purposes. Artificial commit activity may violate GitHub's terms of service
- 🔒 **Security**: Your GitHub token is only stored in memory during the session
- 📁 **Repository Changes**: Only creates files in a `.gitboster` folder
- 🚫 **Limitations**: Works only with public repositories

## API Endpoints

- `GET /` - Landing page
- `GET /dashboard` - User dashboard (requires authentication)
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - OAuth callback
- `GET /api/repos` - Get user's repositories
- `POST /api/schedule-commits` - Schedule commit jobs
- `GET /api/scheduled-jobs` - Get scheduled jobs
- `DELETE /api/scheduled-jobs/:id` - Cancel scheduled job

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This tool is for educational purposes only. Use it responsibly and in accordance with GitHub's terms of service. Artificial commit activity may not reflect genuine contribution activity.