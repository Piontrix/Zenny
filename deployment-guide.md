# Zenny Full-Stack Deployment Guide - DigitalOcean Droplet with Cost Control

This guide will help you deploy your complete Zenny application (Frontend, Backend, and Mail Poller) to a single DigitalOcean droplet with **strict cost controls** to prevent costs from exceeding $6/month.

## 🚨 Cost Control Features

This deployment includes comprehensive cost control mechanisms:

- **Memory**: Alert at 800MB (80%), Shutdown at 950MB (95%)
- **CPU**: Alert at 90%, Shutdown at 95%
- **Disk**: Alert at 22.5GB (90%), Shutdown at 23.75GB (95%)
- **Bandwidth**: Alert at 900GB (90%), Shutdown at 950GB (95%)
- **Cost**: Alert at $5.40/month (90%), Shutdown at $5.70/month (95%)
- **Automatic Shutdown**: Services halt when shutdown thresholds are exceeded
- **Resource Monitoring**: Real-time monitoring of all resources
- **Cost Tracking**: Daily and monthly cost estimation

## Prerequisites

1. **DigitalOcean Account** - Sign up at [digitalocean.com](https://digitalocean.com)
2. **Domain Name** (optional but recommended)
3. **MongoDB Atlas Account** (for database)
4. **Cloudinary Account** (for image uploads)
5. **Email Service** (for sending emails)

## Step 1: Create DigitalOcean Droplet

1. **Create a new droplet:**

   - Choose Ubuntu 22.04 LTS
   - Choose Basic plan
   - Select a datacenter region close to your users
   - Choose authentication method (SSH key recommended)
   - **Choose plan: Basic $6/month (1GB RAM, 1 vCPU, 25GB SSD, 1000GB transfer)**

2. **Access your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

## Step 2: Automated Deployment

### Option A: Use the Automated Script (Recommended)

```bash
# Clone your repository
git clone https://github.com/your-username/Zenny.git /var/www/zenny
cd /var/www/zenny

# Make the deployment script executable
chmod +x deploy.sh

# Run the automated deployment
./deploy.sh
```

The automated script will:

- Install all dependencies
- Configure PM2 with resource limits
- Set up Nginx with rate limiting
- Install resource and cost monitoring
- Configure automatic shutdown at 95% shutdown thresholds
- Create monitoring dashboard

### Option B: Manual Deployment

If you prefer manual deployment, follow the steps below.

## Step 3: Server Setup (Manual)

### Update system and install dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y

# Install UFW (Firewall)
sudo apt install ufw -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 4: Clone and Setup Application

### Create application directory

```bash
mkdir /var/www/zenny
cd /var/www/zenny
```

### Clone your repository

```bash
git clone https://github.com/your-username/Zenny.git .
```

### Install dependencies

```bash
# Install backend dependencies
cd zenny-backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

## Step 5: Environment Configuration

### Backend Environment Variables

Create `/var/www/zenny/zenny-backend/.env`:

```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
MONGO_URI=your_mongodb_atlas_connection_string
MONGO_DB_NAME=zenny-db

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cashfree Configuration (if using)
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_WEBHOOK_SECRET=your_webhook_secret
```

### Frontend Environment Variables

Create `/var/www/zenny/Frontend/.env`:

```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

## Step 6: Build Frontend

```bash
cd /var/www/zenny/Frontend
npm run build
```

## Step 7: Configure PM2 with Cost Controls

### Create PM2 ecosystem file with resource limits

**Note:** Memory limits are balanced to stay under 1GB total:

- Backend: 800MB (80% of 1GB)
- Mail Poller: 100MB
- Resource Monitor: 75MB
- **Total: 975MB (safely under 1GB limit)**

Create `/var/www/zenny/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "zenny-backend",
      cwd: "/var/www/zenny/zenny-backend",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "800M", // 80% of 1GB - alert threshold
      max_restarts: 3, // Prevent infinite restart loops
      min_uptime: "10s", // Minimum uptime before considering app stable
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "/var/log/zenny/backend-error.log",
      out_file: "/var/log/zenny/backend-out.log",
      log_file: "/var/log/zenny/backend-combined.log",
      time: true,
      // Resource monitoring
      node_args: "--max-old-space-size=800", // Limit Node.js heap to 800MB
    },
    {
      name: "zenny-mail-poller",
      cwd: "/var/www/zenny/zenny-backend",
      script: "src/utils/reminderPoller.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "100M", // Increased for mail poller stability
      max_restarts: 3,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/zenny/poller-error.log",
      out_file: "/var/log/zenny/poller-out.log",
      log_file: "/var/log/zenny/poller-combined.log",
      time: true,
      node_args: "--max-old-space-size=100", // Limit Node.js heap to 100MB
    },
    {
      name: "zenny-resource-monitor",
      cwd: "/var/www/zenny",
      script: "scripts/resourceMonitor.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "75M", // Reduced from 100M for better balance
      max_restarts: 5, // Allow more restarts
      min_uptime: "60s", // Wait longer before considering stable
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/zenny/monitor-error.log",
      out_file: "/var/log/zenny/monitor-out.log",
      log_file: "/var/log/zenny/monitor-combined.log",
      time: true,
      node_args: "--max-old-space-size=75", // Limit Node.js heap to 75MB
    },
  ],
};
```

### Start applications with PM2

```bash
cd /var/www/zenny
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 8: Configure Nginx with Rate Limiting

### Create Nginx configuration with resource limits

Create `/etc/nginx/sites-available/zenny`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Resource limits to prevent cost overruns
    client_max_body_size 0;     # No limit - handled by application
    client_body_timeout 300s;   # 5 minutes for large uploads
    client_header_timeout 30s;
    keepalive_timeout 65s;
    send_timeout 300s;          # 5 minutes for large uploads

    # Rate limiting to prevent abuse
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Frontend (React app)
    location / {
        root /var/www/zenny/Frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API with rate limiting
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads (handled by application-level checks)
    location /api/upload {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 1800s;  # 30 minutes for large uploads
        proxy_send_timeout 1800s;
    }

    # Authentication endpoints with stricter rate limiting
    location /api/auth {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/zenny /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 9: Set Up Resource and Cost Monitoring

### Create resource monitoring script

Create `/var/www/zenny/scripts/resourceMonitor.js` (see the file in the repository)

### Create cost monitoring script

Create `/var/www/zenny/scripts/costGuard.js` (see the file in the repository)

### Set up systemd services

```bash
# Create resource monitoring service
sudo tee /etc/systemd/system/zenny-resource-monitor.service > /dev/null << 'EOF'
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

# Create cost monitoring service
sudo tee /etc/systemd/system/zenny-cost-monitor.service > /dev/null << 'EOF'
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
sudo systemctl daemon-reload
sudo systemctl enable zenny-resource-monitor
sudo systemctl enable zenny-cost-monitor
sudo systemctl start zenny-resource-monitor
sudo systemctl start zenny-cost-monitor
```

## Step 10: SSL Certificate (Optional but Recommended)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 11: Database Setup

1. **MongoDB Atlas Setup:**

   - Create a cluster on MongoDB Atlas
   - Get your connection string
   - Add your server IP to the IP whitelist
   - Update the MONGO_URI in your .env file

2. **Seed Admin User (if needed):**
   ```bash
   cd /var/www/zenny/zenny-backend
   npm run seed:admin
   ```

## Step 12: Cost Monitoring Dashboard

### Create monitoring dashboard

```bash
# Create the dashboard script
sudo tee /var/www/zenny/cost-dashboard.sh > /dev/null << 'EOF'
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
```

### View the dashboard

```bash
cd /var/www/zenny
./cost-dashboard.sh
```

## Step 13: Monitoring and Maintenance

### PM2 Commands

```bash
# View running processes
pm2 status

# View logs
pm2 logs

# Restart all processes
pm2 restart all

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Cost Control Commands

```bash
# View cost dashboard
./cost-dashboard.sh

# Check resource alerts
tail -f /var/log/zenny/resource-alerts.log

# Check cost alerts
tail -f /var/log/zenny/cost-monitor.log

# Emergency stop (if needed)
pm2 stop all && systemctl stop nginx

# Clear cost limit flag (after manual intervention)
rm /var/www/zenny/COST_LIMIT_EXCEEDED
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check system logs
sudo journalctl -f
```

## Step 14: Backup Strategy with Cost Controls

### Create backup script with disk usage check

```bash
sudo tee /var/www/zenny/backup.sh > /dev/null << 'EOF'
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

# Set up cron job for backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/zenny/backup.sh") | crontab -
```

## Troubleshooting

### Common Issues:

1. **Port already in use:**

   ```bash
   sudo netstat -tulpn | grep :4000
   sudo kill -9 <PID>
   ```

2. **Permission issues:**

   ```bash
   sudo chown -R www-data:www-data /var/www/zenny
   ```

3. **Nginx 502 error:**

   - Check if backend is running: `pm2 status`
   - Check backend logs: `pm2 logs zenny-backend`

4. **SSL issues:**

   ```bash
   sudo certbot renew --dry-run
   ```

5. **Cost limit exceeded:**

   ```bash
   # Check the reason
   cat /var/www/zenny/COST_LIMIT_EXCEEDED

   # Clear the flag and restart (after manual intervention)
   rm /var/www/zenny/COST_LIMIT_EXCEEDED
   pm2 restart all
   systemctl start nginx
   ```

6. **Resource limits exceeded:**

   ```bash
   # Check resource usage
   ./cost-dashboard.sh

   # Check monitoring logs
   tail -f /var/log/zenny/resource-alerts.log
   ```

7. **PM2 memory limit issues (frequent restarts):**

   ```bash
   # Check PM2 status for restart counts
   pm2 status

   # If processes are restarting frequently, check memory usage
   pm2 monit

   # Check specific process logs
   pm2 logs zenny-backend
   pm2 logs zenny-mail-poller
   pm2 logs zenny-resource-monitor
   ```

8. **Resource monitor restart loop:**

   ```bash
   # Check if resource monitor is causing high CPU usage
   htop

   # Check resource monitor logs
   tail -f /var/log/zenny/monitor-error.log

   # If restarting too frequently, the memory limit might be too low
   # Check current memory usage vs limit
   pm2 show zenny-resource-monitor
   ```

## Security Considerations

1. **Change default SSH port**
2. **Use SSH keys only**
3. **Regular security updates**
4. **Firewall configuration**
5. **Strong passwords for all services**
6. **Regular backups**
7. **Rate limiting to prevent abuse**
8. **Resource limits to prevent cost overruns**

## Performance Optimization

1. **Enable Nginx gzip compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Monitor resource usage**
5. **Scale up droplet if needed (but be aware of cost implications)**

## Cost Control Best Practices

1. **Monitor the dashboard regularly**: `./cost-dashboard.sh`
2. **Set up alerts**: Check logs for warnings
3. **Optimize resource usage**: Monitor memory and CPU usage
4. **File uploads**: Handled by application-level checks (Admin only)
5. **Implement caching**: Reduce server load
6. **Use CDN**: Offload static assets
7. **Regular cleanup**: Remove old logs and backups
8. **Monitor bandwidth**: Watch for unusual traffic patterns

## Manual Deployment Experience & Lessons Learned

### Key Issues Encountered and Resolved:

1. **Resource Monitor Restart Loop:**

   - **Issue**: Resource monitor was restarting every 30 seconds due to low memory limit (10MB)
   - **Solution**: Increased memory limit to 75MB and added restart controls

2. **Mail Poller Memory Issues:**

   - **Issue**: Mail poller was exceeding 50MB limit and restarting frequently
   - **Solution**: Increased memory limit to 100MB for stability

3. **Memory Limit Balancing:**

   - **Issue**: Combined memory limits exceeded 1GB droplet capacity
   - **Solution**: Balanced limits: Backend (800MB) + Poller (100MB) + Monitor (75MB) = 975MB

4. **Nginx Configuration Error:**
   - **Issue**: `limit_req_zone` directive not allowed in server block
   - **Solution**: Moved rate limiting zones to main nginx.conf file

### Recommended Deployment Approach:

1. **First Time**: Use manual deployment for better debugging
2. **Subsequent**: Use automated script once configuration is stable
3. **Always**: Monitor PM2 status and logs during initial deployment
4. **Verify**: Check that all services start without frequent restarts

Your Zenny application should now be fully deployed with comprehensive cost controls to ensure you never exceed your $6/month budget!
