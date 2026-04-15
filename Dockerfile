# syntax=docker/dockerfile:1

# --- Stage 1: зависимости (deps) ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile

# --- Stage 2: сборка (build) ---
FROM deps AS build
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client
COPY packages/server ./packages/server
RUN pnpm --filter @family-tree/client build \
  && pnpm --filter @family-tree/server build \
  && pnpm prune --prod

# --- Stage 3: runtime (runner) ---
FROM node:22-alpine AS runner
RUN apk add --no-cache vips-dev libc6-compat
ENV NODE_ENV=production
# Нужен для раздачи `client/dist` из Hono (`static-spa.ts`)
WORKDIR /app
COPY --from=build /app /app
COPY docker/entrypoint.sh /entrypoint.sh
COPY scripts/docker-backup-run.sh /app/scripts/docker-backup-run.sh
COPY docker/crontab-root /etc/crontabs/root
RUN chmod +x /entrypoint.sh /app/scripts/docker-backup-run.sh \
  && chmod 600 /etc/crontabs/root
WORKDIR /app/packages/server
EXPOSE 3000
ENV PORT=3000
ENV DATABASE_PATH=/data/db/family-tree.db
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/serve.js"]
