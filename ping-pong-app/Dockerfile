FROM node:24-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY index.js .

CMD ["node", "index.js"]
