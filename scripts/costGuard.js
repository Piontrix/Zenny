#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Cost monitoring configuration
const COST_LIMITS = {
  DAILY_LIMIT: 0.2, // $0.20 per day (approximately $6/month)
  MONTHLY_LIMIT: 6.0, // $6.00 per month
  WARNING_THRESHOLD: 0.9, // 90% of limit (Alert threshold)
  SHUTDOWN_THRESHOLD: 0.95, // 95% of limit (Shutdown threshold)
};

// Log file paths
const LOG_DIR = "/var/log/zenny";
const COST_LOG = path.join(LOG_DIR, "cost-monitor.log");
const COST_DATA_FILE = path.join(LOG_DIR, "cost-data.json");

// Initialize cost tracking
function initCostTracking() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  if (!fs.existsSync(COST_DATA_FILE)) {
    const initialData = {
      dailyUsage: 0,
      monthlyUsage: 0,
      lastReset: {
        daily: new Date().toDateString(),
        monthly: new Date().getMonth() + "-" + new Date().getFullYear(),
      },
      history: [],
    };
    fs.writeFileSync(COST_DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Log function
function log(message, isAlert = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(logMessage.trim());
  fs.appendFileSync(COST_LOG, logMessage);
}

// Load cost data
function loadCostData() {
  try {
    const data = fs.readFileSync(COST_DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    log(`Error loading cost data: ${error.message}`, true);
    return null;
  }
}

// Save cost data
function saveCostData(data) {
  try {
    fs.writeFileSync(COST_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    log(`Error saving cost data: ${error.message}`, true);
  }
}

// Estimate current cost based on resource usage
function estimateCurrentCost() {
  return new Promise((resolve) => {
    // DigitalOcean $6/month plan breakdown:
    // - 1GB RAM: ~$0.0089/hour
    // - 1 vCPU: ~$0.0089/hour
    // - 25GB SSD: ~$0.0006/hour
    // - 1000GB transfer: ~$0.01/GB (after free tier)

    exec("free -m | grep '^Mem:' | awk '{print $3}'", (error, stdout) => {
      const memoryMB = parseInt(stdout.trim()) || 0;
      const memoryGB = memoryMB / 1024;

      // Calculate hourly cost (base cost + memory usage)
      const baseHourlyCost = 0.0089 + 0.0089 + 0.0006; // vCPU + RAM + SSD
      const memoryHourlyCost = memoryGB * 0.0089;
      const hourlyCost = baseHourlyCost + memoryHourlyCost;

      // Estimate daily cost (assuming 24 hours)
      const dailyCost = hourlyCost * 24;

      resolve(dailyCost);
    });
  });
}

// Check if we need to reset counters
function checkAndResetCounters(data) {
  const now = new Date();
  const today = now.toDateString();
  const currentMonth = now.getMonth() + "-" + now.getFullYear();

  let needsUpdate = false;

  // Reset daily counter if it's a new day
  if (data.lastReset.daily !== today) {
    data.dailyUsage = 0;
    data.lastReset.daily = today;
    needsUpdate = true;
    log("Daily cost counter reset");
  }

  // Reset monthly counter if it's a new month
  if (data.lastReset.monthly !== currentMonth) {
    data.monthlyUsage = 0;
    data.lastReset.monthly = currentMonth;
    needsUpdate = true;
    log("Monthly cost counter reset");
  }

  return needsUpdate;
}

// Emergency shutdown function
function emergencyShutdown(reason) {
  log(`🚨 COST EMERGENCY SHUTDOWN: ${reason}`, true);

  // Stop all PM2 processes
  exec("pm2 stop all", (error) => {
    if (error) {
      log(`Error stopping PM2 processes: ${error.message}`, true);
    } else {
      log("All PM2 processes stopped due to cost limit", true);
    }
  });

  // Stop Nginx
  exec("systemctl stop nginx", (error) => {
    if (error) {
      log(`Error stopping Nginx: ${error.message}`, true);
    } else {
      log("Nginx stopped due to cost limit", true);
    }
  });

  // Create a flag file to prevent auto-restart
  fs.writeFileSync(
    "/var/www/zenny/COST_LIMIT_EXCEEDED",
    `System halted at ${new Date().toISOString()} due to cost limit: ${reason}`
  );

  log("System halted to prevent cost overrun. Manual intervention required.", true);
  process.exit(1);
}

// Main cost monitoring function
async function monitorCosts() {
  try {
    const data = loadCostData();
    if (!data) return;

    // Check if counters need reset
    const needsUpdate = checkAndResetCounters(data);

    // Estimate current cost
    const estimatedCost = await estimateCurrentCost();

    // Update usage
    data.dailyUsage += estimatedCost;
    data.monthlyUsage += estimatedCost;

    // Add to history
    data.history.push({
      timestamp: new Date().toISOString(),
      dailyUsage: data.dailyUsage,
      monthlyUsage: data.monthlyUsage,
      estimatedCost,
    });

    // Keep only last 30 days of history
    if (data.history.length > 30) {
      data.history = data.history.slice(-30);
    }

    // Check limits
    const dailyLimit = COST_LIMITS.DAILY_LIMIT;
    const monthlyLimit = COST_LIMITS.MONTHLY_LIMIT;
    const warningThreshold = COST_LIMITS.WARNING_THRESHOLD;

    // Check for critical violations
    if (data.dailyUsage > dailyLimit) {
      emergencyShutdown(`Daily cost limit exceeded: $${data.dailyUsage.toFixed(2)} > $${dailyLimit}`);
      return;
    }

    if (data.monthlyUsage > monthlyLimit) {
      emergencyShutdown(`Monthly cost limit exceeded: $${data.monthlyUsage.toFixed(2)} > $${monthlyLimit}`);
      return;
    }

    // Check for warnings (90% threshold)
    if (data.dailyUsage > dailyLimit * warningThreshold) {
      log(`⚠️ WARNING: Daily cost approaching limit: $${data.dailyUsage.toFixed(2)} / $${dailyLimit}`, true);
    }

    if (data.monthlyUsage > monthlyLimit * warningThreshold) {
      log(`⚠️ WARNING: Monthly cost approaching limit: $${data.monthlyUsage.toFixed(2)} / $${monthlyLimit}`, true);
    }

    // Check for shutdown conditions (95% threshold)
    if (data.dailyUsage > dailyLimit * COST_LIMITS.SHUTDOWN_THRESHOLD) {
      emergencyShutdown(
        `Daily cost shutdown threshold exceeded: $${data.dailyUsage.toFixed(2)} > $${
          dailyLimit * COST_LIMITS.SHUTDOWN_THRESHOLD
        }`
      );
      return;
    }

    if (data.monthlyUsage > monthlyLimit * COST_LIMITS.SHUTDOWN_THRESHOLD) {
      emergencyShutdown(
        `Monthly cost shutdown threshold exceeded: $${data.monthlyUsage.toFixed(2)} > $${
          monthlyLimit * COST_LIMITS.SHUTDOWN_THRESHOLD
        }`
      );
      return;
    }

    // Log cost information every hour
    const now = new Date();
    if (now.getMinutes() === 0) {
      log(
        `Cost Status: Daily $${data.dailyUsage.toFixed(2)}/${dailyLimit}, Monthly $${data.monthlyUsage.toFixed(
          2
        )}/${monthlyLimit}`
      );
    }

    // Save updated data
    if (needsUpdate || data.history.length > 0) {
      saveCostData(data);
    }
  } catch (error) {
    log(`Cost monitoring error: ${error.message}`, true);
  }
}

// Check if system was halted due to cost limit
function checkCostLimitFlag() {
  const flagFile = "/var/www/zenny/COST_LIMIT_EXCEEDED";
  if (fs.existsSync(flagFile)) {
    const content = fs.readFileSync(flagFile, "utf8");
    log(`System was previously halted due to cost limit: ${content}`, true);
    log("Manual intervention required to restart services", true);
  }
}

// Start cost monitoring
function startCostMonitoring() {
  log("💰 Zenny Cost Monitor started");
  log(
    `Alert Thresholds (90%): Daily $${COST_LIMITS.DAILY_LIMIT * COST_LIMITS.WARNING_THRESHOLD}, Monthly $${
      COST_LIMITS.MONTHLY_LIMIT * COST_LIMITS.WARNING_THRESHOLD
    }`
  );
  log(
    `Shutdown Thresholds (95%): Daily $${COST_LIMITS.DAILY_LIMIT * COST_LIMITS.SHUTDOWN_THRESHOLD}, Monthly $${
      COST_LIMITS.MONTHLY_LIMIT * COST_LIMITS.SHUTDOWN_THRESHOLD
    }`
  );

  // Check for previous cost limit halts
  checkCostLimitFlag();

  // Initial check
  monitorCosts();

  // Set up periodic monitoring (every 15 minutes)
  setInterval(monitorCosts, 15 * 60 * 1000);
}

// Handle process termination
process.on("SIGINT", () => {
  log("Cost monitor shutting down gracefully");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Cost monitor shutting down gracefully");
  process.exit(0);
});

// Initialize and start
initCostTracking();
startCostMonitoring();
