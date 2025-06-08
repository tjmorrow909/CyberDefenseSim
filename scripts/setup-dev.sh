#!/bin/bash

# CyberDefense Simulator - Development Environment Setup Script
# This script sets up the development environment for the CyberDefense Simulator

set -e  # Exit on any error

echo "🚀 Setting up CyberDefense Simulator Development Environment"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            print_warning "Node.js version 18 or higher is recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if Docker is installed (optional)
check_docker() {
    print_status "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. You can still run the app without Docker."
        DOCKER_AVAILABLE=false
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm ci
    print_success "Dependencies installed successfully"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cat > .env << EOF
# CyberDefense Simulator Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://cyberdefense:dev_password@localhost:5432/cyberdefense_sim

# Redis Configuration (optional)
REDIS_URL=redis://:dev_password@localhost:6379

# JWT Configuration
JWT_SECRET=dev_jwt_secret_not_for_production_$(openssl rand -hex 32)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=dev_session_secret_not_for_production_$(openssl rand -hex 32)

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Feature Flags
USE_DATABASE=false
ENABLE_WEBSOCKETS=true
ENABLE_RATE_LIMITING=true

# Development Tools
ENABLE_API_DOCS=true
ENABLE_DEBUG_ROUTES=true
EOF
        print_success ".env file created"
    else
        print_warning ".env file already exists. Skipping creation."
    fi
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d .git ]; then
        # Install husky if not already installed
        if [ ! -d .husky ]; then
            npx husky install
            print_success "Husky installed and configured"
        else
            print_warning "Husky already configured"
        fi
        
        # Make hook files executable
        chmod +x .husky/pre-commit
        chmod +x .husky/commit-msg
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Setup database (if Docker is available)
setup_database() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Setting up database with Docker..."
        
        # Check if docker-compose is available
        if command -v docker-compose &> /dev/null; then
            COMPOSE_CMD="docker-compose"
        elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
        else
            print_warning "Docker Compose not found. Skipping database setup."
            return
        fi
        
        # Start only the database services
        $COMPOSE_CMD up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        print_status "Running database migrations..."
        npm run db:push
        
        print_success "Database setup completed"
    else
        print_warning "Docker not available. Please set up PostgreSQL manually."
        print_status "Database connection string: postgresql://cyberdefense:dev_password@localhost:5432/cyberdefense_sim"
    fi
}

# Run initial tests
run_tests() {
    print_status "Running initial tests..."
    npm run test
    print_success "All tests passed"
}

# Main setup function
main() {
    echo
    print_status "Starting development environment setup..."
    echo
    
    # Check prerequisites
    check_node
    check_npm
    check_docker
    
    echo
    
    # Setup environment
    install_dependencies
    setup_env
    setup_git_hooks
    
    echo
    
    # Ask user if they want to setup database
    if [ "$DOCKER_AVAILABLE" = true ]; then
        read -p "Do you want to set up the database with Docker? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            setup_database
        else
            print_warning "Skipping database setup. You'll need to configure it manually."
        fi
    fi
    
    echo
    
    # Ask user if they want to run tests
    read -p "Do you want to run the test suite? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    else
        print_warning "Skipping tests. You can run them later with 'npm test'."
    fi
    
    echo
    print_success "Development environment setup completed!"
    echo
    echo "🎉 You're ready to start developing!"
    echo
    echo "Next steps:"
    echo "  1. Start the development server: npm run dev"
    echo "  2. Open your browser to: http://localhost:5000"
    echo "  3. Start coding!"
    echo
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "Docker commands:"
        echo "  - Start all services: docker-compose up -d"
        echo "  - View logs: docker-compose logs -f"
        echo "  - Stop services: docker-compose down"
        echo
    fi
    
    echo "Development commands:"
    echo "  - Run tests: npm test"
    echo "  - Run linting: npm run lint"
    echo "  - Format code: npm run format"
    echo "  - Type check: npm run type-check"
    echo
}

# Run main function
main "$@"
