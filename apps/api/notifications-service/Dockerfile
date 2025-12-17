FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g turbo

# Stage 1: Prune
FROM base AS prune
COPY . .
RUN turbo prune notifications-service --docker

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --from=prune /app/out/full/ .
RUN --mount=type=cache,target=/root/.npm turbo build --filter=notifications-service

# Stage 3: Development
FROM base AS development
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --from=prune /app/out/full/ .
RUN npm i -g @nestjs/cli
WORKDIR /app/apps/api/notifications-service
# Use ts-node directly in development to avoid dist issues (absolute path)
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "/app/apps/api/notifications-service/src/main.ts"]

# Stage 4: Production Prep
FROM builder AS prod-prep
RUN --mount=type=cache,target=/root/.npm npm prune --production

# Stage 5: Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=prod-prep --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/notifications-service/dist ./dist
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/notifications-service/package.json ./package.json
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/notifications-service/node_modules ./node_modules

ENV NODE_ENV=production
# Porta padrão para microserviços RMQ não é HTTP, mas deixamos pronto caso precise
ENV PORT=3003 

USER nestjs

CMD ["node", "dist/main"]
