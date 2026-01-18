# Multi-AI-at-Once Docker Configuration
FROM node:20-alpine AS base

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    woff2 \
    && rm -rf /var/cache/apk/*

# Set Playwright to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/web/package.json ./packages/web/
COPY packages/cli/package.json ./packages/cli/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
COPY packages/core ./packages/core
COPY packages/web ./packages/web
COPY packages/cli ./packages/cli

RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies for Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/
RUN pnpm install --prod --frozen-lockfile

# Copy built web package
COPY --from=base /app/packages/web/.next ./packages/web/.next
COPY --from=base /app/packages/web/public ./packages/web/public
COPY --from=base /app/packages/web/node_modules ./packages/web/node_modules
COPY --from=base /app/packages/web/package.json ./packages/web/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Start the application
CMD ["pnpm", "--filter", "@multi-ai/web", "start"]
