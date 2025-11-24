# =========================
# 1️⃣ Build stage
# =========================
FROM node:22-alpine AS builder

# Tambahkan semua dependency untuk build native module seperti canvas
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  libpng-dev \
  pkgconfig \
  pixman-dev

WORKDIR /app

# Salin manifest dulu untuk caching
COPY package.json yarn.lock ./

# Install semua dependencies (termasuk dev)
RUN yarn install --frozen-lockfile

# Copy seluruh source code
COPY . .

# Build NestJS (output ke /app/dist)
RUN yarn build


# =========================
# 2️⃣ Production runtime stage
# =========================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only runtime libs yang dibutuhkan canvas (tanpa dev tools)
RUN apk add --no-cache \
  cairo \
  pango \
  jpeg \
  giflib \
  libpng \
  pixman \
  fontconfig \
  ttf-dejavu

# Copy hasil build dan node_modules dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/dist ./dist

# 1. Buat struktur folder upload secara eksplisit agar tidak error saat runtime
RUN mkdir -p ./uploads/images/user

# 2. Berikan kepemilikan seluruh folder /app kepada user 'node'
# Tanpa ini, user 'node' tidak bisa menulis file apapun!
RUN chown -R node:node /app

# Jalankan dengan user non-root
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
