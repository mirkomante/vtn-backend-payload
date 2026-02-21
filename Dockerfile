# Production Dockerfile with automatic database migrations
FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm i --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# GCS_BUCKET e GCP_PROJECT_ID sono passati come ARG durante il build
# per garantire che il plugin GCS sia attivo nell'importMap (evita pagina bianca).
# I valori reali vengono iniettati da Cloud Run a runtime tramite le env vars del servizio.
ARG GCS_BUCKET=build-placeholder
ARG GCP_PROJECT_ID=build-placeholder
ENV GCS_BUCKET=${GCS_BUCKET}
ENV GCP_PROJECT_ID=${GCP_PROJECT_ID}

RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

# Create media directory for local uploads (if GCS not configured)
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start server
# Use 'yes' to auto-accept migration prompts in non-interactive environments
# CI=true disables interactive prompts in some tools
CMD ["sh", "-c", "yes | npx payload migrate || true && npx next start"]
