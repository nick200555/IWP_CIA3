const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  try {
    // Connect to MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'cia'
    });

    console.log('Connected to MySQL database');

    // Drop and recreate ERPLogin table with enhanced structure
    await connection.execute('DROP TABLE IF EXISTS ERPLogin');
    console.log('Dropped existing ERPLogin table');

    // Create enhanced ERPLogin table
    await connection.execute(`
      CREATE TABLE ERPLogin (
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
      )
    `);
    console.log('Created enhanced ERPLogin table');

    // Insert sample users
    const sampleUsers = [
      ['admin', 'admin123', 'admin@christuniversity.in', 'System Administrator', 'admin', 'IT Department'],
      ['faculty1', 'faculty123', 'faculty1@christuniversity.in', 'Dr. John Smith', 'faculty', 'Computer Science'],
      ['researcher1', 'research123', 'researcher1@christuniversity.in', 'Dr. Jane Doe', 'researcher', 'Research Department'],
      ['student1', 'student123', 'student1@christuniversity.in', 'Alice Johnson', 'student', 'Computer Science']
    ];

    for (const user of sampleUsers) {
      await connection.execute(
        'INSERT INTO ERPLogin (Username, Password, Email, FullName, Role, Department) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }

    console.log('Sample users inserted successfully');
    console.log('\nSample login credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Faculty - Username: faculty1, Password: faculty123');
    console.log('Researcher - Username: researcher1, Password: research123');
    console.log('Student - Username: student1, Password: student123');

    await connection.end();
    console.log('\nDatabase fix completed successfully!');
  } catch (error) {
    console.error('Database fix error:', error);
    process.exit(1);
  }
}

fixDatabase();
