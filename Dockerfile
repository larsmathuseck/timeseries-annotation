#############
# Create base image.

FROM node:20.15.0-alpine AS base-image

# The `CI` environment variable must be set for pnpm to run in headless mode
ENV CI=true

WORKDIR /usr/src/app

RUN corepack enable


########################
# Install dependencies.

FROM base-image AS prepare

COPY ./pnpm-lock.yaml ./

RUN pnpm fetch

COPY ./ ./

RUN pnpm install --offline


########################
# Build for static deployment.

FROM prepare AS build-static

ENV NODE_ENV=production
RUN pnpm run build \
    && pnpm install --offline --prod


########################
# Lint.

FROM prepare AS lint

RUN pnpm run lint


#######################
# Collect build, lint and test results.

FROM base-image AS collect

COPY --from=build-static /usr/src/app/dist ./dist
COPY --from=build-static /usr/src/app/node_modules ./node_modules
COPY --from=build-static /usr/src/app/package.json ./package.json
COPY --from=lint /usr/src/app/package.json /tmp/package.json


#######################
# Serve for production.

FROM node:20.15.0-alpine AS production

# The `CI` environment variable must be set for pnpm to run in headless mode
ENV CI=true
ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN corepack enable

COPY --from=collect /usr/src/app/dist ./dist
COPY --from=collect /usr/src/app/node_modules ./node_modules
COPY --from=collect /usr/src/app/package.json ./package.json

HEALTHCHECK CMD wget -O /dev/null http://localhost:3000/ || exit 1
EXPOSE 3000
CMD ["pnpm", "exec", "serve", "dist"]
