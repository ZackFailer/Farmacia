module.exports = {
  apps: [
    {
      name: 'apopharma-backend',
      script: 'dist/apps/backend/start.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      node_args: '--experimental-sqlite',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
