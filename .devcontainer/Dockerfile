FROM node:20-slim

# Install basic development tools
RUN apt-get update && apt-get install -y \
    git \
    openssh-client \
    gnupg \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install global tools
RUN npm install -g @nestjs/cli turbo

# Set up non-root user
USER node
WORKDIR /home/node/app
