# Server Configuration Summary - Zenny Deployment

## 🎯 **Current Resource Limits (Updated)**

### **PM2 Process Limits (ecosystem.config.js)**

- **zenny-backend**: 800MB (80% of 1GB - alert threshold)
- **zenny-mail-poller**: 100MB (increased for stability)
- **zenny-resource-monitor**: 75MB (reduced for better balance)

### **Resource Monitoring Thresholds (resourceMonitor.js)**

- **Memory Alert**: 90% (900MB of 1GB)
- **Memory Shutdown**: 95% (950MB of 1GB)
- **CPU Alert**: 90% of 1 vCPU
- **CPU Shutdown**: 95% of 1 vCPU
- **Disk Alert**: 90% (22.5GB of 25GB)
- **Disk Shutdown**: 95% (23.75GB of 25GB)
- **Bandwidth Alert**: 900GB of 1TB
- **Bandwidth Shutdown**: 950GB of 1TB

### **Cost Monitoring (costGuard.js)**

- **Daily Limit**: $0.20 (approximately $6/month)
- **Monthly Limit**: $6.00
- **Warning Threshold**: 90% ($5.40/month)
- **Shutdown Threshold**: 95% ($5.70/month)

## 📋 **What You Need to Do**

### **Step 1: Commit the Updated Files**

```bash
# Add all configuration files
git add ecosystem.config.js
git add scripts/costGuard.js
git add scripts/resourceMonitor.js

# Commit with descriptive message
git commit -m "Update server configuration: Backend 800MB, Mail Poller 100MB, Monitor 75MB with proper resource limits"

# Push to GitHub
git push origin main
```

### **Step 2: Update on Server**

```bash
# SSH into your server
ssh root@your-droplet-ip

# Navigate to application directory
cd /var/www/zenny

# Pull the latest changes
git pull origin main

# Restart all services to apply new limits
pm2 restart all

# Verify the configuration
pm2 status
```

## 🔧 **Configuration Details**

### **Why These Limits?**

1. **Backend (800MB)**:

   - 80% of 1GB total memory
   - Provides enough memory for Node.js application
   - Leaves 200MB for system and other processes

2. **Mail Poller (100MB)**:

   - Lightweight process for email checking
   - Increased from default for better stability
   - Doesn't need much memory

3. **Resource Monitor (75MB)**:
   - Very lightweight monitoring script
   - Reduced to save memory for main application
   - Still sufficient for monitoring tasks

### **Resource Monitoring Strategy**

- **Alert at 90%**: Early warning to prevent issues
- **Shutdown at 95%**: Emergency stop to prevent cost overrun
- **Automatic restart**: PM2 will restart processes if they exceed limits
- **Cost control**: System halts if monthly cost approaches $6 limit

## ✅ **Verification Commands**

After updating, verify everything is working:

```bash
# Check PM2 status
pm2 status

# Check resource usage
./cost-dashboard.sh

# View monitoring logs
tail -f /var/log/zenny/resource-monitor.log
tail -f /var/log/zenny/cost-monitor.log

# Check if cost limits are exceeded
cat /var/www/zenny/COST_LIMIT_EXCEEDED
```

## 🚨 **Emergency Procedures**

If the system shuts down due to resource limits:

1. **Check the reason**:

   ```bash
   cat /var/www/zenny/COST_LIMIT_EXCEEDED
   ```

2. **Review resource usage**:

   ```bash
   ./cost-dashboard.sh
   ```

3. **Restart services** (after resolving the issue):
   ```bash
   pm2 restart all
   systemctl start nginx
   ```

## 💰 **Cost Control Summary**

- **Monthly Budget**: $6.00
- **Alert Threshold**: $5.40 (90%)
- **Shutdown Threshold**: $5.70 (95%)
- **Automatic Protection**: System halts before exceeding budget
- **Manual Restart**: Required after cost limit shutdown

---

**Note**: These configurations ensure your Zenny application stays within the $6/month DigitalOcean budget while maintaining optimal performance and stability.
