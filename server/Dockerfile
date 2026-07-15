# ==========================
# Stage 1 - Build
# ==========================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Compile TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# ==========================
# Stage 2 - Production
# ==========================
FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodeuser

# Copy production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Change ownership
RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 8080

# Health Check
HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=20s \
    --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "npm run prisma:deploy && npm run start:prod"]