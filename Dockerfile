# =========================
# 1️⃣ Build stage
# =========================
FROM node:22-alpine AS builder

# Install dependency native module
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

# Cache Layer: Copy package.json & yarn.lock
COPY package.json yarn.lock ./

# Install dependencies (termasuk devDependencies untuk build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build NestJS
RUN yarn build

# =========================
# 2️⃣ Production runtime stage
# =========================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install runtime libs (tanpa compiler tools)
RUN apk add --no-cache \
  cairo \
  pango \
  jpeg \
  giflib \
  libpng \
  pixman \
  fontconfig \
  ttf-dejavu

# --- 🚀 OPTIMASI KECEPATAN BUILD DI SINI ---

# Gunakan flag --chown=node:node SAAT COPY.
# Ini 100x lebih cepat daripada menjalankan RUN chown -R di akhir.

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=node:node /app/dist ./dist

# --- 🛡️ PERSIAPAN FOLDER UPLOAD ---

# Buat folder upload dan ubah kepemilikannya ke node
# Kita lakukan ini manual hanya untuk folder kosong, jadi sangat cepat.
RUN mkdir -p ./uploads/images/user && chown -R node:node ./uploads

# --- SELESAI ---

# Gunakan user node
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
