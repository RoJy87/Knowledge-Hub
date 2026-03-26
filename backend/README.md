# Knowledge Hub Backend

NestJS backend API for the Knowledge Hub application - a team knowledge management system.

## Features

- 🔐 JWT Authentication (register, login, refresh, logout)
- 📚 Prisma ORM with PostgreSQL
- 🐳 Docker support
- 📖 Swagger API documentation
- 🛡️ Role-based access control
- ✅ Input validation with class-validator

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for PostgreSQL)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

### Running with Docker

Start PostgreSQL database:
```bash
docker-compose up -d postgres
```

Run database migrations:
```bash
pnpm prisma:migrate
```

Generate Prisma client:
```bash
pnpm prisma:generate
```

Start the development server:
```bash
pnpm run start:dev
```

### Running without Docker

1. Start PostgreSQL manually
2. Update `DATABASE_URL` in `.env`
3. Run migrations: `pnpm prisma:migrate`
4. Start server: `pnpm run start:dev`

## API Documentation

Once the server is running, access Swagger documentation at:
```
http://localhost:3000/api
```

## Available Scripts

```bash
# Development
pnpm run start:dev          # Start dev server with watch mode
pnpm run start:debug        # Start with debug mode

# Production
pnpm run build              # Build the application
pnpm run start:prod         # Start production server

# Database
pnpm prisma:generate        # Generate Prisma client
pnpm prisma:migrate         # Run migrations
pnpm prisma:migrate:deploy  # Deploy migrations (production)
pnpm prisma:studio          # Open Prisma Studio

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e              # Run E2E tests
pnpm test:cov              # Run tests with coverage

# Code quality
pnpm run lint              # Run ESLint
pnpm run format            # Format code with Prettier
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── common/                    # Shared utilities
│   │   ├── decorators/            # Custom decorators
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Route guards
│   │   ├── interceptors/          # Request/response interceptors
│   │   └── pipes/                 # Validation pipes
│   ├── config/                    # Configuration files
│   ├── modules/                   # Feature modules
│   │   └── auth/                  # Authentication module
│   └── prisma/                    # Prisma service
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── test/                          # E2E tests
├── .env                           # Environment variables
├── docker-compose.yml             # Docker configuration
└── package.json
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |

## Database Schema

The application uses the following main entities:

- **User** - Application users with roles (USER, ADMIN, MODERATOR)
- **Project** - Team projects
- **Article** - Knowledge base articles
- **Comment** - Article comments (nested)
- **Tag** - Article tags
- **Favorite** - User favorites
- **Activity** - Activity log

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT access token secret | - |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints
- CORS configuration

## License

UNLICENSED
