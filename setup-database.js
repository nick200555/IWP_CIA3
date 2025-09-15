const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'cia'
    });

    console.log('Connected to MySQL database');

    // Create tables (same as backend.js)
    const queries = [
      // 1. External Funded Research
      `CREATE TABLE IF NOT EXISTS FundedResearch (
        id INT AUTO_INCREMENT PRIMARY KEY,
        TitleOfFund VARCHAR(255),
        DateReceived DATE,
        PrincipalInvestigator VARCHAR(255),
        CoInvestigator VARCHAR(255),
        AmountReceived DECIMAL(12,2),
        FundingAgencyName VARCHAR(255),
        GrantType VARCHAR(100),
        DocumentProof VARCHAR(255)
      )`,

      // 2. Books and Publication
      `CREATE TABLE IF NOT EXISTS BooksPublication (
        id INT AUTO_INCREMENT PRIMARY KEY,
        TitleOfBook VARCHAR(255),
        Author VARCHAR(255),
        ISBN VARCHAR(20),
        YearOfPublication YEAR,
        ProofDoc VARCHAR(255)
      )`,

      // 3. Articles and Research Journals
      `CREATE TABLE IF NOT EXISTS ResearchArticles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        TitleOfArticle VARCHAR(255),
        AuthorsCoAuthors VARCHAR(500),
        IndexingAgency VARCHAR(255),
        PublicationName VARCHAR(255),
        ISSN VARCHAR(20),
        PublicationDate DATE,
        DocProof VARCHAR(255)
      )`,

      // 4. Seminars and Conferences
      `CREATE TABLE IF NOT EXISTS SeminarsConferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255),
        Authors VARCHAR(500),
        Date DATE,
        ConferenceName VARCHAR(255),
        PlaceOfConference VARCHAR(255),
        ProofDoc VARCHAR(255)
      )`,

      // 5. Workshops / FDP / QIP / MOOC
      `CREATE TABLE IF NOT EXISTS Workshops (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255),
        Location VARCHAR(255),
        StartDate DATE,
        EndDate DATE,
        NoOfDays INT,
        ProofDoc VARCHAR(255)
      )`,

      // 6. Awards & Achievements
      `CREATE TABLE IF NOT EXISTS Awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255),
        Agency VARCHAR(255),
        Place VARCHAR(255),
        Date DATE,
        Type VARCHAR(50)
      )`,

      // 7. Patents
      `CREATE TABLE IF NOT EXISTS Patents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255),
        ApplicantsAuthors VARCHAR(500),
        Status VARCHAR(50),
        TypeOfPatent VARCHAR(100),
        PublicationNumbers VARCHAR(100),
        FilingDate DATE,
        AcceptedDate DATE,
        ProofDoc VARCHAR(255)
      )`,

      // 8. ERP Login - Enhanced User Management
      `CREATE TABLE IF NOT EXISTS ERPLogin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(100) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Email VARCHAR(255) UNIQUE,
        FullName VARCHAR(255),
        Role ENUM('admin', 'faculty', 'researcher', 'student') DEFAULT 'faculty',
        Department VARCHAR(255),
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        LastLogin TIMESTAMP NULL,
        IsActive BOOLEAN DEFAULT TRUE
      )`
    ];

    // Execute table creation queries
    for (const query of queries) {
      await connection.execute(query);
    }

    console.log('All tables created successfully');

    // Insert sample login credentials with enhanced user data
    const sampleUsers = [
      ['admin', 'admin123', 'admin@christuniversity.in', 'System Administrator', 'admin', 'IT Department'],
      ['faculty1', 'faculty123', 'faculty1@christuniversity.in', 'Dr. John Smith', 'faculty', 'Computer Science'],
      ['researcher1', 'research123', 'researcher1@christuniversity.in', 'Dr. Jane Doe', 'researcher', 'Research Department'],
      ['student1', 'student123', 'student1@christuniversity.in', 'Alice Johnson', 'student', 'Computer Science']
    ];

    for (const user of sampleUsers) {
      await connection.execute(
        'INSERT IGNORE INTO ERPLogin (Username, Password, Email, FullName, Role, Department) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }

    // Insert sample data
    const sampleData = [
      // Sample funded research
      `INSERT IGNORE INTO FundedResearch 
       (TitleOfFund, DateReceived, PrincipalInvestigator, CoInvestigator, AmountReceived, FundingAgencyName, GrantType, DocumentProof) 
       VALUES 
       ('AI Research Project', '2024-01-15', 'Dr. John Smith', 'Dr. Jane Doe', 500000.00, 'DST', 'Government', 'proof1.pdf'),
       ('Machine Learning Initiative', '2024-02-20', 'Dr. Alice Johnson', 'Dr. Bob Wilson', 750000.00, 'UGC', 'Government', 'proof2.pdf')`,

      // Sample books
      `INSERT IGNORE INTO BooksPublication 
       (TitleOfBook, Author, ISBN, YearOfPublication, ProofDoc) 
       VALUES 
       ('Advanced Machine Learning', 'Dr. John Smith', '978-1234567890', 2024, 'book1.pdf'),
       ('Data Science Fundamentals', 'Dr. Jane Doe', '978-0987654321', 2023, 'book2.pdf')`,

      // Sample articles
      `INSERT IGNORE INTO ResearchArticles 
       (TitleOfArticle, AuthorsCoAuthors, IndexingAgency, PublicationName, ISSN, PublicationDate, DocProof) 
       VALUES 
       ('Deep Learning Applications', 'Dr. John Smith, Dr. Jane Doe', 'SCI', 'Nature AI', '1234-5678', '2024-03-15', 'article1.pdf'),
       ('Quantum Computing Advances', 'Dr. Alice Johnson', 'SCOPUS', 'IEEE Transactions', '9876-5432', '2024-04-10', 'article2.pdf')`,

      // Sample conferences
      `INSERT IGNORE INTO SeminarsConferences 
       (Title, Authors, Date, ConferenceName, PlaceOfConference, ProofDoc) 
       VALUES 
       ('AI in Healthcare', 'Dr. John Smith', '2024-05-20', 'ICAI 2024', 'Bangalore', 'conf1.pdf'),
       ('Machine Learning Trends', 'Dr. Jane Doe', '2024-06-15', 'ML Summit 2024', 'Mumbai', 'conf2.pdf')`,

      // Sample workshops
      `INSERT IGNORE INTO Workshops 
       (Title, Location, StartDate, EndDate, NoOfDays, ProofDoc) 
       VALUES 
       ('Python for Data Science', 'CHRIST University', '2024-07-01', '2024-07-05', 5, 'workshop1.pdf'),
       ('Machine Learning Workshop', 'Online', '2024-08-10', '2024-08-12', 3, 'workshop2.pdf')`,

      // Sample awards
      `INSERT IGNORE INTO Awards 
       (Title, Agency, Place, Date, Type) 
       VALUES 
       ('Best Research Paper Award', 'IEEE', 'International', '2024-09-15', 'Government'),
       ('Excellence in Teaching', 'UGC', 'National', '2024-10-20', 'Government')`,

      // Sample patents
      `INSERT IGNORE INTO Patents 
       (Title, ApplicantsAuthors, Status, TypeOfPatent, PublicationNumbers, FilingDate, AcceptedDate, ProofDoc) 
       VALUES 
       ('AI-Powered Diagnostic System', 'Dr. John Smith, Dr. Jane Doe', 'Granted', 'National', 'IN2024001234', '2024-01-10', '2024-11-15', 'patent1.pdf'),
       ('Machine Learning Algorithm', 'Dr. Alice Johnson', 'Published', 'International', 'WO2024005678', '2024-03-05', NULL, 'patent2.pdf')`
    ];

    // Execute sample data queries
    for (const query of sampleData) {
      await connection.execute(query);
    }

    console.log('Sample data inserted successfully');
    console.log('\nSample login credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Faculty - Username: faculty1, Password: faculty123');
    console.log('Researcher - Username: researcher1, Password: research123');
    console.log('Student - Username: student1, Password: student123');

    await connection.end();
    console.log('\nDatabase setup completed successfully!');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();
