FROM node:lts-bullseye-slim as base

ARG VERSION
ARG REVISION

ENV VERSION=$VERSION
ENV REVISION=$REVISION

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential git libvips libcairo2-dev \
  libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/share/fonts/opentype/noto
COPY ./assets/fonts/NotoSansKR-Regular.otf /usr/share/fonts/opentype/noto/NotoSansKR-Regular.otf
RUN fc-cache -fv

WORKDIR /usr/src/bot


FROM base as builder

COPY . .

RUN yarn install --frozen-lockfile && yarn cache clean

RUN yarn build


FROM base as production

COPY --from=builder /usr/src/bot/dist ./dist

COPY ./assets ./assets
COPY package.json .
COPY yarn.lock .

RUN yarn install --production --frozen-lockfile && yarn cache clean

CMD yarn start
