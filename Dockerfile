FROM node:20.15.0-alpine AS BUILD_IMAGE

# Create app directory
WORKDIR /usr/src/app

RUN corepack enable

# Install app dependencies
COPY pnpm-lock.yaml ./

RUN pnpm fetch

# Bundle app source
COPY . .

RUN pnpm install --offline

ENV NODE_ENV=production

RUN pnpm run build

# remove development dependencies
RUN pnpm install --offline --prod

FROM node:20.15.0-alpine

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 3000
CMD ["npx", "serve", "dist"]