# ─── Build Stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app/server

# Copy dependency files first (cache layer)
COPY server/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# ─── Production Stage ─────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app/server

# Security: run as non-root
RUN addgroup -g 1001 -S shoppilot && \
    adduser -S shoppilot -u 1001

# Copy from builder
COPY --from=builder /app/server ./

# Create uploads directory
RUN mkdir -p uploads && chown -R shoppilot:shoppilot /app

USER shoppilot

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
