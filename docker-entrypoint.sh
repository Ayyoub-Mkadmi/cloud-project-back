#!/bin/sh

echo "Starting backend container..."

# Try to run migrations if database is available (5 second timeout)
if [ -n "$PGHOST" ]; then
  echo "Checking Postgres at $PGHOST:${PGPORT:-5432} (5s timeout)..."
  if timeout 5 nc -z "$PGHOST" "${PGPORT:-5432}" 2>/dev/null; then
    echo "Postgres is available - running migrations..."
    node src/run_migrations.js || echo "Migration failed, continuing anyway..."
  else
    echo "Postgres not available after 5s - skipping migrations"
  fi
fi

# Start the application
echo "Starting Node.js server..."
exec node src/index.js
