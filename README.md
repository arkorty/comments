# High-Performance Comment System

A minimalistic, full-stack comment system built with **TypeScript**, **NestJS**, **React**, and **PostgreSQL**, featuring high-density technical design, real-time notifications, and Docker-based deployment. Read the API documentation [here](https://comments.webark.in/api/docs).

## 🚀 Features

### ✅ Core Functionality
- **JWT Authentication** - Secure user registration and login
- **Nested Comments** - Unlimited depth reply system with tree structure
- **Real-time Updates** - Auto-refresh every 10-15 seconds
- **Edit/Delete Permissions** - 15-minute grace period for modifications
- **Notification System** - Read/unread toggles for replies

### 🎯 Technical Design
- **High-Density UI** - Compact, information-rich interface
- **System Status Monitoring** - Real-time API connectivity indicators
- **Technical Typography** - Monospace fonts for data display
- **Dark Theme** - Professional developer aesthetic
- **Responsive Design** - Works on all screen sizes

### 📊 Advanced Features
- **Comment Statistics** - Total, active, deleted, and reply counts
- **Sorting Options** - Newest, oldest, most replies
- **Filter Controls** - Hide/show deleted comments
- **Real-time Notifications** - Instant reply notifications
- **Performance Optimized** - Efficient database queries with CTEs

## 🏗️ Architecture

### Backend (NestJS)
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # JWT authentication
│   │   ├── users/         # User management
│   │   ├── comments/      # Comment CRUD operations
│   │   └── notifications/ # Notification system
│   ├── config/
│   │   └── database.config.ts
│   └── main.ts
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Comments.tsx       # High-density comment display
│   │   ├── Notifications.tsx  # Notification management
│   │   ├── CommentItem.tsx    # Individual comment component
│   │   └── ...
│   ├── hooks/
│   │   └── useAuth.tsx        # Authentication state
│   └── services/
│       └── api.ts            # API client
```

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL
- **Frontend**: React, TypeScript, React Query
- **Database**: PostgreSQL with CTE queries for nested comments
- **Authentication**: JWT with Passport.js
- **Deployment**: Docker & Docker Compose
- **Styling**: CSS Variables, Dark theme, Technical design

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)

### One-Command Setup
```bash
# Clone and start the entire system
git clone <repository>
cd comments
docker-compose up --build
```

### Manual Setup
```bash
# 1. Start PostgreSQL
docker-compose up -d db

# 2. Start Backend
cd backend
npm install
npm run build
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=password DB_NAME=comments_db JWT_SECRET=supersecretkey JWT_EXPIRES_IN=7d NODE_ENV=development PORT=3001 FRONTEND_URL=http://localhost:3000 node dist/main.js

# 3. Start Frontend
cd frontend
npm install
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Comments
- `GET /api/v1/comments` - Get all comments (tree structure)
- `POST /api/v1/comments` - Create new comment
- `PUT /api/v1/comments/:id` - Edit comment (15min limit)
- `DELETE /api/v1/comments/:id` - Delete comment (15min limit)
- `POST /api/v1/comments/:id/undo-delete` - Restore deleted comment

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `POST /api/v1/notifications/:id/read` - Mark as read
- `POST /api/v1/notifications/mark-all-read` - Mark all as read

### Documentation
- `GET /api/docs` - Swagger API documentation

## 🎨 UI Features

### High-Density Design
- **System Status Bar** - API connectivity, sync status, user info
- **Compact Layout** - Minimal padding, efficient space usage
- **Technical Typography** - Monospace fonts for data
- **Status Indicators** - Color-coded dots and badges
- **Real-time Stats** - Live comment counts and metrics

### Comment Management
- **Tree Structure** - Hierarchical comment display
- **Inline Actions** - Edit, delete, reply buttons
- **Time-based Permissions** - 15-minute edit/delete window
- **Sorting & Filtering** - Multiple view options
- **Real-time Updates** - Auto-refresh with visual indicators

### Notification System
- **Reply Notifications** - Instant alerts for new replies
- **Read/Unread Toggle** - Individual and bulk mark as read
- **Notification Counts** - Real-time unread indicators
- **Filter Options** - Show all or unread only

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Development mode with hot reload
npm run build        # Production build
npm run test         # Run tests
```

### Frontend Development
```bash
cd frontend
npm start           # Development server
npm run build       # Production build
npm test            # Run tests
```

### Database Management
```bash
# Access PostgreSQL
docker exec -it comments-db-1 psql -U postgres -d comments_db

# View tables
\dt

# Check notifications
SELECT * FROM notifications;
```

## 📊 Performance Features

### Database Optimizations
- **CTE Queries** - Efficient nested comment retrieval
- **Indexed Fields** - Optimized for comment trees
- **Cascade Deletes** - Automatic cleanup
- **Connection Pooling** - Efficient database connections

### Frontend Optimizations
- **React Query** - Intelligent caching and background updates
- **Virtual Scrolling** - Efficient large comment lists
- **Debounced Updates** - Reduced API calls
- **Optimistic Updates** - Instant UI feedback

### Real-time Features
- **Auto-refresh** - Comments (10s), notifications (15s)
- **WebSocket Ready** - Architecture supports real-time updates
- **Background Sync** - Seamless data updates
- **Error Recovery** - Automatic retry mechanisms

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Comprehensive DTO validation
- **SQL Injection Protection** - TypeORM parameterized queries
- **CORS Configuration** - Secure cross-origin requests
- **Rate Limiting** - Built-in protection against abuse

## 🐳 Docker Deployment

### Production Build
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=comments_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📈 Scalability

### Horizontal Scaling
- **Stateless Backend** - Easy horizontal scaling
- **Database Sharding** - PostgreSQL partitioning ready
- **Load Balancing** - Nginx configuration included
- **Caching Layer** - Redis integration ready

### Performance Monitoring
- **Health Checks** - Built-in monitoring endpoints
- **Metrics Collection** - Performance data gathering
- **Error Tracking** - Comprehensive error handling
- **Logging** - Structured logging for debugging

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test              # Unit tests
npm run test:coverage # Coverage report
```

## 📝 API Documentation

Visit `http://localhost:3001/api/docs` for interactive Swagger documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for high-performance, scalable comment systems** 
