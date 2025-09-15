const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cia'
};

let db;

// Initialize database connection
async function initDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user exists and is active
    const [rows] = await db.execute(
      'SELECT * FROM ERPLogin WHERE Username = ? AND IsActive = TRUE',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or account disabled' });
    }

    const user = rows[0];
    
    // For demo purposes, we'll use simple password comparison
    // In production, use bcrypt to hash passwords
    if (password !== user.Password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login timestamp
    await db.execute(
      'UPDATE ERPLogin SET LastLogin = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { username: user.Username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: { username: user.Username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, fullName, role, department } = req.body;

    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ error: 'Username, password, email, and full name are required' });
    }

    // Check if username already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM ERPLogin WHERE Username = ? OR Email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO ERPLogin (Username, Password, Email, FullName, Role, Department) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, email, fullName, role || 'faculty', department || '']
    );

    res.json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// External Funded Research endpoints
app.post('/api/funded-research', authenticateToken, async (req, res) => {
  try {
    const {
      titleOfFund,
      dateReceived,
      principalInvestigator,
      coInvestigator,
      amountReceived,
      fundingAgencyName,
      grantType,
      documentProof
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO FundedResearch 
       (TitleOfFund, DateReceived, PrincipalInvestigator, CoInvestigator, 
        AmountReceived, FundingAgencyName, GrantType, DocumentProof) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [titleOfFund, dateReceived, principalInvestigator, coInvestigator, 
       amountReceived, fundingAgencyName, grantType, documentProof]
    );

    res.json({ 
      message: 'Funded research project saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving funded research:', error);
    res.status(500).json({ error: 'Failed to save funded research project' });
  }
});

app.get('/api/funded-research', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM FundedResearch ORDER BY DateReceived DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching funded research:', error);
    res.status(500).json({ error: 'Failed to fetch funded research projects' });
  }
});

// Books & Publications endpoints
app.post('/api/books', authenticateToken, async (req, res) => {
  try {
    const { titleOfBook, author, isbn, yearOfPublication, proofDoc } = req.body;

    const [result] = await db.execute(
      `INSERT INTO BooksPublication (TitleOfBook, Author, ISBN, YearOfPublication, ProofDoc) 
       VALUES (?, ?, ?, ?, ?)`,
      [titleOfBook, author, isbn, yearOfPublication, proofDoc]
    );

    res.json({ 
      message: 'Book saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).json({ error: 'Failed to save book' });
  }
});

app.get('/api/books', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM BooksPublication ORDER BY YearOfPublication DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Research Articles endpoints
app.post('/api/articles', authenticateToken, async (req, res) => {
  try {
    const {
      titleOfArticle,
      authorsCoAuthors,
      indexingAgency,
      publicationName,
      issn,
      publicationDate,
      docProof
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO ResearchArticles 
       (TitleOfArticle, AuthorsCoAuthors, IndexingAgency, PublicationName, 
        ISSN, PublicationDate, DocProof) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titleOfArticle, authorsCoAuthors, indexingAgency, publicationName, 
       issn, publicationDate, docProof]
    );

    res.json({ 
      message: 'Article saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
});

app.get('/api/articles', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM ResearchArticles ORDER BY PublicationDate DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Seminars & Conferences endpoints
app.post('/api/conferences', authenticateToken, async (req, res) => {
  try {
    const { title, authors, date, conferenceName, placeOfConference, proofDoc } = req.body;

    const [result] = await db.execute(
      `INSERT INTO SeminarsConferences 
       (Title, Authors, Date, ConferenceName, PlaceOfConference, ProofDoc) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, authors, date, conferenceName, placeOfConference, proofDoc]
    );

    res.json({ 
      message: 'Conference saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving conference:', error);
    res.status(500).json({ error: 'Failed to save conference' });
  }
});

app.get('/api/conferences', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM SeminarsConferences ORDER BY Date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching conferences:', error);
    res.status(500).json({ error: 'Failed to fetch conferences' });
  }
});

// Workshops endpoints
app.post('/api/workshops', authenticateToken, async (req, res) => {
  try {
    const { title, location, startDate, endDate, noOfDays, proofDoc } = req.body;

    const [result] = await db.execute(
      `INSERT INTO Workshops (Title, Location, StartDate, EndDate, NoOfDays, ProofDoc) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, location, startDate, endDate, noOfDays, proofDoc]
    );

    res.json({ 
      message: 'Workshop saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving workshop:', error);
    res.status(500).json({ error: 'Failed to save workshop' });
  }
});

app.get('/api/workshops', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Workshops ORDER BY StartDate DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching workshops:', error);
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

// Awards endpoints
app.post('/api/awards', authenticateToken, async (req, res) => {
  try {
    const { title, agency, place, date, type } = req.body;

    const [result] = await db.execute(
      `INSERT INTO Awards (Title, Agency, Place, Date, Type) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, agency, place, date, type]
    );

    res.json({ 
      message: 'Award saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving award:', error);
    res.status(500).json({ error: 'Failed to save award' });
  }
});

app.get('/api/awards', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Awards ORDER BY Date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ error: 'Failed to fetch awards' });
  }
});

// Patents endpoints
app.post('/api/patents', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      applicantsAuthors,
      status,
      typeOfPatent,
      publicationNumbers,
      filingDate,
      acceptedDate,
      proofDoc
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO Patents 
       (Title, ApplicantsAuthors, Status, TypeOfPatent, PublicationNumbers, 
        FilingDate, AcceptedDate, ProofDoc) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, applicantsAuthors, status, typeOfPatent, publicationNumbers, 
       filingDate, acceptedDate, proofDoc]
    );

    res.json({ 
      message: 'Patent saved successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving patent:', error);
    res.status(500).json({ error: 'Failed to save patent' });
  }
});

app.get('/api/patents', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM Patents ORDER BY FilingDate DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patents:', error);
    res.status(500).json({ error: 'Failed to fetch patents' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landinggg.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- POST /api/login');
    console.log('- POST /api/funded-research');
    console.log('- GET /api/funded-research');
    console.log('- POST /api/books');
    console.log('- GET /api/books');
    console.log('- POST /api/articles');
    console.log('- GET /api/articles');
    console.log('- POST /api/conferences');
    console.log('- GET /api/conferences');
    console.log('- POST /api/workshops');
    console.log('- GET /api/workshops');
    console.log('- POST /api/awards');
    console.log('- GET /api/awards');
    console.log('- POST /api/patents');
    console.log('- GET /api/patents');
    console.log('- POST /api/upload');
  });
}

startServer().catch(console.error);
