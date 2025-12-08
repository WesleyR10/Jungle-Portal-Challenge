FROM node:20-alpine AS base
# Enable corepack for consistency, though we use npm
RUN corepack enable

# 1. Prune stage: Isolate the api-gateway and its dependencies
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api-gateway --docker

# 2. Builder stage: Install dependencies and build
FROM base AS builder
WORKDIR /app

# Copy only the pruned lockfile and package.json's
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies (cached if lockfile doesn't change)
RUN npm ci

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build the project
RUN npx turbo build --filter=api-gateway...

# 3. Runner stage: Create the final lightweight image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy only necessary files
COPY --from=builder --chown=nestjs:nodejs /app/apps/api-gateway/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api-gateway/package.json ./package.json

CMD ["node", "dist/main"]
