FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g turbo

# Stage 1: Prune
FROM base AS prune
COPY . .
RUN turbo prune api-gateway --docker

# Stage 2: Builder (Instala tudo e builda)
FROM base AS builder
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --from=prune /app/out/full/ .
RUN --mount=type=cache,target=/root/.npm turbo build --filter=api-gateway

# Stage 3: Development (Para docker-compose.yml com volumes)
FROM base AS development
WORKDIR /app
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm npm ci
COPY --from=prune /app/out/full/ .
RUN npm i -g @nestjs/cli
WORKDIR /app/apps/api/api-gateway
# Use ts-node directly in development to avoid dist issues (absolute path)
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "/app/apps/api/api-gateway/src/main.ts"]

# Stage 4: Production Prep (Limpa devDependencies)
FROM builder AS prod-prep
RUN --mount=type=cache,target=/root/.npm npm prune --production

# Stage 5: Runner (Produção Final)
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=prod-prep --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/api-gateway/dist ./dist
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/api-gateway/package.json ./package.json
COPY --from=prod-prep --chown=nestjs:nodejs /app/apps/api/api-gateway/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

USER nestjs
EXPOSE 3000

CMD ["node", "dist/main"]
