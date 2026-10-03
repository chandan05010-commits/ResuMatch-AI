FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 -S appuser && adduser -u 1000 -S appuser -G appuser
USER appuser

# Copy package files
COPY --chown=appuser:appuser package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY --chown=appuser:appuser . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]