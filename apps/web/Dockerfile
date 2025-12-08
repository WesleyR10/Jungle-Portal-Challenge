FROM node:20-alpine AS base
# Enable corepack for consistency
RUN corepack enable

# 1. Prune stage
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# 2. Builder stage
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=pruner /app/out/full/ .
RUN npx turbo build --filter=web...

# 3. Runner stage
FROM nginx:alpine AS runner
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Add custom nginx config for SPA and Gzip
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
