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
      error_file: "/var/log/zenny/backend-error.log",
      out_file: "/var/log/zenny/backend-out.log",
      log_file: "/var/log/zenny/backend-combined.log",
      time: true,
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
      error_file: "/var/log/zenny/poller-error.log",
      out_file: "/var/log/zenny/poller-out.log",
      log_file: "/var/log/zenny/poller-combined.log",
      time: true,
    },
  ],
};
