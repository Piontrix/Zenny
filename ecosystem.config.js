module.exports = {
  apps: [
    {
      name: "zenny-backend",
      cwd: "/var/www/zenny/zenny-backend",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "900M", // 90% of 1GB - alert threshold
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
      node_args: "--max-old-space-size=900", // Limit Node.js heap to 900MB
    },
    {
      name: "zenny-mail-poller",
      cwd: "/var/www/zenny/zenny-backend",
      script: "src/utils/reminderPoller.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "50M", // Very low limit for poller
      max_restarts: 3,
      min_uptime: "10s",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/zenny/poller-error.log",
      out_file: "/var/log/zenny/poller-out.log",
      log_file: "/var/log/zenny/poller-combined.log",
      time: true,
      node_args: "--max-old-space-size=50", // Limit Node.js heap to 50MB
    },
    {
      name: "zenny-resource-monitor",
      cwd: "/var/www/zenny",
      script: "scripts/resourceMonitor.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "10M", // Minimal memory for monitor
      env: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/zenny/monitor-error.log",
      out_file: "/var/log/zenny/monitor-out.log",
      log_file: "/var/log/zenny/monitor-combined.log",
      time: true,
    },
  ],
};
