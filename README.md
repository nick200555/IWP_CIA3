# CHRIST University Research & Publications ERP System

A comprehensive ERP system for managing research projects, publications, conferences, workshops, awards, and patents for CHRIST University.

## Features

- **Authentication System**: Secure login with JWT tokens
- **External Funded Research**: Manage funded research projects
- **Books & Publications**: Track faculty publications
- **Research Articles**: Manage journal articles and research papers
- **Seminars & Conferences**: Record conference presentations
- **Workshops**: Track FDP, QIP, MOOC programs
- **Awards & Achievements**: Manage faculty awards
- **Patents**: Track intellectual property
- **File Upload**: Support for document proof uploads
- **Responsive Design**: Modern, mobile-friendly interface

## Technology Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer (File Upload)
- CORS

### Frontend
- HTML5
- CSS3 (Bootstrap & Tailwind CSS)
- JavaScript (ES6+)
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone/Download the Project
```bash
# If using git
git clone <repository-url>
cd cia3

# Or download and extract the project files
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Using the setup script (Recommended)
```bash
# This will create tables and insert sample data
npm run setup-db
```

#### Option B: Manual setup
1. Create a MySQL database named `cia`
2. Run the `backend.js` script to create tables:
```bash
node backend.js
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cia

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000
```

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

## Usage

### 1. Access the Application
- Open your browser and go to `http://localhost:3000`
- You'll see the landing page

### 2. Login
- Click "Sign-in/Login" or go to `http://localhost:3000/login (1).html`
- Use the default credentials:
  - **Username**: `admin`
  - **Password**: `admin123`

### 3. Using the ERP System
- After login, you'll be redirected to the main ERP dashboard
- Navigate through different sections using the sidebar:
  - **External Funded Projects**: Add and manage funded research
  - **Books & Publications**: Track faculty publications
  - **Research Articles**: Manage journal articles
  - **Seminars/Conferences**: Record conference presentations
  - **Workshops**: Track training programs
  - **Awards & Achievements**: Manage faculty awards
  - **Patents**: Track intellectual property
  - **View Saved Projects**: View all saved funded research projects

### 4. Adding Data
- Fill out the forms in each section
- Upload supporting documents (PDFs, images)
- Click "Save" to store the data in the database
- Use "View Saved Projects" to see all saved data

## API Endpoints

### Authentication
- `POST /api/login` - User login

### Funded Research
- `POST /api/funded-research` - Create new project
- `GET /api/funded-research` - Get all projects

### Books & Publications
- `POST /api/books` - Add new book
- `GET /api/books` - Get all books

### Research Articles
- `POST /api/articles` - Add new article
- `GET /api/articles` - Get all articles

### Conferences
- `POST /api/conferences` - Add new conference
- `GET /api/conferences` - Get all conferences

### Workshops
- `POST /api/workshops` - Add new workshop
- `GET /api/workshops` - Get all workshops

### Awards
- `POST /api/awards` - Add new award
- `GET /api/awards` - Get all awards

### Patents
- `POST /api/patents` - Add new patent
- `GET /api/patents` - Get all patents

### File Upload
- `POST /api/upload` - Upload files

## File Structure

```
cia3/
├── server.js                 # Main Express server
├── backend.js               # Database setup script
├── setup-database.js        # Database initialization with sample data
├── package.json             # Dependencies and scripts
├── config.env              # Environment configuration
├── README.md               # This file
├── uploads/                # File upload directory (created automatically)
├── login (1).html          # Login page
├── landinggg.html          # Landing page
├── forgot-password.html    # Password reset page
└── cia_modified.html       # Main ERP interface
```

## Security Features

- JWT-based authentication
- Password hashing (ready for bcrypt implementation)
- CORS protection
- Input validation
- SQL injection prevention

## Development

### Adding New Features
1. Create new API endpoints in `server.js`
2. Update the frontend forms in `cia_modified.html`
3. Add corresponding database tables if needed
4. Test the integration

### Database Schema
The system uses the following main tables:
- `FundedResearch` - External funded projects
- `BooksPublication` - Faculty publications
- `ResearchArticles` - Journal articles
- `SeminarsConferences` - Conference presentations
- `Workshops` - Training programs
- `Awards` - Faculty achievements
- `Patents` - Intellectual property
- `ERPLogin` - User authentication

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials in `.env`
   - Ensure database `cia` exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Or kill the process using port 3000

3. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file permissions

4. **CORS Errors**
   - Verify server is running on correct port
   - Check API_BASE_URL in frontend code

### Logs
Check the console output for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, contact the development team or create an issue in the repository.

---

**Note**: This is a demo system. For production use, ensure proper security measures, database optimization, and user management features are implemented.
