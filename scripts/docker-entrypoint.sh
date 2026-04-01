#!/bin/sh
set -e

echo "🚀 GreenPatshala Docker Entrypoint"
echo "==================================="

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'mysql',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.end();
  process.exit(0);
})().catch(() => process.exit(1));
" 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ MySQL not ready after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES — waiting 2s..."
  sleep 2
done

echo "✅ MySQL is ready!"

# Run database schema push
echo "📦 Pushing database schema..."
npx drizzle-kit push --force || {
  echo "⚠️  Schema push failed, but continuing..."
}

echo "✅ Database setup complete!"
echo "🚀 Starting application..."

# Execute the main command (node dist/index.cjs)
exec "$@"
