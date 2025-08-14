#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

// Configuration - Alert at 90%, Shutdown at 95% to stay under $6 cost
const LIMITS = {
  MEMORY_PERCENT: 90, // 90% of 1GB = 900MB (Alert threshold)
  CPU_PERCENT: 90, // 90% of 1 vCPU (Alert threshold)
  DISK_PERCENT: 90, // 90% of 25GB = 22.5GB (Alert threshold)
  BANDWIDTH_GB: 900, // 90% of 1000GB = 900GB (Alert threshold)

  // Shutdown thresholds (95%)
  SHUTDOWN_MEMORY_PERCENT: 95, // 95% of 1GB = 950MB (Shutdown threshold)
  SHUTDOWN_CPU_PERCENT: 95, // 95% of 1 vCPU (Shutdown threshold)
  SHUTDOWN_DISK_PERCENT: 95, // 95% of 25GB = 23.75GB (Shutdown threshold)
  SHUTDOWN_BANDWIDTH_GB: 950, // 95% of 1000GB = 950GB (Shutdown threshold)
};

// Monitoring intervals
const CHECK_INTERVAL = 60000; // 1 minute
const LOG_INTERVAL = 300000; // 5 minutes

// Log file paths
const LOG_DIR = "/var/log/zenny";
const MONITOR_LOG = path.join(LOG_DIR, "resource-monitor.log");
const ALERT_LOG = path.join(LOG_DIR, "resource-alerts.log");

// Bandwidth tracking
let bandwidthUsage = 0;
let lastBandwidthCheck = Date.now();

// Initialize logs
function initLogs() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Log function
function log(message, isAlert = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  console.log(logMessage.trim());

  // Write to appropriate log file
  const logFile = isAlert ? ALERT_LOG : MONITOR_LOG;
  fs.appendFileSync(logFile, logMessage);
}

// Get system memory usage
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercent = (usedMem / totalMem) * 100;

  return {
    total: totalMem,
    used: usedMem,
    free: freeMem,
    percent: memoryPercent,
  };
}

// Get CPU usage
function getCpuUsage() {
  return new Promise((resolve) => {
    exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1", (error, stdout) => {
      if (error) {
        resolve(0);
      } else {
        const cpuPercent = parseFloat(stdout.trim()) || 0;
        resolve(cpuPercent);
      }
    });
  });
}

// Get disk usage
function getDiskUsage() {
  return new Promise((resolve) => {
    exec("df / | tail -1 | awk '{print $5}' | cut -d'%' -f1", (error, stdout) => {
      if (error) {
        resolve(0);
      } else {
        const diskPercent = parseFloat(stdout.trim()) || 0;
        resolve(diskPercent);
      }
    });
  });
}

// Get bandwidth usage (approximate)
function getBandwidthUsage() {
  return new Promise((resolve) => {
    exec("cat /proc/net/dev | grep eth0 | awk '{print $2 + $10}'", (error, stdout) => {
      if (error) {
        resolve(0);
      } else {
        const bytes = parseInt(stdout.trim()) || 0;
        const gb = bytes / (1024 * 1024 * 1024);
        resolve(gb);
      }
    });
  });
}

// Check if limits are exceeded
function checkLimits(memory, cpu, disk, bandwidth) {
  const alerts = [];
  const shutdownAlerts = [];

  // Check for alerts (90% threshold)
  if (memory.percent > LIMITS.MEMORY_PERCENT) {
    alerts.push(`MEMORY: ${memory.percent.toFixed(1)}% (Alert: ${LIMITS.MEMORY_PERCENT}%)`);
  }

  if (cpu > LIMITS.CPU_PERCENT) {
    alerts.push(`CPU: ${cpu.toFixed(1)}% (Alert: ${LIMITS.CPU_PERCENT}%)`);
  }

  if (disk > LIMITS.DISK_PERCENT) {
    alerts.push(`DISK: ${disk.toFixed(1)}% (Alert: ${LIMITS.DISK_PERCENT}%)`);
  }

  if (bandwidth > LIMITS.BANDWIDTH_GB) {
    alerts.push(`BANDWIDTH: ${bandwidth.toFixed(1)}GB (Alert: ${LIMITS.BANDWIDTH_GB}GB)`);
  }

  // Check for shutdown conditions (95% threshold)
  if (memory.percent > LIMITS.SHUTDOWN_MEMORY_PERCENT) {
    shutdownAlerts.push(`MEMORY: ${memory.percent.toFixed(1)}% (Shutdown: ${LIMITS.SHUTDOWN_MEMORY_PERCENT}%)`);
  }

  if (cpu > LIMITS.SHUTDOWN_CPU_PERCENT) {
    shutdownAlerts.push(`CPU: ${cpu.toFixed(1)}% (Shutdown: ${LIMITS.SHUTDOWN_CPU_PERCENT}%)`);
  }

  if (disk > LIMITS.SHUTDOWN_DISK_PERCENT) {
    shutdownAlerts.push(`DISK: ${disk.toFixed(1)}% (Shutdown: ${LIMITS.SHUTDOWN_DISK_PERCENT}%)`);
  }

  if (bandwidth > LIMITS.SHUTDOWN_BANDWIDTH_GB) {
    shutdownAlerts.push(`BANDWIDTH: ${bandwidth.toFixed(1)}GB (Shutdown: ${LIMITS.SHUTDOWN_BANDWIDTH_GB}GB)`);
  }

  return { alerts, shutdownAlerts };
}

// Emergency shutdown function
function emergencyShutdown(reason) {
  log(`🚨 EMERGENCY SHUTDOWN TRIGGERED: ${reason}`, true);

  // Stop all PM2 processes
  exec("pm2 stop all", (error) => {
    if (error) {
      log(`Error stopping PM2 processes: ${error.message}`, true);
    } else {
      log("All PM2 processes stopped", true);
    }
  });

  // Stop Nginx
  exec("systemctl stop nginx", (error) => {
    if (error) {
      log(`Error stopping Nginx: ${error.message}`, true);
    } else {
      log("Nginx stopped", true);
    }
  });

  // Log final message
  log("System halted to prevent cost overrun. Manual intervention required.", true);

  // Exit the monitor
  process.exit(1);
}

// Main monitoring function
async function monitorResources() {
  try {
    const memory = getMemoryUsage();
    const cpu = await getCpuUsage();
    const disk = await getDiskUsage();
    const bandwidth = await getBandwidthUsage();

    // Check for limit violations
    const { alerts, shutdownAlerts } = checkLimits(memory, cpu, disk, bandwidth);

    // Handle alerts (90% threshold)
    if (alerts.length > 0) {
      const alertMessage = `⚠️ WARNING - Resource usage high: ${alerts.join(", ")}`;
      log(alertMessage, true);
    }

    // Handle shutdown conditions (95% threshold)
    if (shutdownAlerts.length > 0) {
      const shutdownMessage = `🚨 CRITICAL - Emergency shutdown triggered: ${shutdownAlerts.join(", ")}`;
      log(shutdownMessage, true);
      emergencyShutdown(`Critical resource limits exceeded: ${shutdownAlerts.join(", ")}`);
      return;
    }

    // Log resource usage every 5 minutes
    if (Date.now() % LOG_INTERVAL < CHECK_INTERVAL) {
      log(
        `Resources: Memory ${memory.percent.toFixed(1)}%, CPU ${cpu.toFixed(1)}%, Disk ${disk.toFixed(
          1
        )}%, Bandwidth ${bandwidth.toFixed(1)}GB`
      );
    }
  } catch (error) {
    log(`Monitoring error: ${error.message}`, true);
  }
}

// Start monitoring
function startMonitoring() {
  log("🚀 Zenny Resource Monitor started");
  log(
    `Alert Thresholds (90%): Memory ${LIMITS.MEMORY_PERCENT}%, CPU ${LIMITS.CPU_PERCENT}%, Disk ${LIMITS.DISK_PERCENT}%, Bandwidth ${LIMITS.BANDWIDTH_GB}GB`
  );
  log(
    `Shutdown Thresholds (95%): Memory ${LIMITS.SHUTDOWN_MEMORY_PERCENT}%, CPU ${LIMITS.SHUTDOWN_CPU_PERCENT}%, Disk ${LIMITS.SHUTDOWN_DISK_PERCENT}%, Bandwidth ${LIMITS.SHUTDOWN_BANDWIDTH_GB}GB`
  );

  // Initial check
  monitorResources();

  // Set up periodic monitoring
  setInterval(monitorResources, CHECK_INTERVAL);
}

// Handle process termination
process.on("SIGINT", () => {
  log("Resource monitor shutting down gracefully");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("Resource monitor shutting down gracefully");
  process.exit(0);
});

// Initialize and start
initLogs();
startMonitoring();
