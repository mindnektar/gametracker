FROM node:15.4.0-alpine as webpack

LABEL maintainer="Martin Denk <ausdenk@gmail.com>"

# Add Tini and bash
RUN apk add --no-cache tini bash busybox-extras python build-base yarn

ENV NODE_PATH /app/node_modules
ENV PATH $NODE_PATH/.bin:$PATH

# Have entrypoint for file_env
COPY docker/docker-entrypoint.sh /

RUN ["chmod", "+x", "/docker-entrypoint.sh"]
ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]

RUN npm install pm2 -g
RUN mkdir -p /app && mkdir -p /app/node_modules
RUN chown -R node:node /app
WORKDIR /app
USER node

ADD package.json /app/package.json
RUN yarn install
ADD . /app

EXPOSE 4000

CMD [ "yarn", "start" ]
