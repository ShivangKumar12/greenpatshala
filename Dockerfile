# ============================================
# Stage 1: Build (Debian for native module compatibility)
# ============================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (canvas, bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config \
    libpixman-1-dev libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install ALL dependencies (including devDependencies)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json tsconfig.server.json vite.config.ts tailwind.config.ts postcss.config.js components.json drizzle.config.ts ./
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY script/ ./script/
COPY drizzle/ ./drizzle/

# Set VITE_API_URL so Vite bakes relative /api path into the frontend build
ENV VITE_API_URL=/api

# Build frontend (Vite → dist/public/) and backend (esbuild → dist/index.cjs)
RUN npm run build

# ============================================
# Stage 2: Production (Debian slim for runtime)
# ============================================
FROM node:20-bookworm-slim AS production

WORKDIR /app

# Install runtime dependencies for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpixman-1-0 libcairo2 libpango-1.0-0 libpangocairo-1.0-0 \
    libjpeg62-turbo libgif7 librsvg2-2 curl \
    && rm -rf /var/lib/apt/lists/*

# Copy node_modules from builder (already has native modules pre-built)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Prune devDependencies to reduce image size
RUN npm prune --omit=dev 2>/dev/null || true && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy drizzle migrations for DB push
COPY drizzle.config.ts tsconfig.json ./
COPY drizzle/ ./drizzle/
COPY shared/ ./shared/

# Copy entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/uploads/study-materials /app/uploads/current-affairs /app/uploads/courses/thumbnails /app/uploads/courses/pdfs /app/uploads/courses/videos /app/uploads/quizzes /app/uploads/mobile-banners

# Set environment
ENV NODE_ENV=production
ENV PORT=5050

EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5050/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.cjs"]
