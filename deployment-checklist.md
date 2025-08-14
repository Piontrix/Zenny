# Zenny Deployment Checklist with Cost Control

This checklist ensures your Zenny application is deployed correctly with comprehensive cost controls to prevent exceeding the $6/month budget.

## Pre-Deployment Checklist

### ✅ DigitalOcean Setup

- [ ] Create DigitalOcean account
- [ ] Choose Basic $6/month plan (1GB RAM, 1 vCPU, 25GB SSD, 1000GB transfer)
- [ ] Select Ubuntu 22.04 LTS
- [ ] Choose datacenter region close to users
- [ ] Set up SSH key authentication
- [ ] Note down droplet IP address

### ✅ Domain & Services Setup

- [ ] Purchase domain name (optional but recommended)
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Cloudinary account
- [ ] Set up email service (Gmail, SendGrid, etc.)
- [ ] Prepare Cashfree credentials (if using)

## Deployment Checklist

### ✅ Server Access

- [ ] SSH into droplet: `ssh root@your-droplet-ip`
- [ ] Verify Ubuntu 22.04 LTS is installed
- [ ] Check system resources: `free -h && df -h`

### ✅ Automated Deployment (Recommended)

- [ ] Clone repository: `git clone https://github.com/your-username/Zenny.git /var/www/zenny`
- [ ] Navigate to directory: `cd /var/www/zenny`
- [ ] Make script executable: `chmod +x deploy.sh`
- [ ] Run deployment: `./deploy.sh`
- [ ] Verify all services started successfully

### ✅ Manual Deployment (Alternative)

- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js 18.x
- [ ] Install PM2 globally: `npm install -g pm2`
- [ ] Install Nginx: `apt install nginx -y`
- [ ] Install other dependencies (Git, UFW, Certbot)
- [ ] Configure firewall: `ufw allow ssh && ufw allow 'Nginx Full' && ufw enable`

### ✅ Application Setup

- [ ] Clone repository to `/var/www/zenny`
- [ ] Install backend dependencies: `cd zenny-backend && npm install`
- [ ] Install frontend dependencies: `cd ../Frontend && npm install`
- [ ] Build frontend: `npm run build`

### ✅ Environment Configuration

- [ ] Create backend `.env` file with all required variables
- [ ] Create frontend `.env` file with API URLs
- [ ] Verify MongoDB connection string
- [ ] Test email configuration
- [ ] Verify Cloudinary credentials

### ✅ PM2 Configuration with Cost Controls

- [ ] Copy `ecosystem.config.js` to `/var/www/zenny/`
- [ ] Verify memory limits: 900MB for backend (alert), 50MB for poller
- [ ] Verify Node.js heap limits: 900MB (alert) and 50MB respectively
- [ ] Start applications: `pm2 start ecosystem.config.js`
- [ ] Save PM2 configuration: `pm2 save`
- [ ] Set up PM2 startup: `pm2 startup`

### ✅ Nginx Configuration with Rate Limiting

- [ ] Copy `nginx-zenny.conf` to `/etc/nginx/sites-available/zenny`
- [ ] Verify rate limiting zones are configured
- [ ] Check resource limits (10MB upload, timeouts)
- [ ] Enable site: `ln -s /etc/nginx/sites-available/zenny /etc/nginx/sites-enabled/`
- [ ] Remove default site: `rm /etc/nginx/sites-enabled/default`
- [ ] Test configuration: `nginx -t`
- [ ] Restart Nginx: `systemctl restart nginx`

### ✅ Resource Monitoring Setup

- [ ] Create `/var/www/zenny/scripts/` directory
- [ ] Copy `resourceMonitor.js` to scripts directory
- [ ] Copy `costGuard.js` to scripts directory
- [ ] Create systemd service files for both monitors
- [ ] Enable and start monitoring services
- [ ] Verify services are running: `systemctl status zenny-resource-monitor zenny-cost-monitor`

### ✅ SSL Certificate (Recommended)

- [ ] Update domain DNS to point to droplet IP
- [ ] Wait for DNS propagation (up to 24 hours)
- [ ] Install SSL certificate: `certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Test SSL configuration
- [ ] Set up auto-renewal: `crontab -e` (certbot handles this automatically)

### ✅ Database Setup

- [ ] Configure MongoDB Atlas cluster
- [ ] Add droplet IP to MongoDB whitelist
- [ ] Test database connection
- [ ] Seed admin user if needed: `npm run seed:admin`

### ✅ Cost Control Dashboard

- [ ] Create `cost-dashboard.sh` script
- [ ] Make it executable: `chmod +x cost-dashboard.sh`
- [ ] Test dashboard: `./cost-dashboard.sh`
- [ ] Verify all monitoring information is displayed

### ✅ Backup Strategy

- [ ] Create `backup.sh` script with disk usage checks
- [ ] Make it executable: `chmod +x backup.sh`
- [ ] Test backup script manually
- [ ] Set up cron job for daily backups at 2 AM
- [ ] Verify backup directory permissions

## Post-Deployment Verification

### ✅ Application Functionality

- [ ] Test frontend loads correctly
- [ ] Test backend API endpoints
- [ ] Test user registration and login
- [ ] Test file upload functionality
- [ ] Test email sending
- [ ] Test WebSocket connections
- [ ] Test admin panel access

### ✅ Cost Control Verification

- [ ] Run cost dashboard: `./cost-dashboard.sh`
- [ ] Check resource usage is within limits
- [ ] Verify monitoring services are active
- [ ] Test rate limiting by making multiple requests
- [ ] Check log files for any warnings

### ✅ Security Verification

- [ ] Verify firewall is active: `ufw status`
- [ ] Check SSH key authentication only
- [ ] Verify SSL certificate is valid
- [ ] Test rate limiting on API endpoints
- [ ] Check file permissions are secure

### ✅ Performance Verification

- [ ] Monitor memory usage: `free -h`
- [ ] Monitor CPU usage: `htop`
- [ ] Monitor disk usage: `df -h`
- [ ] Check Nginx access logs for errors
- [ ] Verify PM2 processes are stable

## Monitoring & Maintenance

### ✅ Daily Monitoring

- [ ] Check cost dashboard: `./cost-dashboard.sh`
- [ ] Review resource alerts: `tail -f /var/log/zenny/resource-alerts.log`
- [ ] Review cost alerts: `tail -f /var/log/zenny/cost-monitor.log`
- [ ] Check PM2 status: `pm2 status`
- [ ] Monitor disk usage

### ✅ Weekly Maintenance

- [ ] Review and clean old log files
- [ ] Check backup success
- [ ] Update system packages: `apt update && apt upgrade`
- [ ] Review cost trends
- [ ] Check SSL certificate renewal

### ✅ Monthly Maintenance

- [ ] Review cost data and trends
- [ ] Clean up old backups
- [ ] Check for security updates
- [ ] Review monitoring logs for patterns
- [ ] Optimize resource usage if needed

## Emergency Procedures

### ✅ Cost Limit Exceeded

- [ ] Check reason: `cat /var/www/zenny/COST_LIMIT_EXCEEDED`
- [ ] Review resource usage: `./cost-dashboard.sh`
- [ ] Investigate cause of high usage
- [ ] Clear flag after resolution: `rm /var/www/zenny/COST_LIMIT_EXCEEDED`
- [ ] Restart services: `pm2 restart all && systemctl start nginx`

### ✅ Resource Limits Exceeded

- [ ] Check resource alerts: `tail -f /var/log/zenny/resource-alerts.log`
- [ ] Identify high-usage processes: `htop`
- [ ] Restart problematic services: `pm2 restart <service-name>`
- [ ] Check for memory leaks or infinite loops

### ✅ Service Failures

- [ ] Check PM2 status: `pm2 status`
- [ ] View service logs: `pm2 logs`
- [ ] Check system resources
- [ ] Restart services if needed: `pm2 restart all`
- [ ] Check Nginx status: `systemctl status nginx`

## Cost Control Best Practices

### ✅ Resource Optimization

- [ ] Monitor memory usage and optimize if needed
- [ ] Use CDN for static assets
- [ ] Implement proper caching strategies
- [ ] Limit file upload sizes
- [ ] Optimize database queries

### ✅ Traffic Management

- [ ] Monitor bandwidth usage
- [ ] Implement rate limiting
- [ ] Use compression for responses
- [ ] Cache static content
- [ ] Monitor for unusual traffic patterns

### ✅ Backup Optimization

- [ ] Exclude unnecessary files from backups
- [ ] Monitor backup sizes
- [ ] Clean up old backups regularly
- [ ] Check disk usage before backups

## Final Verification

### ✅ Complete System Check

- [ ] All services running: `pm2 status && systemctl status nginx`
- [ ] Cost controls active: `./cost-dashboard.sh`
- [ ] SSL certificate valid
- [ ] Database connected
- [ ] Email sending working
- [ ] File uploads working
- [ ] WebSocket connections working
- [ ] Admin panel accessible

### ✅ Documentation

- [ ] Update deployment guide if needed
- [ ] Document any custom configurations
- [ ] Save important credentials securely
- [ ] Create runbook for common issues

## Success Criteria

Your deployment is successful when:

- ✅ Application is accessible via domain
- ✅ All features work correctly
- ✅ Cost controls are active and monitoring
- ✅ Resource usage is within limits
- ✅ SSL certificate is valid
- ✅ Backups are working
- ✅ Monitoring is active
- ✅ Security measures are in place

**Congratulations! Your Zenny application is now deployed with comprehensive cost controls ensuring you never exceed your $6/month budget.**
