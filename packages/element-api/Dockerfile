FROM node:10.16 as base

FROM base as deps
WORKDIR /usr/api
COPY package.json package-lock.json ./
RUN npm install

FROM base as api
WORKDIR /usr/api
COPY --from=deps /usr/app/node_modules /usr/app/node_modules
COPY . ./

CMD npm run start:standalone
