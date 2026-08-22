# ---------- build stage ----------
# Use this file only when the Docker context is the BE/ folder:
#   cd BE && docker build -t hourly-api .
# On Render, use the repo-root Dockerfile (context = repository root).
FROM node:20-alpine AS build

# enable Yarn Classic (v1) via Corepack
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# app dir
WORKDIR /home/node/app

# deps first for better caching
COPY tsconfig.json package.json yarn.lock esbuild.config.ts ./
RUN yarn install --frozen-lockfile

# source
COPY src ./src

# build
RUN yarn build


# ---------- runtime stage ----------
FROM node:20-alpine

# enable Yarn Classic for prod install
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# init
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /home/node/app

# prod deps only
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean --force

# app files
COPY --from=build /home/node/app/dist ./dist

EXPOSE 8080
USER node
CMD ["dumb-init","node","dist/index.js","--max-old-space-size=512"]
