FROM node:10.16

RUN mkdir /srv/element-api && chown node:node /srv/element-api

USER node

WORKDIR /srv/element-api

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet
