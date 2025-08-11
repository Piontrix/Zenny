# Zenny Deployment Checklist

## Pre-Deployment Setup

### 1. DigitalOcean Droplet

- [ ] Create Ubuntu 22.04 LTS droplet
- [ ] Choose appropriate plan (Basic $6/month recommended)
- [ ] Select datacenter region close to users
- [ ] Set up SSH key authentication
- [ ] Note down droplet IP address

### 2. Domain & DNS

- [ ] Purchase domain name (optional but recommended)
- [ ] Point domain to droplet IP
- [ ] Wait for DNS propagation (up to 48 hours)

### 3. External Services Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database connection string ready
- [ ] Cloudinary account setup
- [ ] Email service configured (Gmail app password)
- [ ] Cashfree account (if using payments)

## Server Deployment

### 4. Initial Server Access

- [ ] SSH into droplet: `ssh root@your-droplet-ip`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Node.js 18.x
- [ ] Install PM2: `npm install -g pm2`
- [ ] Install Nginx, Git, UFW, Certbot

### 5. Application Deployment

- [ ] Clone repository to `/var/www/zenny`
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Build frontend: `npm run build`
- [ ] Copy deployment files (ecosystem.config.js, nginx config)

### 6. Environment Configuration

- [ ] Create `/var/www/zenny/zenny-backend/.env`
- [ ] Create `/var/www/zenny/Frontend/.env`
- [ ] Update all environment variables with real values
- [ ] Test database connection

### 7. Process Management

- [ ] Start applications with PM2
- [ ] Save PM2 configuration
- [ ] Set up PM2 startup script
- [ ] Verify both backend and mail poller are running

### 8. Web Server Configuration

- [ ] Configure Nginx with proper domain
- [ ] Test Nginx configuration
- [ ] Restart Nginx service
- [ ] Verify frontend is accessible

### 9. SSL Certificate

- [ ] Install SSL certificate with Certbot
- [ ] Test SSL configuration
- [ ] Set up auto-renewal

## Post-Deployment Verification

### 10. Application Testing

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] WebSocket connections work
- [ ] Email functionality tested
- [ ] File uploads work (Cloudinary)
- [ ] Payment integration (if applicable)

### 11. Security & Performance

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular security updates enabled
- [ ] Nginx security headers in place
- [ ] Gzip compression enabled
- [ ] Static asset caching configured

### 12. Monitoring & Maintenance

- [ ] PM2 monitoring setup
- [ ] Log rotation configured
- [ ] Backup script created and scheduled
- [ ] System monitoring tools installed
- [ ] Performance baseline established

## Troubleshooting Common Issues

### If Frontend Doesn't Load

- [ ] Check Nginx configuration: `nginx -t`
- [ ] Verify frontend build exists: `ls /var/www/zenny/Frontend/dist`
- [ ] Check Nginx logs: `tail -f /var/log/nginx/error.log`

### If Backend API Fails

- [ ] Check PM2 status: `pm2 status`
- [ ] View backend logs: `pm2 logs zenny-backend`
- [ ] Verify environment variables
- [ ] Test database connection

### If Mail Poller Issues

- [ ] Check poller logs: `pm2 logs zenny-mail-poller`
- [ ] Verify email configuration
- [ ] Check MongoDB connection

### If SSL Issues

- [ ] Test certificate: `certbot certificates`
- [ ] Check renewal: `certbot renew --dry-run`
- [ ] Verify Nginx SSL configuration

## Performance Optimization

### 13. Optimization Steps

- [ ] Enable Nginx gzip compression
- [ ] Configure browser caching
- [ ] Optimize images and assets
- [ ] Monitor memory usage
- [ ] Set up CDN if needed

### 14. Scaling Considerations

- [ ] Monitor resource usage
- [ ] Plan for traffic spikes
- [ ] Consider load balancing if needed
- [ ] Database optimization

## Backup & Recovery

### 15. Backup Strategy

- [ ] Daily automated backups
- [ ] Database backups
- [ ] Configuration backups
- [ ] Test backup restoration
- [ ] Off-site backup storage

## Documentation

### 16. Final Documentation

- [ ] Update deployment guide
- [ ] Document environment variables
- [ ] Create maintenance procedures
- [ ] Document troubleshooting steps
- [ ] Create runbook for common issues

---

**Deployment Status**: ⏳ Pending
**Last Updated**: [Date]
**Deployed By**: [Name]
**Environment**: Production
