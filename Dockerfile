FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.5

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start:dev"] 