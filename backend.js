var mysql = require('mysql2/promise');

(async function() {
  try {
    var connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'cia'
    });

    console.log('Connected to MySQL!');

    var queries = [
      // 1. External Funded Research
      `CREATE TABLE IF NOT EXISTS FundedResearch (
        TitleOfFund VARCHAR(255),
        DateReceived DATE,
        PrincipalInvestigator VARCHAR(255),
        CoInvestigator VARCHAR(255),
        AmountReceived DECIMAL(12,2),
        FundingAgencyName VARCHAR(255),
        GrantType VARCHAR(100),
        DocumentProof VARCHAR(255)
      )`,

      // 2. Books and Publication (Modified)
      `CREATE TABLE IF NOT EXISTS BooksPublication (
        TitleOfBook VARCHAR(255),
        Author VARCHAR(255),
        ISBN VARCHAR(20),
        YearOfPublication YEAR,
        ProofDoc VARCHAR(255)
      )`,

      // 3. Articles and Research Journals
      `CREATE TABLE IF NOT EXISTS ResearchArticles (
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
        Title VARCHAR(255),
        Authors VARCHAR(500),
        Date DATE,
        ConferenceName VARCHAR(255),
        PlaceOfConference VARCHAR(255),
        ProofDoc VARCHAR(255)
      )`,

      // 5. Workshops / FDP / QIP / MOOC
      `CREATE TABLE IF NOT EXISTS Workshops (
        Title VARCHAR(255),
        Location VARCHAR(255),
        StartDate DATE,
        EndDate DATE,
        NoOfDays INT,
        ProofDoc VARCHAR(255)
      )`,

      // 6. Awards & Achievements
      `CREATE TABLE IF NOT EXISTS Awards (
        Title VARCHAR(255),
        Agency VARCHAR(255),
        Place VARCHAR(255),
        Date DATE,
        Type VARCHAR(50)
      )`,

      // 7. Patents
      `CREATE TABLE IF NOT EXISTS Patents (
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

    for (var i = 0; i < queries.length; i++) {
      await connection.execute(queries[i]);
    }

    console.log('All tables created or already exist.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();