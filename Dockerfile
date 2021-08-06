FROM node:16 AS BUILDER

WORKDIR /usr/src/bot
COPY . .

RUN yarn install --frozen-lockfile \
  && yarn cache clean \
  && yarn build


FROM node:16 as RUNNER

WORKDIR /usr/src/bot
COPY --from=BUILDER /usr/src/bot/dist ./dist

COPY ./assets ./assets
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile \
  && yarn cache clean

CMD yarn start
