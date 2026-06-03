# ============================================================
# Builder Stage
# Uses Alpine variant (~40 MB) — the project has no native
# dependencies, so the full Debian variant is unnecessary.
# ============================================================
FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /app

# ---------------------------------------------------------
# Layer 1: Copy only manifest files for dependency caching.
# Changes to source code won't invalidate this layer.
# ---------------------------------------------------------
COPY package.json bun.lock ./

# Copy workspace package.json files so Bun can resolve
# workspace dependencies (@credets/*)
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared-utils/package.json packages/shared-utils/package.json
COPY packages/shared-schema/package.json packages/shared-schema/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

# Install for production — skips devDependencies, reducing
# image size significantly (no biome, @types/*, etc.)
RUN bun install --frozen-lockfile --production

# ---------------------------------------------------------
# Layer 2: Copy source code (only what's needed at runtime)
# ---------------------------------------------------------
# tsconfig.json is required for @backend/* and @db/* path aliases
COPY tsconfig.json ./
COPY apps/backend apps/backend
COPY packages packages

# ============================================================
# Runner Stage
# Statically linked codecs in Bun.Image mean no shared library
# dependencies needed for image processing.
# ~40 MB base — the smallest variant with full Bun API support.
# ============================================================
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

# Copy only what's needed — selectively, not the entire builder
COPY --from=builder /app/apps/backend /app/apps/backend
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/tsconfig.json /app/tsconfig.json

# Environment
ENV NODE_ENV=production
EXPOSE 8000

# Health check — uses the /healthz endpoint defined in index.ts
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e "fetch('http://localhost:8000/healthz').then(r => { if (!r.ok) process.exit(1); })"

# Start the backend server
CMD ["bun", "run", "apps/backend/index.ts"]
