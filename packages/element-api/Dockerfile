FROM node:10.16

RUN mkdir /srv/api && chown node:node /srv/api

USER node

WORKDIR /srv/api

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet
