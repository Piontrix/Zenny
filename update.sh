#!/bin/bash

# Zenny Update Script
# This script updates the application with the latest changes from GitHub

set -e  # Exit on any error

echo "🔄 Starting Zenny application update..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Navigate to application directory
cd /var/www/zenny

# Backup current state
print_status "Creating backup of current state..."
cp -r zenny-backend/.env zenny-backend/.env.backup 2>/dev/null || true

# Pull latest changes
print_status "Pulling latest changes from GitHub..."
git pull origin main

# Restore environment file
print_status "Restoring environment configuration..."
cp zenny-backend/.env.backup zenny-backend/.env 2>/dev/null || true

# Install backend dependencies
print_status "Installing backend dependencies..."
cd zenny-backend
npm install

# Build backend (if build script exists)
print_status "Building backend..."
npm run build 2>/dev/null || print_warning "No build script found in backend"

# Install frontend dependencies (if exists)
print_status "Installing frontend dependencies..."
cd ../Frontend
npm install 2>/dev/null || print_warning "Frontend directory not found or no package.json"

# Build frontend (if build script exists)
print_status "Building frontend..."
npm run build 2>/dev/null || print_warning "No build script found in frontend"

# Go back to main directory
cd /var/www/zenny

# Restart all services
print_status "Restarting all services..."
pm2 restart all

# Check service status
print_status "Checking service status..."
pm2 status

# Verify deployment
print_status "Verifying deployment..."
sleep 5

# Check if services are running
if pm2 status | grep -q "online"; then
    print_status "✅ All services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: pm2 logs"
    exit 1
fi

print_status "🎉 Update completed successfully!"
print_status "Your application is now running with the latest changes."
