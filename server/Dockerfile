# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.16.0

# =========================
# Base
# =========================
FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    python-is-python3 \
    pkg-config \
    node-gyp \
    ca-certificates \
    curl && \
    rm -rf /var/lib/apt/lists/*

# =========================
# Dependencies
# =========================
FROM base AS deps

COPY package*.json ./

RUN npm ci

# =========================
# Build
# =========================
FROM deps AS build

COPY . .

# Generate Prisma Client
RUN npx prisma generate --config=src/prisma.config.ts

# Compile TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# =========================
# Production
# =========================
FROM node:${NODE_VERSION}-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    dumb-init \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]