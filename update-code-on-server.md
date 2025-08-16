# Update Code on Server - Zenny Deployment

This guide explains how to deploy updated code to your Zenny application running on DigitalOcean.

## ⚠️ Important: Repository Visibility

**Before updating, you MUST make your GitHub repository PUBLIC temporarily:**

1. Go to your GitHub repository: `https://github.com/your-username/Zenny`
2. Click on **Settings** tab
3. Scroll down to **Danger Zone**
4. Click **Change repository visibility**
5. Select **Make public**
6. Confirm the change

**After the update is complete, you can make it private again.**

## Method 1: Manual Update (Recommended)

### Step 1: Push Changes to GitHub

First, commit and push your local changes:

```bash
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Your update description"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Your Server

SSH into your DigitalOcean droplet:

```bash
ssh root@your-droplet-ip
```

### Step 3: Update the Application

```bash
# Navigate to your application directory
cd /var/www/zenny

# Pull the latest changes from GitHub
git pull origin main

# Install backend dependencies (if any new ones)
cd zenny-backend
npm install

# Build backend (if it's a TypeScript project or has build scripts)
npm run build  # Only if package.json has a build script

# Install frontend dependencies (if any new ones)
cd ../Frontend
npm install

# Build frontend (if it's a React/Vue/Angular project)
npm run build  # Only if package.json has a build script

# Go back to main directory
cd /var/www/zenny

# Restart all services
pm2 restart all
```

### Step 4: Verify the Update

```bash
# Check if all services are running
pm2 status

# Check logs for any errors
pm2 logs

# Test if the application is accessible
curl -I http://localhost:3000
```

## Method 2: Automated Update Script

### Step 1: Upload the Update Script

From your local machine, copy the update script to your server:

```bash
scp update.sh root@your-droplet-ip:/var/www/zenny/
```

### Step 2: Run the Automated Update

```bash
# SSH into your server
ssh root@your-droplet-ip

# Navigate to application directory
cd /var/www/zenny

# Make the script executable
chmod +x update.sh

# Run the update script
./update.sh
```

The script will automatically:

- Pull latest changes from GitHub
- Install dependencies
- Build applications (if build scripts exist)
- Restart all services
- Verify the deployment

## 🔧 Environment File (.env) Management

### What Happens to Your .env File?

**Your existing `.env` file will be preserved during updates!** The update process includes:

1. **Automatic Backup**: Your current `.env` file is backed up before the update
2. **Safe Restoration**: After pulling new code, your original `.env` is restored
3. **No Reconfiguration Needed**: You don't need to recreate your environment variables

### If You Need to Update .env Variables

If you've added new environment variables to your code:

1. **Check what's new**: Look at `.env.example` files in your updated code
2. **Add new variables**: Edit your existing `.env` file to add any new required variables
3. **Keep existing values**: Don't change your current database URLs, API keys, etc.

### Example of Adding New .env Variables

```bash
# Check what new variables might be needed
cat zenny-backend/.env.example

# Edit your .env file to add new variables
nano zenny-backend/.env

# Add new variables like:
# NEW_API_KEY=your_new_api_key
# NEW_DATABASE_URL=your_new_database_url
```

## Troubleshooting

### If Git Pull Fails

If you get authentication errors when pulling:

1. **Check repository visibility**: Make sure your repo is public
2. **Check git remote URL**:
   ```bash
   git remote -v
   ```
3. **Update remote URL if needed**:
   ```bash
   git remote set-url origin https://github.com/your-username/Zenny.git
   ```

### If Services Don't Start

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs

# Restart specific service
pm2 restart zenny-backend
pm2 restart zenny-frontend
pm2 restart zenny-mail-poller
```

### If Dependencies Fail to Install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### If Build Fails

```bash
# Check if build script exists
cat package.json | grep -A 5 -B 5 "build"

# If TypeScript compilation fails, check types
npm run type-check  # if available

# If frontend build fails, check for missing dependencies
npm install --force

# Clear build cache (for frontend frameworks)
rm -rf build/ dist/ .next/ .nuxt/  # depending on your framework
npm run build
```

## Post-Update Checklist

After updating, verify:

- [ ] All services are running (`pm2 status`)
- [ ] No errors in logs (`pm2 logs`)
- [ ] Application is accessible via your domain
- [ ] All features work correctly
- [ ] Database connections are working
- [ ] Email functionality is working
- [ ] File uploads are working

## Security Reminder

**Don't forget to make your repository PRIVATE again after the update:**

1. Go to your GitHub repository
2. Click **Settings**
3. Scroll to **Danger Zone**
4. Click **Change repository visibility**
5. Select **Make private**
6. Confirm the change

## Quick Update Commands

For future quick updates, you can use these commands:

```bash
# Quick update with build (after making repo public)
ssh root@your-droplet-ip "cd /var/www/zenny && git pull origin main && cd zenny-backend && npm install && npm run build && cd ../Frontend && npm install && npm run build && cd /var/www/zenny && pm2 restart all"

# Or use the automated script (recommended)
ssh root@your-droplet-ip "cd /var/www/zenny && ./update.sh"
```

## 📋 Complete Update Checklist

Before starting the update:

- [ ] Make repository public on GitHub
- [ ] Commit and push all local changes
- [ ] Note any new environment variables needed
- [ ] Check if build scripts exist in package.json files

During the update:

- [ ] Pull latest code from GitHub
- [ ] Install dependencies for both backend and frontend
- [ ] Run build commands (if applicable)
- [ ] Restart all PM2 services
- [ ] Verify all services are running

After the update:

- [ ] Check application functionality
- [ ] Verify database connections
- [ ] Test email functionality
- [ ] Check file uploads
- [ ] Make repository private again

## Cost Control Reminder

Remember that your deployment includes cost controls:

- Monitor resource usage: `./cost-dashboard.sh`
- Check if cost limits are exceeded: `cat /var/www/zenny/COST_LIMIT_EXCEEDED`
- View resource alerts: `tail -f /var/log/zenny/resource-alerts.log`

---

**Note**: Always test your updates in a development environment before deploying to production. The update process is designed to be safe, but it's good practice to verify functionality after each update.
