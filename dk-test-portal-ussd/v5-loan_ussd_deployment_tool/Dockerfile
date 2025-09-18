FROM node:16.15-alpine3.14 as nodeEngine
WORKDIR /
COPY / ./
RUN npm install

CMD [ "node", "index.js" ]