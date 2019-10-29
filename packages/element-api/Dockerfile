FROM node:10.16

WORKDIR /srv/api

COPY --chown=node:node package.json package-lock.json ./

RUN npm install --quiet
