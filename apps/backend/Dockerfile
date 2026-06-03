# ============================================================
# Builder Stage
# Uses full Debian variant to have all build/system tools in
# case native dependencies (e.g. imgkit) need compilation.
# ============================================================
FROM oven/bun:1.3.14-debian AS builder

WORKDIR /app

# ---------------------------------------------------------
# Layer 1: Copy only manifest files for dependency caching.
# Changes to source code won't invalidate this layer.
# ---------------------------------------------------------
COPY package.json bun.lock ./

# Copy workspace package.json files so Bun can resolve
# workspace dependencies (@credets/*)
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared-utils/package.json packages/shared-utils/package.json
COPY packages/shared-schema/package.json packages/shared-schema/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

# Install all workspace dependencies with frozen lockfile
# for reproducible builds
RUN bun install --frozen-lockfile

# ---------------------------------------------------------
# Layer 2: Copy source code (only what's needed at runtime)
# ---------------------------------------------------------
COPY apps/backend apps/backend
COPY packages packages

# ============================================================
# Runner Stage
# Uses Alpine variant — statically linked codecs in Bun.Image
# mean no shared library dependencies needed for image processing.
# ~40 MB — the smallest variant with full Bun API support.
# ============================================================
FROM oven/bun:1.3.14-alpine AS runner

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app /app

# Environment
ENV NODE_ENV=production
EXPOSE 8000

# Health check — uses the /healthz endpoint defined in index.ts
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD bun -e "fetch('http://localhost:8000/healthz').then(r => { if (!r.ok) process.exit(1); })"

# Start the backend server
CMD ["bun", "run", "apps/backend/index.ts"]
