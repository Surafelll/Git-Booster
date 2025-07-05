const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
const cron = require('node-cron');
const simpleGit = require('simple-git');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Store scheduled jobs
const scheduledJobs = new Map();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gitboster-secret',
  resave: false,
  saveUninitialized: false
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  return done(null, {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    accessToken: accessToken,
    email: profile.emails ? profile.emails[0].value : null
  });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Commit message templates
const commitMessages = [
  'Update documentation',
  'Fix minor bug',
  'Improve code quality',
  'Add new feature',
  'Refactor code',
  'Update dependencies',
  'Fix typo',
  'Optimize performance',
  'Add tests',
  'Update README',
  'Clean up code',
  'Fix formatting',
  'Add comments',
  'Update configuration',
  'Improve error handling',
  'Add validation',
  'Update styles',
  'Fix security issue',
  'Add logging',
  'Update version'
];

// Helper function to get random commit message
function getRandomCommitMessage() {
  return commitMessages[Math.floor(Math.random() * commitMessages.length)];
}

// Helper function to create commits
async function createCommit(repoPath, message) {
  const git = simpleGit(repoPath);
  
  try {
    // Create a small dummy file or update existing one
    const dummyFile = path.join(repoPath, '.gitboster', 'activity.txt');
    const dummyDir = path.dirname(dummyFile);
    
    if (!fs.existsSync(dummyDir)) {
      fs.mkdirSync(dummyDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    fs.writeFileSync(dummyFile, `Activity: ${timestamp}\n${uuidv4()}\n`, { flag: 'a' });
    
    await git.add('.gitboster/activity.txt');
    await git.commit(message);
    
    return true;
  } catch (error) {
    console.error('Error creating commit:', error);
    return false;
  }
}

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// API Routes
app.get('/api/repos', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${req.user.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        visibility: 'public',
        sort: 'updated',
        per_page: 50
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.post('/api/schedule-commits', ensureAuthenticated, async (req, res) => {
  const { repoName, startDate, endDate, commitsPerDay } = req.body;
  
  if (!repoName || !startDate || !endDate || !commitsPerDay) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const commits = parseInt(commitsPerDay);
    
    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    if (commits < 1 || commits > 10) {
      return res.status(400).json({ error: 'Commits per day must be between 1 and 10' });
    }
    
    // Clone repository
    const repoUrl = `https://github.com/${req.user.username}/${repoName}.git`;
    const repoPath = path.join(__dirname, 'repos', req.user.username, repoName);
    
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(path.dirname(repoPath), { recursive: true });
      const git = simpleGit();
      await git.clone(repoUrl, repoPath);
    }
    
    // Configure git with user credentials
    const git = simpleGit(repoPath);
    await git.addConfig('user.name', req.user.displayName || req.user.username);
    await git.addConfig('user.email', req.user.email || `${req.user.username}@users.noreply.github.com`);
    
    // Schedule commits
    const jobId = uuidv4();
    const currentDate = new Date(start);
    
    const scheduleCommits = async () => {
      while (currentDate <= end) {
        const today = new Date(currentDate);
        
        // Schedule commits for this day
        for (let i = 0; i < commits; i++) {
          const commitTime = new Date(today);
          commitTime.setHours(Math.floor(Math.random() * 24));
          commitTime.setMinutes(Math.floor(Math.random() * 60));
          
          setTimeout(async () => {
            const message = getRandomCommitMessage();
            const success = await createCommit(repoPath, message);
            
            if (success) {
              try {
                await git.push('origin', 'main');
                console.log(`Commit pushed: ${message}`);
              } catch (error) {
                console.error('Error pushing commit:', error);
              }
            }
          }, commitTime.getTime() - Date.now());
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
    };
    
    // Start scheduling if the start date is in the future
    if (start > new Date()) {
      setTimeout(scheduleCommits, start.getTime() - Date.now());
    } else {
      scheduleCommits();
    }
    
    scheduledJobs.set(jobId, {
      repoName,
      startDate,
      endDate,
      commitsPerDay,
      userId: req.user.id
    });
    
    res.json({ 
      success: true, 
      jobId,
      message: 'Commits scheduled successfully' 
    });
    
  } catch (error) {
    console.error('Error scheduling commits:', error);
    res.status(500).json({ error: 'Failed to schedule commits' });
  }
});

app.get('/api/scheduled-jobs', ensureAuthenticated, (req, res) => {
  const userJobs = Array.from(scheduledJobs.entries())
    .filter(([_, job]) => job.userId === req.user.id)
    .map(([id, job]) => ({ id, ...job }));
  
  res.json(userJobs);
});

app.delete('/api/scheduled-jobs/:jobId', ensureAuthenticated, (req, res) => {
  const jobId = req.params.jobId;
  const job = scheduledJobs.get(jobId);
  
  if (!job || job.userId !== req.user.id) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  scheduledJobs.delete(jobId);
  res.json({ success: true, message: 'Job cancelled' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gitboster server running on port ${PORT}`);
});