/**
 * PM2 Ecosystem Configuration for ULTRA BARBER Studio
 * Configurado para SQLite con WAL mode en modo 'fork' (1 instancia para evitar contención de bloqueos)
 */

module.exports = {
  apps: [
    {
      name: 'barberfade-api',
      script: 'server/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      autorestart: true,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'development',
        PORT: 7201
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7201
      },
      time: true,
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true
    }
  ]
};
