#!/bin/sh

# Wait until DB is ready (optional, improves reliability)
echo "Waiting for Postgres..."
while ! pg_isready -h "$POSTGRES_DB" -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER"; do
  sleep 1
done

# Run the migration
/app/bin/backend eval "Backend.Release.migrate"

# Start the app
exec /app/bin/server
