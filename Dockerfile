#############
# Create base image.

FROM node:22.11.0-alpine AS base-image

# The `CI` environment variable must be set for pnpm to run in headless mode
ENV CI=true

WORKDIR /srv/app

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

FROM prepare AS build

ENV NODE_ENV=production
RUN pnpm run build


########################
# Lint.

FROM prepare AS lint

RUN pnpm run lint


#######################
# Collect build, lint and test results.

FROM base-image AS collect

COPY --from=build /srv/app/.output/public ./.output/public
# COPY --from=build /srv/app/dist ./dist
# COPY --from=build /srv/app/node_modules ./node_modules
# COPY --from=build /srv/app/package.json ./package.json
COPY --from=lint /srv/app/package.json /tmp/package.json


#######################
# Serve node for production.

FROM nginx:1.27.3-alpine AS production

WORKDIR /usr/share/nginx/html

COPY --from=collect /srv/app/.output/public/ ./

HEALTHCHECK CMD wget -O /dev/null http://localhost/ || exit 1
EXPOSE 80



# #######################
# # Serve node for production.

# FROM node:22.11.0-alpine AS production

# # The `CI` environment variable must be set for pnpm to run in headless mode
# ENV CI=true
# ENV NODE_ENV=production

# WORKDIR /srv/app

# RUN corepack enable

# COPY --from=collect /srv/app/dist ./dist
# COPY --from=collect /srv/app/node_modules ./node_modules
# COPY --from=collect /srv/app/package.json ./package.json

# HEALTHCHECK CMD wget -O /dev/null http://localhost:3000/ || exit 1
# EXPOSE 3000
# CMD ["pnpm", "exec", "serve", "dist"]
