#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Main script
case "$1" in
    start)
        print_status "Starting Redis..."
        docker-compose up -d
        print_status "Redis is running on port 6379"
        print_status "Redis Commander is available at http://localhost:8081"
        ;;
    
    start-all)
        print_status "Starting all development services..."
        docker-compose -f docker-compose.dev.yml up -d
        print_status "Services started:"
        echo "  - Redis: localhost:6379"
        echo "  - Redis Commander: http://localhost:8081"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - pgAdmin: http://localhost:8082"
        ;;
    
    stop)
        print_status "Stopping services..."
        docker-compose down
        print_status "Services stopped"
        ;;
    
    stop-all)
        print_status "Stopping all services..."
        docker-compose -f docker-compose.dev.yml down
        print_status "All services stopped"
        ;;
    
    clean)
        print_warning "This will remove all data. Are you sure? (y/n)"
        read -r response
        if [[ "$response" == "y" ]]; then
            print_status "Cleaning up..."
            docker-compose down -v
            print_status "Cleanup complete"
        else
            print_status "Cleanup cancelled"
        fi
        ;;
    
    logs)
        docker-compose logs -f ${2:-redis}
        ;;
    
    status)
        print_status "Service status:"
        docker-compose ps
        ;;
    
    redis-cli)
        print_status "Connecting to Redis CLI..."
        docker exec -it app-be-redis redis-cli
        ;;
    
    *)
        echo "Usage: $0 {start|start-all|stop|stop-all|clean|logs|status|redis-cli}"
        echo ""
        echo "Commands:"
        echo "  start      - Start Redis only"
        echo "  start-all  - Start all development services"
        echo "  stop       - Stop Redis"
        echo "  stop-all   - Stop all services"
        echo "  clean      - Remove all containers and volumes"
        echo "  logs       - View logs (usage: $0 logs [service])"
        echo "  status     - Show service status"
        echo "  redis-cli  - Connect to Redis CLI"
        exit 1
        ;;
esac