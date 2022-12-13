FROM node:18-alpine as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./

RUN yarn install
COPY . ./
RUN yarn build
RUN yarn cache clean

FROM node:18-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production
COPY --from=build /app/dist /app/dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
