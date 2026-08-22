# Render default: build context = repository root (not BE/).
# Local from BE/: docker build -f Dockerfile .

# ---------- build stage ----------
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

WORKDIR /home/node/app

COPY BE/tsconfig.json BE/package.json BE/yarn.lock BE/esbuild.config.ts ./
RUN yarn install --frozen-lockfile

COPY BE/src ./src

RUN yarn build

# ---------- runtime stage ----------
FROM node:20-alpine

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /home/node/app

COPY BE/package.json BE/yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean --force

COPY --from=build /home/node/app/dist ./dist

EXPOSE 8080
USER node
CMD ["dumb-init","node","dist/index.js","--max-old-space-size=512"]
