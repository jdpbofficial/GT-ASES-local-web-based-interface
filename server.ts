import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

// Extend Express Request interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

const PORT = 3000;
const JWT_SECRET = 'gt-ases-secret-key-12345';
const DATA_DIR = path.resolve(process.cwd(), 'server_data');

console.log('Server Data Directory:', DATA_DIR);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  console.log('Creating server_data directory...');
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const APPLICANTS_FILE = path.join(DATA_DIR, 'applicants.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

function initFile(file: string, data: any) {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory for ${file}: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(file)) {
      console.log(`Initializing file: ${file}`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(`CRITICAL: Failed to initialize file ${file}:`, err);
  }
}

// Initial data if files don't exist
const DEFAULT_CONFIG = {
  "EDU_SCORES": { "High School": 10, "Vocational": 20, "Bachelor's": 40, "Master's": 55, "Doctorate": 70 },
  "EXP_SCORES": { "0 years": 0, "1-2 years": 10, "3-5 years": 20, "6-10 years": 30, "10+ years": 40 },
  "SKILL_PTS": 5,
  "CERT_PTS": 5,
  "QUALIFIED_MIN": 80,
  "FOR_REVIEW_MIN": 50,
  "POSITIONS": [
    "Junior Software Developer", "Network Engineer", "IT Support Specialist", 
    "Cybersecurity Analyst", "Database Administrator", "Systems Analyst", "Project Manager (IT)"
  ],
  "SKILLS_LIST": [
    "Python", "Java", "C++", "JavaScript", "HTML/CSS", "SQL", "Networking", 
    "Cybersecurity", "Database Admin", "Web Development", "Mobile Development", 
    "Cloud Computing", "Machine Learning", "Data Analysis", "System Administration"
  ],
  "CERTS_LIST": [
    "CCNA", "CompTIA A+", "CompTIA Security+", "AWS Certified", "PMP", 
    "TESDA NC II", "Oracle Certified", "Microsoft Certified", "Google IT Support", "Cisco CCNP"
  ],
  "POSITION_RELEVANCE": {
    "Junior Software Developer": {
      "relevant_skills": ["Python", "Java", "JavaScript", "HTML/CSS", "Web Development", "Mobile Development", "SQL"],
      "relevant_certs": ["Google IT Support", "AWS Certified", "Microsoft Certified"]
    },
    // ... truncated for brevity, will fill in more if needed or just use current
    "Network Engineer": { "relevant_skills": ["Networking", "Cybersecurity", "System Administration", "Cloud Computing"], "relevant_certs": ["CCNA", "Cisco CCNP", "CompTIA Security+"] },
    "IT Support Specialist": { "relevant_skills": ["Networking", "System Administration", "HTML/CSS", "Cybersecurity"], "relevant_certs": ["CompTIA A+", "Google IT Support", "TESDA NC II"] },
    "Cybersecurity Analyst": { "relevant_skills": ["Cybersecurity", "Networking", "Python", "Cloud Computing"], "relevant_certs": ["CompTIA Security+", "CCNA", "Cisco CCNP"] },
    "Database Administrator": { "relevant_skills": ["SQL", "Database Admin", "Python", "Data Analysis"], "relevant_certs": ["Oracle Certified", "Microsoft Certified", "AWS Certified"] },
    "Systems Analyst": { "relevant_skills": ["SQL", "Data Analysis", "Python", "Web Development", "System Administration"], "relevant_certs": ["Microsoft Certified", "AWS Certified", "PMP"] },
    "Project Manager (IT)": { "relevant_skills": ["Data Analysis", "Cloud Computing", "System Administration"], "relevant_certs": ["PMP", "AWS Certified", "Microsoft Certified"] }
  }
};

const DEFAULT_USERS = [
  { userID: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'Admin', fullName: 'HR Administrator' },
  { userID: 2, username: 'hrstaff', password: bcrypt.hashSync('staff123', 10), role: 'Staff', fullName: 'HR Staff Member' },
];

const DEFAULT_APPLICANTS = [
  {"applicantID": 1001, "firstName": "Maria", "lastName": "Santos", "age": 24, "gender": "Female",
   "contact": "09171234567", "email": "maria.santos@email.com", "position": "Junior Software Developer",
   "education": "Bachelor's", "experience": "1-2 years", "skills": ["Python", "JavaScript", "HTML/CSS"],
   "certifications": ["Google IT Support"], "score": 85, "status": "Qualified", "dateApplied": "2025-01-10"},
  {"applicantID": 1002, "firstName": "Juan", "lastName": "Dela Cruz", "age": 30, "gender": "Male",
   "contact": "09181234567", "email": "juan.dc@email.com", "position": "Network Engineer",
   "education": "Bachelor's", "experience": "3-5 years", "skills": ["Networking", "Cybersecurity", "CCNA"],
   "certifications": ["CCNA", "CompTIA Security+"], "score": 90, "status": "Qualified", "dateApplied": "2025-01-11"},
  {"applicantID": 1003, "firstName": "Ana", "lastName": "Reyes", "age": 27, "gender": "Female",
   "contact": "09191234567", "email": "ana.reyes@email.com", "position": "Database Administrator",
   "education": "Master's", "experience": "3-5 years", "skills": ["SQL", "Database Admin", "Python"],
   "certifications": ["Oracle Certified", "Microsoft Certified"], "score": 95, "status": "Qualified", "dateApplied": "2025-01-12"}
];

initFile(CONFIG_FILE, DEFAULT_CONFIG);
initFile(USERS_FILE, DEFAULT_USERS);
initFile(APPLICANTS_FILE, DEFAULT_APPLICANTS);

function loadJSON(file: string) {
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      if (!fs.existsSync(file)) {
        return [];
      }
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data);
    } catch (err: any) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        attempts++;
        // Sync wait for a few ms before retrying
        const start = Date.now();
        while (Date.now() - start < 50) {} 
        continue;
      }
      console.error(`Error loading JSON from ${file}:`, err);
      return [];
    }
  }
  return [];
}

function saveJSON(file: string, data: any) {
  let attempts = 0;
  const maxAttempts = 5;
  while (attempts < maxAttempts) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      return;
    } catch (err: any) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        attempts++;
        const start = Date.now();
        while (Date.now() - start < 50) {}
        continue;
      }
      console.error(`Error saving JSON to ${file}:`, err);
      return;
    }
  }
}

// Scoring Logic
function computeScore(app: any, config: any) {
  if (!config) return { score: 0, status: 'Draft' };
  
  const eduScores = config.EDU_SCORES || {};
  const expScores = config.EXP_SCORES || {};
  const skillPts = config.SKILL_PTS || 0;
  const certPts = config.CERT_PTS || 0;
  const qualifiedMin = config.QUALIFIED_MIN || 80;
  const forReviewMin = config.FOR_REVIEW_MIN || 50;

  const education = app.education || "";
  const experience = app.experience || "";
  const position = app.position || "";
  const skills = Array.isArray(app.skills) ? app.skills : [];
  const certs = Array.isArray(app.certifications) ? app.certifications : [];

  let score = (eduScores[education] || 0) + (expScores[experience] || 0);

  const relevance = (config.POSITION_RELEVANCE && config.POSITION_RELEVANCE[position]) || {};
  const relSkills = new Set(relevance.relevant_skills || []);
  const relCerts = new Set(relevance.relevant_certs || []);

  skills.forEach((skill: string) => {
    score += relSkills.has(skill) ? skillPts * 2 : skillPts;
  });

  certs.forEach((cert: string) => {
    score += relCerts.has(cert) ? certPts * 2 : certPts;
  });

  let status = "Disqualified";
  if (score >= qualifiedMin) status = "Qualified";
  else if (score >= forReviewMin) status = "For Review";

  return { score, status };
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      console.warn('Auth Failure: No token found in cookies');
      return res.status(401).json({ error: 'Session expired or not logged in' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.error('Auth Failure: Invalid/Expired token');
        return res.status(401).json({ error: 'Invalid session' });
      }
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'Admin') {
      console.warn(`Access Denied: User role is ${req.user?.role || 'Unknown'}, expected Admin`);
      return res.status(403).json({ error: 'Administrator privileges required' });
    }
    next();
  };

  // API Routes
  app.get('/api/config', (req: Request, res: Response) => {
    res.json(loadJSON(CONFIG_FILE));
  });

  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const users = loadJSON(USERS_FILE);
    const user = users.find((u: any) => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ userID: user.userID, username: user.username, role: user.role, fullName: user.fullName }, JWT_SECRET, { expiresIn: '24h' });
      
      // Use more permissive settings for the preview environment (iframes)
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({ user: { userID: user.userID, username: user.username, role: user.role, fullName: user.fullName } });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });

  app.post('/api/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  app.get('/api/applicants', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const applicants = loadJSON(APPLICANTS_FILE);
    res.json(applicants);
  });

  app.post('/api/applicants', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    console.log('Adding new applicant:', req.body);
    const applicants = loadJSON(APPLICANTS_FILE);
    const config = loadJSON(CONFIG_FILE);
    const newApplicant = {
      ...req.body,
      applicantID: applicants.length > 0 ? Math.max(...applicants.map((a: any) => a.applicantID)) + 1 : 1001,
      dateApplied: new Date().toISOString().split('T')[0]
    };
    const { score, status } = computeScore(newApplicant, config);
    newApplicant.score = score;
    newApplicant.status = status;
    
    applicants.push(newApplicant);
    saveJSON(APPLICANTS_FILE, applicants);
    res.json(newApplicant);
  });

  app.put('/api/applicants/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const applicants = loadJSON(APPLICANTS_FILE);
    const config = loadJSON(CONFIG_FILE);
    const index = applicants.findIndex((a: any) => a.applicantID === id);
    
    if (index !== -1) {
      const updated = { ...applicants[index], ...req.body, applicantID: id };
      const { score, status } = computeScore(updated, config);
      updated.score = score;
      updated.status = status;
      applicants[index] = updated;
      saveJSON(APPLICANTS_FILE, applicants);
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Applicant not found' });
    }
  });

  app.delete('/api/applicants/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    let applicants = loadJSON(APPLICANTS_FILE);
    applicants = applicants.filter((a: any) => a.applicantID !== id);
    saveJSON(APPLICANTS_FILE, applicants);
    res.json({ message: 'Deleted' });
  });

  app.get('/api/stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const applicants = loadJSON(APPLICANTS_FILE);
    const total = applicants.length;
    const qualified = applicants.filter((a: any) => a.status === 'Qualified').length;
    const forReview = applicants.filter((a: any) => a.status === 'For Review').length;
    const disqualified = applicants.filter((a: any) => a.status === 'Disqualified').length;
    res.json({ total, qualified, forReview, disqualified });
  });

  // User Management (Admin Only)
  app.get('/api/users', authenticateToken, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const users = loadJSON(USERS_FILE).map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(users);
  });

  app.post('/api/users', authenticateToken, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    console.log('Admin adding new user:', req.body.username);
    const { username, password, role, fullName } = req.body;
    
    if (!username || !password || !role || !fullName) {
      return res.status(400).json({ error: 'All fields (username, password, role, fullName) are required.' });
    }

    const users = loadJSON(USERS_FILE);
    if (users.find((u: any) => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const newUser = {
      userID: users.length > 0 ? Math.max(...users.map((u: any) => u.userID)) + 1 : 1,
      username,
      password: bcrypt.hashSync(password, 10),
      role,
      fullName
    };
    users.push(newUser);
    saveJSON(USERS_FILE, users);
    const { password: _, ...rest } = newUser;
    res.json(rest);
  });

  app.delete('/api/users/:id', authenticateToken, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    if (id === 1) return res.status(400).json({ error: 'Primary administrator cannot be deleted.' });
    
    let users = loadJSON(USERS_FILE);
    users = users.filter((u: any) => u.userID !== id);
    saveJSON(USERS_FILE, users);
    res.json({ message: 'User deleted' });
  });

  app.post('/api/users/:id/reset', authenticateToken, isAdmin, (req: AuthenticatedRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;
    
    if (!newPassword) return res.status(400).json({ error: 'New password is required.' });

    const users = loadJSON(USERS_FILE);
    const index = users.findIndex((u: any) => u.userID === id);
    
    if (index !== -1) {
      users[index].password = bcrypt.hashSync(newPassword, 10);
      saveJSON(USERS_FILE, users);
      res.json({ message: 'Password reset successful' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
