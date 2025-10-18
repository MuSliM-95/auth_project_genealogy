FROM node:20-alpine as build

COPY package.json package-lock.json

RUN npm ci

COPY . .

RUN npm build

CMD ["npm", "run", "start"]