# Gitboster 2.0

Gitboster is an advanced GitHub commit automation platform built with NestJS and React. It provides sophisticated commit scheduling, data analytics, and user management features to help maintain consistent GitHub activity.

## 🚀 Features

### Core Features
- 🔐 **Multi-Auth System** - JWT authentication + GitHub OAuth integration
- 👥 **User Management** - Complete CRUD operations with role-based access
- 📅 **Advanced Scheduling** - Intelligent commit scheduling with date ranges
- 🎯 **Smart Commit Logic** - Customizable commit messages and frequencies (1-20 per day)
- 🗂️ **Repository Management** - Full GitHub API integration
- ⏰ **Job Management** - Create, monitor, and cancel commit jobs

### Analytics & Insights
- � **Comprehensive Analytics** - Dashboard with detailed commit statistics
- 📈 **Trend Analysis** - 30-day commit trends and patterns
- 🏆 **Repository Analytics** - Per-repository performance metrics
- ⏰ **Time Distribution** - Hourly and weekly commit patterns
- 📋 **Job Performance** - Success rates and execution monitoring
- � **Advanced Insights** - AI-powered analytics and recommendations

### Technical Features
- 🏗️ **Modern Architecture** - NestJS backend with TypeORM and SQLite
- ⚡ **React Frontend** - Modern UI with Material-UI and TypeScript
- 🔒 **Enterprise Security** - JWT tokens with secure authentication
- 📊 **Data Visualization** - Interactive charts with Chart.js
- 🎨 **Responsive Design** - Beautiful, mobile-friendly interface
- 🚀 **Real-time Updates** - Live job status and analytics

## 🏗️ Architecture

### Backend (NestJS)
```
src/
├── auth/           # Authentication & Authorization
├── user/           # User CRUD operations
├── commit/         # Commit job management
├── github/         # GitHub API integration
├── analytics/      # Data analytics & insights
└── main.ts         # Application entry point
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/ # Reusable UI components
│   ├── pages/      # Application pages
│   ├── services/   # API service layer
│   ├── hooks/      # Custom React hooks
│   └── types/      # TypeScript definitions
```

## 🛠️ Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- GitHub account
- GitHub OAuth App

### 1. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: `Gitboster`
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy the Client ID and Client Secret

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your GitHub OAuth credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
JWT_SECRET=your_jwt_secret
PORT=3000
FRONTEND_URL=http://localhost:3001
NODE_ENV=development

# Build and start the backend
npm run build
npm run start:dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## 🎯 Usage

### Authentication
- **JWT Login**: Register/login with email and password
- **GitHub OAuth**: One-click authentication with GitHub
- **Token Management**: Secure JWT tokens with 7-day expiration

### Creating Commit Jobs
1. **Repository Selection**: Choose from your GitHub repositories
2. **Date Configuration**: Set start and end dates for the campaign
3. **Commit Frequency**: Configure 1-20 commits per day
4. **Custom Messages**: Use default messages or provide your own
5. **Schedule & Monitor**: Track job progress in real-time

### Analytics Dashboard
- **Overview**: Total jobs, commits, and success rates
- **Trends**: Visual charts showing commit patterns over time
- **Repository Insights**: Performance metrics per repository
- **Time Analysis**: Discover your most active hours and days
- **Job Monitoring**: Track individual job performance

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - JWT login
- `POST /api/auth/register` - User registration
- `GET /api/auth/github` - GitHub OAuth login
- `GET /api/auth/github/callback` - OAuth callback

### User Management
- `GET /api/users` - List users (admin)
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Commit Jobs
- `POST /api/commits/jobs` - Create commit job
- `GET /api/commits/jobs` - List user's jobs
- `GET /api/commits/jobs/:id` - Get job details
- `DELETE /api/commits/jobs/:id` - Cancel job

### GitHub Integration
- `GET /api/github/repositories` - List user repositories
- `GET /api/github/user` - Get GitHub user info
- `GET /api/github/repositories/:owner/:repo/commits` - Commit history

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/trends` - Commit trends
- `GET /api/analytics/repositories` - Repository analytics
- `GET /api/analytics/advanced` - Advanced insights

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend integration
- **GitHub Token Security**: Tokens stored securely and never logged

## 📊 Database Schema

### Users
- User profiles with GitHub integration
- Role-based access control
- Secure password storage

### Commit Jobs
- Flexible job configuration
- Status tracking and monitoring
- Custom commit message support

### Commit Logs
- Detailed execution logs
- Success/failure tracking
- Performance analytics

## 🚀 Deployment

### Production Build
```bash
# Backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
```

### Environment Variables
```bash
NODE_ENV=production
JWT_SECRET=strong_production_secret
GITHUB_CLIENT_ID=production_client_id
GITHUB_CLIENT_SECRET=production_client_secret
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and productivity purposes. Please use responsibly and in accordance with GitHub's terms of service. Excessive or inappropriate use may be considered abuse of GitHub's platform.

## 🆘 Support

- Create an issue for bug reports
- Star the repository if you find it useful
- Contribute to make it even better!