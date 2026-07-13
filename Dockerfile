FROM node:22.13.1-alpine as webpack

LABEL maintainer="Martin Denk <ausdenk@gmail.com>"

# Add Tini and bash
RUN apk add --no-cache tini bash busybox-extras python3 build-base yarn

ENV NODE_PATH /app/node_modules
ENV PATH $NODE_PATH/.bin:$PATH

# Have entrypoint for file_env
COPY docker/docker-entrypoint.sh /

RUN ["chmod", "+x", "/docker-entrypoint.sh"]
ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]

RUN mkdir -p /app
RUN chown -R node:node /app

WORKDIR /app/client
RUN chown -R node:node /app/client
COPY --chown=node:node client/package.json /app/client/package.json
COPY --chown=node:node client/yarn.lock /app/client/yarn.lock
RUN yarn install --frozen-lockfile
COPY --chown=node:node client .
RUN node_modules/.bin/webpack --config webpack.config.prod.js
WORKDIR /app/server
RUN chown -R node:node /app/server
COPY --chown=node:node server/package.json /app/server/package.json
COPY --chown=node:node server/yarn.lock /app/server/yarn.lock
RUN yarn install --frozen-lockfile
COPY --chown=node:node server .

EXPOSE 4000

CMD [ "yarn", "start" ]
