# QuanLyToDanPho - Community Management System

Full-stack web application for managing community/neighborhood (Tổ dân phố) activities, events, and residents.

## Project Structure

```
Project-sofware-Son/
├── backend/              # Spring Boot API
├── frontend/             # React.js Application
├── QuanLyToDanPho.sql   # Database Schema
└── README.md
```

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.1 (Java 17)
- **Database**: MySQL (Production), H2 (Development)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **Build Tool**: Maven
- **Deployment**: Railway

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **Deployment**: Vercel

## Features

### Core Functionality
- ✅ **Event Management** - Create, manage, and track community events/meetings
- ✅ **Event Registration** - Residents can register for events
- ✅ **Notification System** - Automatic notifications for events and announcements
- ✅ **Document Attachments** - Attach files to events
- ✅ **Meeting Minutes** - Record and track meeting attendance
- ✅ **User Authentication** - Secure JWT-based authentication
- ✅ **Role-based Access** - Admin and User roles

### Admin Features
- Create and manage events
- Approve/reject events
- Send notifications
- View attendance records
- Manage meeting minutes

### User Features
- View upcoming events
- Register for events
- Receive notifications
- View personal event history

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+ (for production)
- Maven 3.6+

### Backend Setup

```bash
cd backend

# Development (H2 Database)
.\mvnw.cmd spring-boot:run

# Production (MySQL)
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Backend runs at: `http://localhost:8080`

Default admin credentials:
- Username: `admin`
- Password: `admin123`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Deployment

### Backend (Railway)

1. Create Railway project and add MySQL
2. Set environment variables:
   ```
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=<railway-mysql-url>
   JWT_SECRET=<your-secret>
   CORS_ORIGINS=<frontend-url>
   ```
3. Deploy via GitHub integration or Railway CLI

### Frontend (Vercel)

1. Connect GitHub repository
2. Set environment variables:
   ```
   VITE_API_URL=<backend-url>
   ```
3. Deploy automatically on push

## Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Frontend setup and features
- [Database Schema](./QuanLyToDanPho.sql) - Complete SQL schema

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List all events
- `GET /api/events/upcoming` - Upcoming events
- `POST /api/events` - Create event (Admin)
- `PATCH /api/events/{id}/approve` - Approve event (Admin)

### Registrations
- `POST /api/registrations/register/{eventId}` - Register for event
- `GET /api/registrations/my-registrations` - My registrations

### Notifications
- `GET /api/notifications/my-notifications` - My notifications
- `PATCH /api/notifications/{id}/read` - Mark as read

## Development Workflow

1. **Database**: Import `QuanLyToDanPho.sql` into MySQL
2. **Backend**: Start Spring Boot application
3. **Frontend**: Start React development server
4. **Testing**: Use Postman/Thunder Client for API testing

## Project Status

🚧 **In Development**

- [x] Backend API core features
- [x] Database schema
- [x] Authentication system
- [x] Frontend UI components
- [x] File upload system
- [x] Email notifications
- [x] Meeting minutes management
- [x] Deployment configuration

## Contributing

This is a private project. For questions or contributions, contact the development team.

## License

All rights reserved.
