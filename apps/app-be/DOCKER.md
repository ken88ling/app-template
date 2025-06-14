# Docker Setup for Backend Development

This directory contains Docker Compose configurations for running development services.

## Quick Start

### Running Redis Only

```bash
# Start Redis
docker-compose up -d

# Stop Redis
docker-compose down

# View Redis logs
docker-compose logs redis
```

### Running All Development Services

```bash
# Start all services (Redis, PostgreSQL, and GUI tools)
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v
```

## Services

### Redis (Port 6379)
- Caching and session management
- Configured with 256MB memory limit
- Data persisted in volume

### Redis Commander (Port 8081)
- Web-based Redis GUI
- Access at: http://localhost:8081

### PostgreSQL (Port 5432) - Optional
- Production-like database for development
- Credentials:
  - User: `appuser`
  - Password: `apppassword`
  - Database: `appdb`

### pgAdmin (Port 8082) - Optional
- PostgreSQL GUI management
- Access at: http://localhost:8082
- Login:
  - Email: `admin@app.com`
  - Password: `admin`

## Environment Configuration

Update your `.env` file to use Docker services:

```env
# Redis
REDIS_URL=redis://localhost:6379

# PostgreSQL (if using instead of SQLite)
DATABASE_URL=postgresql://appuser:apppassword@localhost:5432/appdb
```

## Useful Commands

```bash
# View running containers
docker ps

# Access Redis CLI
docker exec -it app-be-redis redis-cli

# Access PostgreSQL
docker exec -it app-be-postgres psql -U appuser -d appdb

# View logs for specific service
docker-compose logs -f redis
docker-compose logs -f postgres

# Restart a specific service
docker-compose restart redis
```

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

```bash
# Check what's using the port (e.g., 6379)
lsof -i :6379

# Kill the process or change the port in docker-compose.yml
```

### Permission Issues
If you encounter permission issues with volumes:

```bash
# Remove volumes and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Issues
Ensure the services are healthy:

```bash
docker-compose ps
docker-compose logs
```