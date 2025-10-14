# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# 设置构建时的环境变量（直接从 .env.local 硬编码）
ENV NEXT_PUBLIC_API_BASE_URL=/Api/DeviceMonitor
ENV NEXT_PUBLIC_OSS_REGION=oss-cn-hongkong.aliyuncs.com
ENV NEXT_PUBLIC_OSS_ACCESS_KEY_ID=LTAI5tHp4npyJuEr1XAYEigh
ENV NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET=8Gbjzr9kJfo0sVuoumJtlCLFukXWtY
ENV NEXT_PUBLIC_OSS_BUCKET=md-device-front
ENV NEXT_PUBLIC_OSS_ENDPOINT=http://md-device-front.wszone88.com

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
