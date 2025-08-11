# Zenny Full-Stack Deployment Guide - DigitalOcean Droplet

This guide will help you deploy your complete Zenny application (Frontend, Backend, and Mail Poller) to a single DigitalOcean droplet.

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
   - Choose a plan: Basic $6/month (1GB RAM, 1 vCPU) should be sufficient to start

2. **Access your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

## Step 2: Server Setup

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

## Step 3: Clone and Setup Application

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

## Step 4: Environment Configuration

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

## Step 5: Build Frontend

```bash
cd /var/www/zenny/Frontend
npm run build
```

## Step 6: Configure PM2 for Process Management

### Create PM2 ecosystem file

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
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "zenny-mail-poller",
      cwd: "/var/www/zenny/zenny-backend",
      script: "src/utils/reminderPoller.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
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

## Step 7: Configure Nginx

### Create Nginx configuration

Create `/etc/nginx/sites-available/zenny`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

    # Backend API
    location /api {
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

## Step 8: SSL Certificate (Optional but Recommended)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 9: Database Setup

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

## Step 10: Monitoring and Maintenance

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

## Step 11: Backup Strategy

### Create backup script

Create `/var/www/zenny/backup.sh`:

```bash
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
```

### Make it executable and schedule

```bash
chmod +x /var/www/zenny/backup.sh
crontab -e
# Add this line for daily backups at 2 AM:
0 2 * * * /var/www/zenny/backup.sh
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

## Security Considerations

1. **Change default SSH port**
2. **Use SSH keys only**
3. **Regular security updates**
4. **Firewall configuration**
5. **Strong passwords for all services**
6. **Regular backups**

## Performance Optimization

1. **Enable Nginx gzip compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Monitor resource usage**
5. **Scale up droplet if needed**

Your Zenny application should now be fully deployed and running on your DigitalOcean droplet!
