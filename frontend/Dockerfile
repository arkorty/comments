# Build stage
FROM oven/bun:1-alpine AS builder
# Install npm for react-scripts compatibility
RUN apk add --no-cache npm
WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1-alpine
# Install npm for serve package
RUN apk add --no-cache npm
WORKDIR /app
COPY --from=builder /app/build ./build
RUN bun add -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"] 
