FROM node:16 AS BUILDER

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/bot
COPY . .

RUN yarn install --frozen-lockfile \
  && yarn cache clean \
  && yarn build


FROM node:16 as RUNNER

RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential libcairo2-dev libpango1.0-dev \
  libjpeg-dev libgif-dev librsvg2-dev \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/bot
COPY --from=BUILDER /usr/src/bot/dist ./dist

COPY ./assets ./assets
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile \
  && yarn cache clean

CMD yarn start
