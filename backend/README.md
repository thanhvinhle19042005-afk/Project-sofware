# QuanLyToDanPho Backend

Backend API cho hệ thống Quản lý Tổ dân phố - Community Management System.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security** with JWT
- **Spring Data JPA**
- **MySQL** (Production)
- **H2 Database** (Development/Testing)
- **Maven**

## Features

- ✅ Authentication & Authorization (JWT)
- ✅ Event Management (Quản lý sự kiện)
- ✅ Event Registration (Đăng ký tham gia)
- ✅ Notification System (Hệ thống thông báo)
- ✅ Role-based Access Control (Admin/User)
- ✅ Meeting Minutes (Biên bản cuộc họp)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+ (for production)

## Getting Started

### 1. Clone the repository

```bash
cd backend
```

### 2. Configure Database

For **development** (H2 - no setup needed):
```bash
# Edit src/main/resources/application-dev.properties if needed
```

For **production** (MySQL):
```bash
# Create database
mysql -u root -p
CREATE DATABASE QuanLyToDanPho;

# Edit src/main/resources/application-prod.properties
spring.datasource.url=jdbc:mysql://localhost:3306/QuanLyToDanPho
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Build the project

```bash
mvn clean install
```

### 4. Run the application

**Development mode (H2 Database):**
```bash
mvn spring-boot:run
```

**Production mode (MySQL):**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

The application will start at `http://localhost:8080`

### 5. Default Admin Account

```
Username: admin
Password: admin123
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info

### Events (Sự kiện)
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/{id}` - Get event by ID
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/{id}` - Update event (Admin only)
- `PATCH /api/events/{id}/approve` - Approve event (Admin only)
- `PATCH /api/events/{id}/reject` - Reject event (Admin only)
- `DELETE /api/events/{id}` - Delete event (Admin only)

### Event Registrations (Đăng ký)
- `POST /api/registrations/register/{eventId}` - Register for event
- `DELETE /api/registrations/{id}/cancel` - Cancel registration
- `GET /api/registrations/my-registrations` - Get my registrations
- `GET /api/registrations/event/{eventId}` - Get event registrations (Admin only)

### Notifications (Thông báo)
- `POST /api/notifications` - Create notification (Admin only)
- `GET /api/notifications/my-notifications` - Get my notifications
- `PATCH /api/notifications/{id}/read` - Mark as read

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/quanlytodanpho/
│   │   │       ├── config/           # Configuration classes
│   │   │       ├── controller/       # REST Controllers
│   │   │       ├── dto/              # Data Transfer Objects
│   │   │       ├── entity/           # JPA Entities
│   │   │       ├── repository/       # Spring Data Repositories
│   │   │       ├── security/         # Security & JWT
│   │   │       ├── service/          # Business Logic
│   │   │       └── QuanLyToDanPhoApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   └── test/
├── pom.xml
└── README.md
```

## Railway Deployment

### 1. Create Railway Project

1. Sign up at [Railway.app](https://railway.app)
2. Create new project
3. Add MySQL database service

### 2. Set Environment Variables

In Railway dashboard, set these variables:

```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=<from-railway-mysql>
DATABASE_USERNAME=<from-railway-mysql>
DATABASE_PASSWORD=<from-railway-mysql>
JWT_SECRET=<your-secret-key>
CORS_ORIGINS=<your-frontend-url>
```

### 3. Deploy

**Option 1: Connect GitHub**
- Connect your GitHub repository
- Railway will auto-deploy on push

**Option 2: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### 4. Run Database Migration

Railway will automatically create tables on first run with `ddl-auto=update`.

To run the original SQL script:
```bash
# Connect to Railway MySQL
mysql -h <railway-host> -u <user> -p<password> <database> < ../../QuanLyToDanPho.sql
```

## Development Tools

### H2 Console (Development only)

When running in dev mode:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:quanlytodanpho`
- Username: `sa`
- Password: (leave empty)

### API Testing

Use **Postman**, **Thunder Client**, or **curl**:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}'

# Get events (with token)
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Port 8080 already in use
```bash
# Change port in application.properties
server.port=8081
```

### MySQL Connection Error
- Check if MySQL is running
- Verify credentials in application-prod.properties
- Ensure database exists

### JWT Secret Error
- Set a strong JWT secret in application.properties
- Minimum 256 bits (32 characters) recommended

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Private project - All rights reserved

## Support

For issues or questions, contact the development team.
