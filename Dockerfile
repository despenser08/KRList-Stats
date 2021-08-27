FROM node:16 as base

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev \
  glibc musl libvips \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/bot


FROM base as builder

COPY . .

RUN yarn install --frozen-lockfile \
  && yarn cache clean \
  && yarn build


FROM base as production

COPY --from=builder /usr/src/bot/dist ./dist

COPY ./assets ./assets
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile \
  && yarn cache clean

CMD yarn start
