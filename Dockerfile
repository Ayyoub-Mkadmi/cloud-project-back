FROM node:20-alpine

# Install netcat for DB wait script
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Expose port (default 3000, configurable via PORT env var)
EXPOSE 3000

# Use entrypoint script to run migrations then start app
ENTRYPOINT ["/app/docker-entrypoint.sh"]
