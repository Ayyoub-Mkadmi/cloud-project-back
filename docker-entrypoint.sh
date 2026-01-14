#!/bin/sh
set -e

echo "Starting backend container..."

# Wait for Postgres to be ready
if [ -n "$PGHOST" ]; then
  echo "Waiting for Postgres at $PGHOST:${PGPORT:-5432}..."
  until nc -z "$PGHOST" "${PGPORT:-5432}"; do
    echo "Postgres is unavailable - sleeping"
    sleep 2
  done
  echo "Postgres is up - continuing"
fi

# Run migrations
echo "Running database migrations..."
node src/run_migrations.js

# Start the application
echo "Starting Node.js server..."
exec node src/index.js
