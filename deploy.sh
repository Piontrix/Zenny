#!/bin/bash

# Zenny Full-Stack Deployment Script
# This script automates the deployment process on a fresh Ubuntu 22.04 server

set -e  # Exit on any error

echo "🚀 Starting Zenny deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install other dependencies
print_status "Installing system dependencies..."
apt install -y nginx git ufw certbot python3-certbot-nginx htop

# Configure firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/zenny
mkdir -p /var/log/zenny
mkdir -p /var/backups/zenny

# Set proper permissions
chown -R www-data:www-data /var/www/zenny
chown -R www-data:www-data /var/log/zenny
chown -R www-data:www-data /var/backups/zenny

# Clone repository (you'll need to update this URL)
print_status "Cloning repository..."
cd /var/www/zenny
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    git pull
else
    print_error "Please clone your repository manually to /var/www/zenny"
    print_error "Run: git clone https://github.com/your-username/Zenny.git ."
    exit 1
fi

# Install dependencies
print_status "Installing backend dependencies..."
cd /var/www/zenny/zenny-backend
npm install

print_status "Installing frontend dependencies..."
cd /var/www/zenny/Frontend
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Copy PM2 ecosystem file
print_status "Setting up PM2 configuration..."
cp /var/www/zenny/ecosystem.config.js /var/www/zenny/

# Create log directory for PM2
mkdir -p /var/log/zenny
chown -R www-data:www-data /var/log/zenny

# Start applications with PM2
print_status "Starting applications with PM2..."
cd /var/www/zenny
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."
cp /var/www/zenny/nginx-zenny.conf /etc/nginx/sites-available/zenny

# Enable the site
ln -sf /etc/nginx/sites-available/zenny /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Create backup script
print_status "Setting up backup script..."
cat > /var/www/zenny/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/zenny"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/zenny

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_$DATE.pm2

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.pm2" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/zenny/backup.sh

# Set up cron job for backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/zenny/backup.sh") | crontab -

# Create environment setup script
print_status "Creating environment setup script..."
cat > /var/www/zenny/setup-env.sh << 'EOF'
#!/bin/bash

echo "Please configure your environment variables:"
echo ""
echo "1. Backend environment variables:"
echo "   Edit: /var/www/zenny/zenny-backend/.env"
echo ""
echo "2. Frontend environment variables:"
echo "   Edit: /var/www/zenny/Frontend/.env"
echo ""
echo "3. Update Nginx configuration:"
echo "   Edit: /etc/nginx/sites-available/zenny"
echo "   Replace 'yourdomain.com' with your actual domain"
echo ""
echo "4. After configuration, restart services:"
echo "   pm2 restart all"
echo "   systemctl reload nginx"
echo ""
echo "5. For SSL certificate:"
echo "   certbot --nginx -d yourdomain.com -d www.yourdomain.com"
EOF

chmod +x /var/www/zenny/setup-env.sh

# Final status
print_status "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: /var/www/zenny/setup-env.sh"
echo "2. Configure your environment variables"
echo "3. Update domain name in Nginx configuration"
echo "4. Set up SSL certificate with Certbot"
echo "5. Test your application"
echo ""
echo "Useful commands:"
echo "- Check PM2 status: pm2 status"
echo "- View logs: pm2 logs"
echo "- Restart services: pm2 restart all"
echo "- Check Nginx status: systemctl status nginx"
echo "- View Nginx logs: tail -f /var/log/nginx/error.log"
