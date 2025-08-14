#!/bin/bash

# Zenny Full-Stack Deployment Script with Cost Control
# This script automates the deployment process on a fresh Ubuntu 22.04 server
# Includes strict resource limits to prevent costs from exceeding $6/month

set -e  # Exit on any error

echo "🚀 Starting Zenny deployment with cost control..."

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

print_cost_info() {
    echo -e "${BLUE}[COST CONTROL]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Display cost control information
print_cost_info "This deployment includes strict cost controls:"
print_cost_info "- Memory: Alert at 900MB (90%), Shutdown at 950MB (95%)"
print_cost_info "- CPU: Alert at 90%, Shutdown at 95%"
print_cost_info "- Disk: Alert at 22.5GB (90%), Shutdown at 23.75GB (95%)"
print_cost_info "- Bandwidth: Alert at 900GB (90%), Shutdown at 950GB (95%)"
print_cost_info "- Cost: Alert at $5.40/month (90%), Shutdown at $5.70/month (95%)"
print_cost_info "- File uploads: Handled by application-level checks (Admin only)"
print_cost_info "- Automatic shutdown prevents any cost overruns"

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
mkdir -p /var/www/zenny/scripts

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
print_status "Setting up PM2 configuration with cost controls..."
cp /var/www/zenny/ecosystem.config.js /var/www/zenny/

# Create log directory for PM2
mkdir -p /var/log/zenny
chown -R www-data:www-data /var/log/zenny

# Start applications with PM2
print_status "Starting applications with PM2 and resource limits..."
cd /var/www/zenny
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx with resource limits
print_status "Configuring Nginx with resource limits..."
cp /var/www/zenny/nginx-zenny.conf /etc/nginx/sites-available/zenny

# Add resource limits to Nginx configuration
cat >> /etc/nginx/sites-available/zenny << 'EOF'

# Resource limits to prevent cost overruns
client_max_body_size 0;     # No limit - handled by application
client_body_timeout 300s;   # 5 minutes for large uploads
client_header_timeout 30s;
keepalive_timeout 65s;
send_timeout 300s;          # 5 minutes for large uploads

# Rate limiting to prevent abuse
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# File uploads (handled by application-level checks)
location /api/upload {
    proxy_read_timeout 1800s;  # 30 minutes for large uploads
    proxy_send_timeout 1800s;
    # ... existing proxy configuration ...
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/zenny /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Create systemd service for resource monitoring
print_status "Setting up system resource monitoring..."
cat > /etc/systemd/system/zenny-resource-monitor.service << 'EOF'
[Unit]
Description=Zenny Resource Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/zenny
ExecStart=/usr/bin/node scripts/resourceMonitor.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for cost monitoring
cat > /etc/systemd/system/zenny-cost-monitor.service << 'EOF'
[Unit]
Description=Zenny Cost Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/zenny
ExecStart=/usr/bin/node scripts/costGuard.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start monitoring services
systemctl daemon-reload
systemctl enable zenny-resource-monitor
systemctl enable zenny-cost-monitor
systemctl start zenny-resource-monitor
systemctl start zenny-cost-monitor

# Create backup script with cost awareness
print_status "Setting up backup script with cost controls..."
cat > /var/www/zenny/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/zenny"

# Check disk usage before backup
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%. Skipping backup to prevent cost overrun."
    exit 1
fi

mkdir -p $BACKUP_DIR

# Backup application files (excluding large directories)
tar -czf $BACKUP_DIR/app_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    /var/www/zenny

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_$DATE.pm2

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.pm2" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/zenny/backup.sh

# Set up cron job for backups (only if disk usage is low)
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/zenny/backup.sh") | crontab -

# Create cost monitoring dashboard script
print_status "Creating cost monitoring dashboard..."
cat > /var/www/zenny/cost-dashboard.sh << 'EOF'
#!/bin/bash

echo "=== Zenny Cost Control Dashboard ==="
echo ""

# Check if system was halted due to cost limit
if [ -f "/var/www/zenny/COST_LIMIT_EXCEEDED" ]; then
    echo "🚨 SYSTEM HALTED DUE TO COST LIMIT"
    echo "Reason: $(cat /var/www/zenny/COST_LIMIT_EXCEEDED)"
    echo ""
fi

# Show current resource usage
echo "=== Current Resource Usage ==="
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $3"/"$2" ("$3/$2*100"%)"}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')"
echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1)%"
echo ""

# Show PM2 status
echo "=== PM2 Process Status ==="
pm2 status
echo ""

# Show monitoring service status
echo "=== Monitoring Services ==="
systemctl status zenny-resource-monitor --no-pager -l
echo ""
systemctl status zenny-cost-monitor --no-pager -l
echo ""

# Show recent logs
echo "=== Recent Resource Alerts ==="
if [ -f "/var/log/zenny/resource-alerts.log" ]; then
    tail -10 /var/log/zenny/resource-alerts.log
else
    echo "No resource alerts found"
fi
echo ""

echo "=== Recent Cost Alerts ==="
if [ -f "/var/log/zenny/cost-monitor.log" ]; then
    tail -10 /var/log/zenny/cost-monitor.log
else
    echo "No cost alerts found"
fi
echo ""

echo "=== Cost Control Commands ==="
echo "View dashboard: ./cost-dashboard.sh"
echo "Check logs: tail -f /var/log/zenny/resource-monitor.log"
echo "Check cost: tail -f /var/log/zenny/cost-monitor.log"
echo "Restart services: pm2 restart all"
echo "Emergency stop: pm2 stop all && systemctl stop nginx"
echo "Clear cost limit flag: rm /var/www/zenny/COST_LIMIT_EXCEEDED"
EOF

chmod +x /var/www/zenny/cost-dashboard.sh

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
echo ""
echo "6. Monitor cost and resources:"
echo "   ./cost-dashboard.sh"
EOF

chmod +x /var/www/zenny/setup-env.sh

# Final status
print_status "Deployment completed successfully with cost controls!"
echo ""
print_cost_info "Cost Control Features Active:"
print_cost_info "✓ Resource monitoring (Memory, CPU, Disk, Bandwidth)"
print_cost_info "✓ Cost estimation and tracking"
print_cost_info "✓ Automatic shutdown at 95% shutdown thresholds"
print_cost_info "✓ Rate limiting to prevent abuse"
print_cost_info "✓ Backup size controls"
echo ""
echo "Next steps:"
echo "1. Run: /var/www/zenny/setup-env.sh"
echo "2. Configure your environment variables"
echo "3. Update domain name in Nginx configuration"
echo "4. Set up SSL certificate with Certbot"
echo "5. Test your application"
echo "6. Monitor costs: ./cost-dashboard.sh"
echo ""
echo "Useful commands:"
echo "- Check PM2 status: pm2 status"
echo "- View logs: pm2 logs"
echo "- Restart services: pm2 restart all"
echo "- Check Nginx status: systemctl status nginx"
echo "- View Nginx logs: tail -f /var/log/nginx/error.log"
echo "- Monitor costs: ./cost-dashboard.sh"
echo "- View resource alerts: tail -f /var/log/zenny/resource-alerts.log"
echo "- View cost alerts: tail -f /var/log/zenny/cost-monitor.log"
